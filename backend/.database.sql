PRAGMA foreign_keys = ON;

-- 1. USUARIOS (Soporta Auth Local, OAuth 42/Google, Avatar y Stats Rápidas)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password TEXT,                       
    oauth_provider TEXT DEFAULT NULL,
    oauth_id TEXT DEFAULT NULL,
    avatar TEXT DEFAULT '/uploads/default.png',
    status TEXT DEFAULT 'offline',
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    elo INTEGER DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. RELACIONES SOCIALES (Amigos y Bloqueos)
CREATE TABLE relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',       -- 'PENDING', 'ACCEPTED' (Solo para amigos)
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, target_id)           -- No puedes ser amigo y bloquear a la vez
);

-- 3. HISTORIAL DE PARTIDAS (Cubre 'Match History', 'Customization' y 'AI')
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Jugadores
    player1_id INTEGER NOT NULL,
    player2_id INTEGER,                  -- NULL si es contra la IA (o usa un ID bot)
    
    -- Resultado
    score_p1 INTEGER NOT NULL,
    score_p2 INTEGER NOT NULL,
    winner_id INTEGER,                   -- NULL si empate (difícil en pong) o IA ganó
    
    -- Detalles del Módulo de Customización y AI
    game_mode TEXT DEFAULT 'CLASSIC',    -- 'CLASSIC', 'CUSTOM_MAP', 'POWER_UP'
    is_ai_match BOOLEAN DEFAULT 0,       -- 1 si jugó contra la IA
    
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. CHAT (Mensajes Directos e Invitaciones)
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,               -- El texto del mensaje
    
    is_game_invite BOOLEAN DEFAULT 0,    -- Si es true, muestra botón "Join Game"
    read BOOLEAN DEFAULT 0,              -- Para notificaciones de no leídos
    
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO users (username, display_name, email, password) VALUES 
('admin', 'admin', 'admin@gmail.com', '12345');