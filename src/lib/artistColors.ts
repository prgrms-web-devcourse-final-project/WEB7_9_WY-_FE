// Curated color palette for artist avatars
const ARTIST_COLORS = [
  '#7C3AED', // Violet
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#A855F7', // Fuchsia
  '#0EA5E9', // Sky
  '#22C55E', // Green
  '#E11D48', // Rose
];

/**
 * Converts an artist name to a consistent color from the curated palette
 * Uses a simple hash function to ensure the same name always gets the same color
 */
export function getArtistColor(name: string): string {
  if (!name) return ARTIST_COLORS[0];

  // Simple hash function based on character codes
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get an index
  const index = Math.abs(hash) % ARTIST_COLORS.length;
  return ARTIST_COLORS[index];
}

/**
 * Get a lighter version of the artist color for backgrounds
 */
export function getArtistColorLight(name: string, opacity: number = 0.15): string {
  const color = getArtistColor(name);
  // Convert hex to rgba with opacity
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export { ARTIST_COLORS };
