
import {show, hide, incomingPlayRequestText, incomingPlayRequestModal, incomingPlayRequestAcceptButton, startMatchButton } from "./ui.js"
import { replyToInvite } from "./send-events.js"

export interface StatusAndMsg {status: number; msg: string;}

interface SendInviteResponse      {type: "SEND_INVITE_RESPONSE"; status: number; to: string; msg: string;}
interface ReplyInviteResponse     {type: "REPLY_INVITE_RESPONSE"; status: number; to: string; msg: string;}
interface IncomingInviteRequest   {type: "INCOMING_INVITE_REQUEST"; from: string; msg: string;}
interface IncomingInviteResponse  {type: "INCOMING_INVITE_RESPONSE"; from: string; msg: string;}
interface StartMatchResponse      {type: "START_MATCH_RESPONSE"; status: number; msg: string;}
interface DrawMessage             {type: "DRAW"; playerY1: number; ballY: number, ballX: number, playerY2: number;};
// interface SearchMatchResponse {type: "SEARCH_MATCH_RESPONSE"; status: number; matches: string[];}

type ServerMessage = 
SendInviteResponse   | ReplyInviteResponse   |
IncomingInviteRequest | IncomingInviteResponse |
StartMatchResponse    | DrawMessage;


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

	incomingInviteRequestHandler(userSocket!);
	incomingInviteResponsesHandler();
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



function incomingInviteRequestHandler(userSocket: WebSocket) {

// IncomingInviteRequest  {type: "INCOMING_INVITE_REQUEST"; from: string; msg: string;}
	registerHandler("INCOMING_INVITE_REQUEST", (data) => {

        if (data.type !== "INCOMING_INVITE_REQUEST")
            return ;

		incomingPlayRequestText.textContent = data.msg;
		show(incomingPlayRequestModal);
		incomingPlayRequestAcceptButton.onclick = () => {
			replyToInvite(userSocket, data.from).then((result) => {

				if (!result) {
					alert("No response from server");
					return ;
				}
				const { status, msg } = result;
				// alert(msg);
				if (status === 200)
					show(startMatchButton);
			});
			hide(incomingPlayRequestModal);
		};
	}, false);
}



function incomingInviteResponsesHandler() {

// IncomingInviteResponse  {type: "INCOMING_INVITE_RESPONSE"; status: boolean; from: string; msg: string;}
	registerHandler("INCOMING_INVITE_RESPONSE", (data) => {

        if (data.type !== "INCOMING_INVITE_RESPONSE")
            return ;
		alert(data.msg);
		show(startMatchButton);
	}, false);
}







