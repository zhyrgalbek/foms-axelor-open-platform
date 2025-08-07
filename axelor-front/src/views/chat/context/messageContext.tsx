import React, { ReactNode, useContext, useReducer } from "react";
import { MessageType } from "../types/chatTypes";

interface ChatMessage {
    chatId: number;
    messages: MessageType[];
}

interface useChatMessageType {
    messageLoading: boolean;
    oldMessageLoading: boolean;
    sendMessageLoading: boolean;
    messages: ChatMessage[];
    messagesTotal: number | null;
    answerSelectMessage: MessageType | null;
}

type ChatMessageActionType =
    | { type: 'SET_OLD_MESSAGE_LOADING', payload: { value: boolean } }
    | { type: 'SET_SENDMESSAGE_LOADING', payload: { value: boolean } }
    | { type: 'SET_MESSAGE_LOADING', payload: { value: boolean } }
    | { type: 'SET_MESSAGES', payload: { value: ChatMessage[] } }
    | { type: 'SET_MESSAGES_TOTAL', payload: { value: number | null } }
    | { type: 'SET_ANSWER_SELECT_MESSAGE', payload: { value: MessageType | null } }

const initialState: useChatMessageType = {
    messageLoading: false,
    oldMessageLoading: false,
    sendMessageLoading: false,
    messages: [],
    messagesTotal: null,
    answerSelectMessage: null,
}

export const ChatMessageContext = React.createContext<| { state: useChatMessageType, dispatch: React.Dispatch<ChatMessageActionType> } | undefined>(undefined);

function reduce(state: useChatMessageType, action: ChatMessageActionType): useChatMessageType {
    switch (action.type) {
        case 'SET_OLD_MESSAGE_LOADING':
            return { ...state, messageLoading: action.payload.value };
        case 'SET_SENDMESSAGE_LOADING':
            return { ...state, oldMessageLoading: action.payload.value };
        case 'SET_MESSAGE_LOADING':
            return { ...state, sendMessageLoading: action.payload.value };
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload.value };
        case 'SET_MESSAGES_TOTAL':
            return { ...state, messagesTotal: action.payload.value };
        case 'SET_ANSWER_SELECT_MESSAGE':
            return { ...state, answerSelectMessage: action.payload.value };
        default:
            return state;
    }
}

export function ChatMessageProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reduce, initialState);
    return (
        <ChatMessageContext.Provider value={{ state, dispatch }}>
            {children}
        </ChatMessageContext.Provider>
    )
}

export function useChatMessage() {
    const context = useContext(ChatMessageContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}