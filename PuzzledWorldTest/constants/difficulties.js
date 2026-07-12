export const DIFFICULTIES = [
  {
    label: 'Beginner',
    pieces: 36,
    size: 6,
  },

  {
    label: 'Casual',
    pieces: 64,
    size: 8,
  },

  {
    label: 'Intermediate',
    pieces: 100,
    size: 10,
  },

  {
    label: 'Advanced',
    pieces: 144,
    size: 12,
  },

  {
    label: 'Master',
    pieces: 225,
    size: 15,
  },

  {
    label: 'Expert',
    pieces: 400,
    size: 20,
  },
];


export function labelForSize(size) {
  return DIFFICULTIES.find((level) => level.size === size)?.label ?? `${size}×${size}`;
}
