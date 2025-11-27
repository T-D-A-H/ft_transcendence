class User {
    constructor({ id, username, display_name, socket }) {
        this.id = id;
        this.username = username;
        this.display_name = display_name;
        this.socket = socket;
        this.score = 0;
        this.isConnected = false;
    }

    // Enviar mensaje al jugador vía WebSocket
    send(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify(message));
        }
    }

    // Actualizar puntaje
    updateScore(points) {
        this.score += points;
    }

    // Marcar desconexión
    disconnect() {
        this.isConnected = false;
        this.socket = null;
    }

    connect(socket) {
        this.isConnected = true;
        this.socket = socket;
    }

    // Marcar reconexión
    reconnect(socket) {
        this.isConnected = true;
        this.socket = socket;
    }

    setConnected(isConnected) {
        this.isConnected = true;
    }
}

module.exports = User;