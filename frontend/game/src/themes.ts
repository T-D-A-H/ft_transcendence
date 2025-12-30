export interface BoardTheme {
  name: string;
  background: string;
  paddle: string;
  ball: string;
  centerLine?: string;
  glow?: boolean;
}

export const BOARD_THEMES: Record<string, BoardTheme> = {
  classic: {
    name: "Classic",
    background: "#000000",
    paddle: "#FFFFFF",
    ball: "#FFFFFF",
    centerLine: "#444444",
    glow: false,
  },
  neon: {
    name: "Neon",
    background: "#0a0a1a",
    paddle: "#00FFFF",
    ball: "#FF00FF",
    centerLine: "#FF00FF",
    glow: true,
  },
  matrix: {
    name: "Matrix",
    background: "#000000",
    paddle: "#00FF00",
    ball: "#00FF00",
    centerLine: "#003300",
    glow: true,
  },
  sunset: {
    name: "Sunset",
    background: "#1a0a1a",
    paddle: "#FF6B35",
    ball: "#9B59B6",
    centerLine: "#E74C3C",
    glow: true,
  },
  ocean: {
    name: "Ocean",
    background: "#001f3f",
    paddle: "#00BFFF",
    ball: "#87CEEB",
    centerLine: "#004080",
    glow: true,
  },
  retro: {
    name: "Retro",
    background: "#1a1a0a",
    paddle: "#FFB000",
    ball: "#FFD700",
    centerLine: "#664400",
    glow: false,
  },
};

export function getTheme(themeName: string): BoardTheme {
  return BOARD_THEMES[themeName] || BOARD_THEMES.classic;
}
