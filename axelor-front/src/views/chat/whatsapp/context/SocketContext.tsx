// import React, { act } from "react";
// import { ChatBoxVariant, MessageType, SocketStoreEventType } from "../types/chatTypes";
// const chat_url = import.meta.env.VITE_PROXY_CHAT_URL;
// const chat_key = import.meta.env.VITE_PROXY_CHAT_KEY
// interface ChatMessage {
//     chatId: number;
//     messages: MessageType[];
// }

// interface SocketContextType {
//     pingPong: string;
//     socket: any;
//     socketInterval: any;
//     type: any;

//     _hasRehydrated?: boolean;
// }

// type SocketContextActionType =
//     | { type: 'CLEAR_SOCKET' }
//     | { type: 'START_SOCKET', payload: { type: ChatBoxVariant } }
//     | { type: 'CLOSE_SOCKET' }
//     | { type: 'SEND_EVENT', payload: { value: SocketStoreEventType } }

// const initialState: SocketContextType = {
//     pingPong: "",
//     socket: null, //socket
//     socketInterval: null, //socket
//     type: null,
//     _hasRehydrated: false,
// }

// export const SocketContext = React.createContext<| { state: SocketContextType, dispatch: React.Dispatch<SocketContextActionType> } | undefined>(undefined);

// function reduce(state: SocketContextType, action: SocketContextActionType) {
//     switch (action.type) {
//         case 'CLEAR_SOCKET':
//             return { ...state, socket: null };
//         case 'CLOSE_SOCKET':
//             if (state.socket && state.socket?.readyState === WebSocket.OPEN) {
//                 state.socket?.close(1000);
//             }
//             return { ...state, socket: state.socket && state.socket?.readyState === WebSocket.OPEN };
//         case 'SEND_EVENT':
//             if (state.socket?.readyState === WebSocket.OPEN) {
//                 state.socket.send(JSON.stringify({ event: action.payload.value.event, data: action.payload.value.data }));
//             }
//             return state;
//         case 'START_SOCKET':
//             if (!state.socket || state.socket?.readyState !== WebSocket.OPEN) {
//                 let s = new WebSocket("wss://" + chat_url + "/ws?apiKey=" + chat_key);
//                 s.onopen = async function (event: any) {
//                     let data: any = JSON.parse(event.data);
//                     switch (data) {
//                         case "ping": {
//                             state.send
//                         }
//                     }
//                 }
//             }
//     }
// }