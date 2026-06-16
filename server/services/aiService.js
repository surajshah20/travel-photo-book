// server/services/aiService.js
// BlushBook — Smart Auto-Create Engine
// No paid AI API needed — intelligent template logic
// Architecture ready for OpenAI/Gemini/Claude swap-in

// ─── Book Type Configs ────────────────────────────────────
// Each book type produces a meaningfully different result
const BOOK_TYPE_CONFIGS = {
  journal: {
    maxPhotosPerSection: 2,
    sectionStyle: "diary",
    coverStyle: "minimal",
    layoutSequence: ["single", "single", "text_focus"],
    captionStyle: "personal",        // first-person, reflective
    fontStyle: "serif",
    colorScheme: "amber",
    pageSections: ["Arrival", "Exploration", "Reflections", "Memories"],
  },
  scrapbook: {
    maxPhotosPerSection: 4,
    sectionStyle: "collage",
    coverStyle: "bold",
    layoutSequence: ["grid_2x2", "single", "grid_2x2", "panorama"],
    captionStyle: "adventurous",     // energetic, short
    fontStyle: "modern",
    colorScheme: "green",
    pageSections: ["The Journey Begins", "Adventures", "Highlights", "Best Moments"],
  },
  hardcover: {
    maxPhotosPerSection: 3,
    sectionStyle: "editorial",
    coverStyle: "premium",
    layoutSequence: ["single", "grid_1x2", "single", "grid_1x2"],
    captionStyle: "editorial",       // elegant, descriptive
    fontStyle: "serif",
    colorScheme: "rose",
    pageSections: ["Introduction", "Day by Day", "Special Moments", "Farewell"],
  },
  luxury: {
    maxPhotosPerSection: 2,
    sectionStyle: "magazine",
    coverStyle: "dramatic",
    layoutSequence: ["single", "single", "panorama", "single"],
    captionStyle: "poetic",          // lyrical, evocative
    fontStyle: "serif",
    colorScheme: "purple",
    pageSections: ["Prelude", "The Experience", "Impressions", "Legacy"],
  },
};

// ─── Template Configs ─────────────────────────────────────
const TEMPLATE_CONFIGS = {
  modern: {
    colorScheme: "gray",
    fontStyle: "modern",
    captionPrefix: "",
    sectionDivider: "minimal",
  },
  vintage: {
    colorScheme: "amber",
    fontStyle: "serif",
    captionPrefix: "~ ",
    sectionDivider: "ornate",
  },
  luxury: {
    colorScheme: "purple",
    fontStyle: "serif",
    captionPrefix: "",
    sectionDivider: "elegant",
  },
  scrapbook: {
    colorScheme: "green",
    fontStyle: "modern",
    captionPrefix: "📍 ",
    sectionDivider: "playful",
  },
  journal: {
    colorScheme: "amber",
    fontStyle: "serif",
    captionPrefix: "Day Note: ",
    sectionDivider: "handwritten",
  },
};

// ─── Caption Generators ───────────────────────────────────
// Destination-aware, style-aware captions
const generateCaption = (index, destination, style, sectionTitle) => {
  const dest = destination || "this beautiful place";

  const captions = {
    personal: [
      `One of my favourite moments in ${dest}`,
      `I'll never forget this view`,
      `This is what ${dest} looked like through my eyes`,
      `A quiet moment I want to remember forever`,
      `${dest} surprised me in the best way here`,
      `Exactly how I imagined ${dest} would feel`,
    ],
    adventurous: [
      `${dest} delivered — absolutely incredible`,
      `No filter needed in ${dest}`,
      `This is what adventure looks like`,
      `${dest} at its finest`,
      `Worth every step to get here`,
      `The kind of moment you come to ${dest} for`,
    ],
    editorial: [
      `${dest} — a study in light and shadow`,
      `The architecture of ${dest} tells its own story`,
      `An afternoon well spent in ${dest}`,
      `${dest} reveals itself slowly to those who look`,
      `The light in ${dest} has a quality unlike anywhere else`,
      `${dest} through the lens of a wanderer`,
    ],
    poetic: [
      `${dest} whispers its secrets only to those who slow down`,
      `Time moved differently here`,
      `In ${dest}, even silence has a texture`,
      `A moment suspended between arrival and departure`,
      `The world felt infinite in ${dest}`,
      `${dest} — where memory begins`,
    ],
  };

  const pool = captions[style] || captions.editorial;
  return pool[index % pool.length];
};

// ─── Cover Subtitle Generator ─────────────────────────────
const generateSubtitle = (destination, bookType) => {
  const subtitles = {
    journal: `A personal diary from ${destination || "my travels"}`,
    scrapbook: `Adventures & memories from ${destination || "the road"}`,
    hardcover: `A journey through ${destination || "beautiful places"}`,
    luxury: `An intimate portrait of ${destination || "a journey"}`,
  };
  return subtitles[bookType] || `Memories from ${destination || "my travels"}`;
};

// ─── Smart Cover Selection ────────────────────────────────
// Picks the best cover photo based on position heuristics
const selectBestCoverIndex = (photoCount) => {
  if (photoCount <= 0) return 0;
  if (photoCount <= 5) return 0;
  // For larger sets, the "hero" shot is often taken mid-journey
  return Math.floor(photoCount * 0.3);
};

// ─── Layout Assignment ────────────────────────────────────
const assignLayout = (sectionIndex, photoCount, bookType) => {
  const config = BOOK_TYPE_CONFIGS[bookType] || BOOK_TYPE_CONFIGS.hardcover;
  const sequence = config.layoutSequence;
  return sequence[sectionIndex % sequence.length];
};

// ─── Main Generator ───────────────────────────────────────
const generateAIBook = async (book, photos, templateStyle) => {
  const bookType = book.book_type || "hardcover";
  const typeConfig = BOOK_TYPE_CONFIGS[bookType] || BOOK_TYPE_CONFIGS.hardcover;
  const templateConfig = TEMPLATE_CONFIGS[templateStyle] || TEMPLATE_CONFIGS.modern;

  // Merge: template overrides type defaults where applicable
  const colorScheme = templateConfig.colorScheme || typeConfig.colorScheme;
  const fontStyle = templateConfig.fontStyle || typeConfig.fontStyle;
  const captionStyle = typeConfig.captionStyle;
  const destination = book.destination || "";
  const sectionNames = typeConfig.pageSections;
  const maxPerSection = typeConfig.maxPhotosPerSection;

  // Select best cover
  const coverIndex = selectBestCoverIndex(photos.length);
  const coverPhoto = photos[coverIndex] || photos[0];
  const subtitle = generateSubtitle(destination, bookType);

  // Distribute photos across sections
  const nonCoverPhotos = photos.filter((_, i) => i !== coverIndex);
  const sections = [];

  sectionNames.forEach((sectionTitle, sIdx) => {
    const start = sIdx * maxPerSection;
    const sectionPhotos = nonCoverPhotos.slice(start, start + maxPerSection);
    if (sectionPhotos.length === 0) return;

    const layout = assignLayout(sIdx, sectionPhotos.length, bookType);
    const captions = sectionPhotos.map((_, pIdx) =>
      templateConfig.captionPrefix +
      generateCaption(sIdx * maxPerSection + pIdx, destination, captionStyle, sectionTitle)
    );

    sections.push({
      title: sectionTitle,
      layout,
      photo_indices: sectionPhotos.map((p) => p.id),
      captions,
      photos: sectionPhotos,
    });
  });

  // Handle overflow photos (more photos than sections can hold)
  const handledCount = sections.length * maxPerSection;
  if (nonCoverPhotos.length > handledCount) {
    const overflowPhotos = nonCoverPhotos.slice(handledCount);
    const chunks = [];
    for (let i = 0; i < overflowPhotos.length; i += maxPerSection) {
      chunks.push(overflowPhotos.slice(i, i + maxPerSection));
    }
    chunks.forEach((chunk, i) => {
      const layout = assignLayout(sections.length + i, chunk.length, bookType);
      sections.push({
        title: `More Memories ${i + 1}`,
        layout,
        photo_indices: chunk.map((p) => p.id),
        captions: chunk.map((_, pIdx) =>
          templateConfig.captionPrefix +
          generateCaption(handledCount + i * maxPerSection + pIdx, destination, captionStyle, "More Memories")
        ),
        photos: chunk,
      });
    });
  }

  // Generate all captions flat (for the response)
  const allCaptions = photos.map((_, i) =>
    templateConfig.captionPrefix +
    generateCaption(i, destination, captionStyle, "")
  );

  return {
    cover: {
      image_url: coverPhoto?.image_url || "",
      subtitle,
      color_scheme: colorScheme,
      font_style: fontStyle,
    },
    sections,
    captions: allCaptions,
    photos,
    book_type: bookType,
    color_scheme: colorScheme,
    font_style: fontStyle,
  };
};

// ─── Regenerate Single Caption ────────────────────────────
const regenerateCaption = (destination, bookType, index) => {
  const typeConfig = BOOK_TYPE_CONFIGS[bookType] || BOOK_TYPE_CONFIGS.hardcover;
  return generateCaption(index, destination, typeConfig.captionStyle, "");
};

module.exports = { generateAIBook, regenerateCaption };