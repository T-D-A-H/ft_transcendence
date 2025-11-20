

export interface PaddleState {
    x: number;
    y: number;
    colour: string;
}

export const vars = {

	backgroundColour: "black",
	paddle1: { 
        x: 20, 
        y: 150, 
        colour: "white" 
    } as PaddleState,
	paddle2: { 
        x: 570, 
        y: 150, 
        colour: "white" 
    } as PaddleState,
};