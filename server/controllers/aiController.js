// server/controllers/aiController.js
// Handles AI book generation requests

const { generateBookContent, generateCaption } = require("../services/aiService");
const { getBookById, getPhotosByBook, updateBook } = require("../db/queries");
const db = require("../db");

// ─── GENERATE FULL BOOK WITH AI ───────────────────────────
const generateAIBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Get book details from database
    const bookResult = await getBookById(bookId);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    const book = bookResult.rows[0];

    // Get all photos for this book
    const photosResult = await getPhotosByBook(bookId);
    const photos = photosResult.rows;

    if (photos.length === 0) {
      return res.status(400).json({ error: "No photos uploaded yet" });
    }

    // Extract just the URLs to send to AI
    const photoUrls = photos.map((p) => p.image_url);

    // Call Claude AI to generate book content
    console.log(`Generating AI content for book ${bookId}...`);
    const aiContent = await generateBookContent(
      {
        title: book.title,
        destination: book.destination,
        travel_date_start: book.travel_date_start,
        travel_date_end: book.travel_date_end,
      },
      photoUrls
    );

    // Update cover photo in database
    const coverPhoto = photos[aiContent.cover_photo_index] || photos[0];

    await updateBook(bookId, {
      cover_image_url: coverPhoto.image_url,
      cover_subtitle: aiContent.cover_subtitle,
    });

    // Save AI captions to each photo
    for (let i = 0; i < photos.length; i++) {
      if (aiContent.captions[i]) {
        await db.query(
          "UPDATE photos SET caption = $1 WHERE id = $2",
          [aiContent.captions[i], photos[i].id]
        );
      }
    }

    // Create pages based on AI sections
    // First delete any existing pages
    await db.query("DELETE FROM pages WHERE book_id = $1", [bookId]);

    // Insert cover page first
    await db.query(
      "INSERT INTO pages (book_id, page_number, layout, section_title) VALUES ($1, $2, $3, $4)",
      [bookId, 0, "cover", book.title]
    );

    // Insert section pages
    for (let i = 0; i < aiContent.sections.length; i++) {
      const section = aiContent.sections[i];
      await db.query(
        "INSERT INTO pages (book_id, page_number, layout, section_title) VALUES ($1, $2, $3, $4)",
        [bookId, i + 1, section.layout, section.title]
      );
    }

    // Update photos with their page assignments
    for (let s = 0; s < aiContent.sections.length; s++) {
      const section = aiContent.sections[s];
      const pageResult = await db.query(
        "SELECT id FROM pages WHERE book_id = $1 AND page_number = $2",
        [bookId, s + 1]
      );
      const pageId = pageResult.rows[0]?.id;

      for (const photoIndex of section.photo_indices) {
        if (photos[photoIndex]) {
          await db.query(
            "UPDATE photos SET page_id = $1, position = $2 WHERE id = $3",
            [pageId, photoIndex, photos[photoIndex].id]
          );
        }
      }
    }

    // Mark book as complete
    await db.query(
      "UPDATE books SET status = $1 WHERE id = $2",
      ["complete", bookId]
    );

    // Return everything to frontend
    res.json({
      message: "AI book generated successfully! ✅",
      cover: {
        image_url: coverPhoto.image_url,
        subtitle: aiContent.cover_subtitle,
      },
      sections: aiContent.sections,
      captions: aiContent.captions,
      photos: photos,
    });

  } catch (err) {
    console.error("AI book generation error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── REGENERATE SINGLE CAPTION ────────────────────────────
const regenerateCaption = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { photoUrl, destination } = req.body;

    const caption = await generateCaption(photoUrl, destination);

    // Save new caption to database
    await db.query(
      "UPDATE photos SET caption = $1 WHERE id = $2",
      [caption, photoId]
    );

    res.json({ caption });
  } catch (err) {
    console.error("Regenerate caption error:", err.message);
    res.status(500).json({ error: "Failed to regenerate caption" });
  }
};

module.exports = { generateAIBook, regenerateCaption };