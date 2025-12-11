

interface SendInviteResponse         {type: "SEND_INVITE_RESPONSE"; status: number; to: string; msg: string;}
interface ReplyInviteResponse        {type: "REPLY_INVITE_RESPONSE"; status: number; to: string; msg: string;}
interface IncomingInviteRequest      {type: "INCOMING_INVITE_REQUEST"; from: string; msg: string;}
interface IncomingInviteResponse     {type: "INCOMING_INVITE_RESPONSE"; from: string; msg: string;}
interface StartMatchResponse         {type: "START_MATCH_RESPONSE"; status: number; msg: string;}
interface DrawMessage                {type: "DRAW"; LeftXY: [number, number]; RightXY: [number, number]; BallXY: [number, number];}
interface DisconnectMsg  			 {type: "DISCONNECT"; msg: string;}
interface PlayLocallyResponse 		 {type: "PLAY_LOCALLY_RESPONSE", status: number; msg: string;}

interface IncomingTournamentResponse {type: "INCOMING_TOURNAMENT_RESPONSE"; status: number; msg: string;}
interface CreateTournamentResponse   {type: "CREATE_TOURNAMENT_RESPONSE"; status: number; msg: string;}
interface SearchTournamentResponse   {type: "SEARCH_TOURNAMENT_RESPONSE"; status: number; tournaments: string[];}
interface JoinTournamentResponse     {type: "JOIN_TOURNAMENT_RESPONSE"; status: number; msg: string;}
interface StartTournamentResponse    {type: "START_TOURNAMENT_RESPONSE"; status: number; msg: string;}


type ServerMessage = 
SendInviteResponse         | ReplyInviteResponse      |
IncomingInviteRequest      | IncomingInviteResponse   |
StartMatchResponse         | StartTournamentResponse  |
CreateTournamentResponse   | SearchTournamentResponse |
IncomingTournamentResponse | JoinTournamentResponse   |
PlayLocallyResponse		   |
DrawMessage				   | DisconnectMsg;
// luuismrtn

const handlers: Record<string, ((data: ServerMessage) => void)[]> = {};

export function registerHandler<T extends ServerMessage>(type: T["type"], fn: (data: T) => void, oneTime = true) {

	if (!handlers[type])
		handlers[type] = [];

	if (oneTime) {
		const wrapped = (data: ServerMessage) => {
			fn(data as T);
			handlers[type] = handlers[type].filter(h => h !== wrapped);
		};
		handlers[type].push(wrapped);
	} else {

		handlers[type].push(fn as (data: ServerMessage) => void);
	}
}


export function receiveMessages(userSocket: WebSocket) {

	userSocket.addEventListener("message", (event: MessageEvent) => {

		let data: ServerMessage;
		try { 
			data = JSON.parse(event.data); 
		} catch { 

			return; 
		}
		const fns = handlers[data.type];
		if (fns)
			fns.slice().forEach(fn => fn(data));
	});
}






