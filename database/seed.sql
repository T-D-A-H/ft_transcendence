PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO users (id, username, display_name, email, password)
VALUES
  (1, 'Luis', 'Luis', 'luis@gmail.com', 'a'),
  (2, 'Pepe', 'Pepe', 'pepe@gmail.com', 'a'),
  (3, 'José', 'José', 'jose@gmail.com', 'a');

INSERT INTO matches (player1_id, player2_id, score_p1, score_p2, winner_id, game_mode, is_ai_match)
VALUES
    (1, 2, 5, 3, 1, 'CLASSIC', 0),
    (1, 0, 5, 4, 1, 'CLASSIC', 1),
    (2, 1, 2, 5, 1, 'CLASSIC', 0),
    (2, 3, 5, 1, 2, 'CLASSIC', 0),
    (3, 1, 4, 5, 1, 'CLASSIC', 0),
    (1, 3, 5, 0, 1, 'CLASSIC', 0),
    (3, 2, 2, 5, 2, 'CLASSIC', 0),
    (2, 1, 5, 4, 2, 'CLASSIC', 0),
    (1, 2, 3, 5, 2, 'CLASSIC', 0),
    (3, 1, 5, 2, 3, 'CLASSIC', 0),
    (2, 3, 1, 5, 3, 'CLASSIC', 0),
    (1, 3, 5, 3, 1, 'CLASSIC', 0),
    (3, 2, 5, 4, 3, 'CLASSIC', 0),
    (2, 1, 5, 0, 2, 'CLASSIC', 0),
    (1, 2, 4, 5, 2, 'CLASSIC', 0),
    (3, 1, 3, 5, 1, 'CLASSIC', 0),
    (2, 3, 5, 2, 2, 'CLASSIC', 0),
    (1, 3, 2, 5, 3, 'CLASSIC', 0),
    (3, 2, 4, 5, 2, 'CLASSIC', 0),
    (2, 1, 3, 5, 1, 'CLASSIC', 0),
    (1, 2, 5, 1, 1, 'CLASSIC', 0),
    (3, 1, 5, 4, 3, 'CLASSIC', 0),
    (2, 3, 4, 5, 3, 'CLASSIC', 0);
