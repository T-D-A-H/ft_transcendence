
// Dibujar background
export function drawBrackground(colour, canvas, paddle) {

    paddle.clearRect(0, 0, canvas.width, canvas.height);
    paddle.fillStyle = colour;
    paddle.fillRect(0, 0, canvas.width, canvas.height);
}

// Paleta jugador 1 (izquierda)
export function drawPlayerOne(colour, paddle, paddle1Y, paddle1X) {

    paddle.fillStyle = colour;
    paddle.fillRect(paddle1X, paddle1Y, 10, 60);
}

// Paleta jugador 2 (derecha)
export function drawPlayerTwo(colour, paddle, paddle2Y, paddle2X) {

    paddle.fillStyle = colour;
    paddle.fillRect(paddle2X, paddle2Y, 10, 60);
}