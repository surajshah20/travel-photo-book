// server/controllers/aiController.js

const db = require("../db");
const { generateAIBook, regenerateCaption } = require("../services/aiService");

// ─── Generate AI Book ─────────────────────────────────────
const generateAIBookHandler = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Get book and verify ownership
    const bookResult = await db.query(
      "SELECT * FROM books WHERE id = $1 AND user_id = $2",
      [bookId, userId]
    );
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    const book = bookResult.rows[0];

    // 2. Get photos
    const photosResult = await db.query(
      "SELECT * FROM photos WHERE book_id = $1 ORDER BY id ASC",
      [bookId]
    );
    const photos = photosResult.rows;

    if (photos.length === 0) {
      return res.status(400).json({ error: "Please upload at least one photo first" });
    }

    // 3. Get template style
    let templateStyle = "modern";
    if (book.template_id) {
      const templateResult = await db.query(
        "SELECT style FROM templates WHERE id = $1",
        [book.template_id]
      );
      if (templateResult.rows.length > 0) {
        templateStyle = templateResult.rows[0].style;
      }
    }

    // 4. Run Smart Auto-Create
    const result = await generateAIBook(book, photos, templateStyle);

    // 5. Update book cover + style
    await db.query(
      `UPDATE books 
       SET cover_image_url = $1, cover_subtitle = $2, 
           color_scheme = $3, font_style = $4, updated_at = NOW()
       WHERE id = $5`,
      [
        result.cover.image_url,
        result.cover.subtitle,
        result.color_scheme,
        result.font_style,
        bookId,
      ]
    );

    // 6. Delete existing pages for this book
    await db.query("DELETE FROM pages WHERE book_id = $1", [bookId]);

    // 7. Insert cover page
    await db.query(
      `INSERT INTO pages (book_id, page_number, layout, section_title)
       VALUES ($1, 0, 'cover', 'Cover')`,
      [bookId]
    );

    // 8. Insert section pages + assign captions to photos
    for (let i = 0; i < result.sections.length; i++) {
      const section = result.sections[i];

      const pageResult = await db.query(
        `INSERT INTO pages (book_id, page_number, layout, section_title)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [bookId, i + 1, section.layout, section.title]
      );
      const pageId = pageResult.rows[0].id;

      // Assign photos to this page and save captions
      for (let j = 0; j < section.photos.length; j++) {
        const photo = section.photos[j];
        const caption = section.captions[j] || "";
        await db.query(
          "UPDATE photos SET page_id = $1, caption = $2 WHERE id = $3",
          [pageId, caption, photo.id]
        );
      }
    }

    res.json(result);

  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ error: "AI generation failed. Please try again." });
  }
};

// ─── Regenerate Caption ───────────────────────────────────
const regenerateCaptionHandler = async (req, res) => {
  const { photoId } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT p.*, b.destination, b.book_type 
       FROM photos p 
       JOIN books b ON p.book_id = b.id 
       WHERE p.id = $1 AND b.user_id = $2`,
      [photoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const { destination, book_type } = result.rows[0];
    const caption = regenerateCaption(destination, book_type, Math.floor(Math.random() * 10));

    res.json({ caption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to regenerate caption" });
  }
};

module.exports = { generateAIBook: generateAIBookHandler, regenerateCaption: regenerateCaptionHandler };