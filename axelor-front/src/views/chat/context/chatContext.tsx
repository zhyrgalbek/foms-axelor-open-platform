import React, { ReactNode, useContext, useReducer } from "react";
import { ChatType, MemberType } from "../types/chatTypes";

export interface ChatContextType {
    chatloading: boolean;
    completedLoading: boolean;
    chat: ChatType;
    isTyping: MemberType[];
}

type ChatContextActionType =
    | { type: 'SET_CHAT_LOADING', payload: { value: boolean } }
    | { type: 'SET_COMPLETED_LOADING', payload: { value: boolean } }
    | { type: 'SET_CHAT', payload: { value: ChatType } }
    | { type: 'SET_IS_TYPING', payload: { value: MemberType[] } }

const initialState: ChatContextType = {
    chatloading: false,
    completedLoading: false,
    chat: null,
    isTyping: [],
}

export const ChatContext = React.createContext<| { state: ChatContextType, dispatch: React.Dispatch<ChatContextActionType> } | undefined>(undefined);

function reduce(state: ChatContextType, action: ChatContextActionType): ChatContextType {
    switch (action.type) {
        case 'SET_CHAT_LOADING':
            return { ...state, chatloading: action.payload.value };
        case 'SET_COMPLETED_LOADING':
            return { ...state, completedLoading: action.payload.value };
        case 'SET_CHAT':
            return { ...state, chat: action.payload.value };
        case 'SET_IS_TYPING':
            return { ...state, isTyping: action.payload.value };
        default:
            return state;
    }
}

export function ChatContextProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reduce, initialState);
    return (
        <ChatContext.Provider value={{ state, dispatch }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a useChatContextProvider");
    }
    return context;
}