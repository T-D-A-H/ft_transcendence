export type BoardTheme = {
  id: string;
  name: string;
  className: string;
};

export const boardThemes: BoardTheme[] = [
  { id: "default", name: "Classic", className: "pong-board-theme-default" },
  { id: "dark", name: "Dark", className: "pong-board-theme-dark" },
  { id: "winter", name: "Winter", className: "pong-board-theme-winter" },
  { id: "savanna", name: "Savanna", className: "pong-board-theme-savanna" },
  { id: "neon", name: "Neon", className: "pong-board-theme-neon" },
  { id: "ocean", name: "Ocean", className: "pong-board-theme-ocean" },
  { id: "forest", name: "Forest", className: "pong-board-theme-forest" },
];