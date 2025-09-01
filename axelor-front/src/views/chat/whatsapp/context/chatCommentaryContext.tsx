import React, { ReactNode, useReducer } from "react";
import { MessageType } from "../types/chatTypes";

export enum CommentaryVariant {
    sendCommentary = "sendCommentary",
    updateCommentary = "updateCommentary",
}

export interface ChatCommentaryType {
    openChatCommentary: boolean;
    message: MessageType | null;
    commentary: string;
    variant: CommentaryVariant | null;
}

type ChatCommentaryActionType =
    | { type: 'SET_COMMENTARY', payload: { value: string } }
    | { type: 'SET_MESSAGE', payload: { value: string } }
    | { type: 'OPEN_CHAT_COMMENTARY', payload: { variant: CommentaryVariant, message?: MessageType } }
    | { type: 'CLOSE_CHAT_COMMENTARY' }

const initialState: ChatCommentaryType = {
    openChatCommentary: false,
    message: null,
    commentary: "",
    variant: null,
}

export const ChatCommentaryContext = React.createContext<| { state: ChatCommentaryType, dispatch: React.Dispatch<ChatCommentaryActionType> } | undefined>(undefined);

function reduce(state: ChatCommentaryType, action: ChatCommentaryActionType): ChatCommentaryType {
    switch (action.type) {
        case 'SET_COMMENTARY':
            return { ...state, commentary: action.payload.value }
        case 'SET_MESSAGE':
            return { ...state, message: state.message ? { ...state.message, body: action.payload.value } : null };
        case 'OPEN_CHAT_COMMENTARY':
            return { ...state, openChatCommentary: true, variant: action.payload.variant, message: action.payload.message ? action.payload.message : state.message };
        case 'CLOSE_CHAT_COMMENTARY':
            return { ...state, openChatCommentary: false, commentary: "", variant: null, message: null };
        default:
            return state;
    }
}

export function ChatCommentaryProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reduce, initialState);
    return (
        <ChatCommentaryContext.Provider value={{ state, dispatch }}>
            {children}
        </ChatCommentaryContext.Provider>
    )
}