export const PATTERN_CONFIG = {
  size: 8,
  opacity: 0.5,
  strokeWidth: 3,
} as const;

export const createPattern = (color: string, element: string) => `
  <rect width="${PATTERN_CONFIG.size}" height="${PATTERN_CONFIG.size}" fill="${color}" />
  <g opacity="${PATTERN_CONFIG.opacity}">
    ${element}
  </g>
`;
