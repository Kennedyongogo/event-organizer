export const ARTIST_GENRE_SUGGESTIONS = [
  "Hip Hop",
  "R&B",
  "Afro-pop",
  "Afrobeats",
  "Benga",
  "Gospel",
  "Jazz",
  "Electronic",
  "House",
  "Reggae",
  "Dancehall",
  "Rock",
  "Comedy",
  "Spoken Word",
  "Classical",
  "Country",
  "Soul",
  "Folk",
];

export const parseArtistGenres = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parseArtistGenres(parsed) : [];
      } catch {
        return trimmed
          .split(/[,;/|]+/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return trimmed
      .split(/[,;/|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const formatGenresDisplay = (value) => parseArtistGenres(value).join(" / ");
