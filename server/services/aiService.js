// server/services/aiService.js
// Simulated AI service — generates realistic book content
// Can be swapped with real AI (Gemini/Claude) later with just 2 line changes

// ─── HELPER: Generate captions based on destination ───────
const generateCaptionForPhoto = (index, destination) => {
  const captions = [
    `A breathtaking moment captured in the heart of ${destination}.`,
    `The beauty of ${destination} in its purest form.`,
    `Every corner of ${destination} tells a different story.`,
    `Lost in the magic of ${destination}.`,
    `${destination} — a place that stays with you forever.`,
    `Discovering hidden gems in ${destination}.`,
    `The colors of ${destination} are unlike anything else.`,
    `A memory from ${destination} that will last a lifetime.`,
    `Soaking in the atmosphere of ${destination}.`,
    `${destination} at its most beautiful.`,
    `Wandering through the streets of ${destination}.`,
    `The people, the food, the life of ${destination}.`,
    `Sunset in ${destination} — absolutely unforgettable.`,
    `A quiet moment in the bustling ${destination}.`,
    `${destination} from a different perspective.`,
  ];

  // Cycle through captions based on photo index
  return captions[index % captions.length];
};

// ─── HELPER: Generate sections based on photo count ───────
const generateSections = (photoCount, destination) => {
  const sectionTemplates = [
    { title: `Arrival in ${destination}`, maxPhotos: 3 },
    { title: `Exploring ${destination}`, maxPhotos: 4 },
    { title: "Hidden Gems & Local Life", maxPhotos: 3 },
    { title: "Highlights & Memories", maxPhotos: 4 },
    { title: "Final Days & Farewell", maxPhotos: 3 },
  ];

  const sections = [];
  let photoIndex = 0;
  let sectionIndex = 0;

  while (photoIndex < photoCount && sectionIndex < sectionTemplates.length) {
    const template = sectionTemplates[sectionIndex];
    const remainingPhotos = photoCount - photoIndex;
    const photosInSection = Math.min(template.maxPhotos, remainingPhotos);

    if (photosInSection === 0) break;

    const photoIndices = [];
    for (let i = 0; i < photosInSection; i++) {
      photoIndices.push(photoIndex + i);
    }

    sections.push({
      title: template.title,
      photo_indices: photoIndices,
      layout: photosInSection >= 3 ? "grid" : "single",
    });

    photoIndex += photosInSection;
    sectionIndex++;
  }

  return sections;
};

// ─── GENERATE FULL BOOK CONTENT ───────────────────────────
const generateBookContent = async (tripInfo, photoUrls) => {
  const { destination } = tripInfo;

  // Simulate AI thinking time (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const photoCount = photoUrls.length;

  // Pick the middle photo as cover (usually a good shot)
  const coverIndex = Math.floor(photoCount / 2);

  // Generate captions for all photos
  const captions = photoUrls.map((_, index) =>
    generateCaptionForPhoto(index, destination)
  );

  // Generate sections
  const sections = generateSections(photoCount, destination);

  // Generate subtitle
  const subtitles = [
    `A journey through ${destination}`,
    `Memories from ${destination}`,
    `Adventures in ${destination}`,
    `Exploring the beauty of ${destination}`,
    `A travel story from ${destination}`,
  ];
  const cover_subtitle = subtitles[Math.floor(Math.random() * subtitles.length)];

  return {
    cover_photo_index: coverIndex,
    cover_subtitle,
    sections,
    captions,
  };
};

// ─── GENERATE SINGLE CAPTION ──────────────────────────────
const generateCaption = async (photoUrl, destination) => {
  // Simulate thinking time
  await new Promise((resolve) => setTimeout(resolve, 500));

  const captions = [
    `A beautiful moment captured in ${destination}.`,
    `The magic of ${destination} on full display.`,
    `${destination} never looked so beautiful.`,
    `A memory worth keeping from ${destination}.`,
    `The soul of ${destination} in one frame.`,
  ];

  return captions[Math.floor(Math.random() * captions.length)];
};

module.exports = { generateBookContent, generateCaption };