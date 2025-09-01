import React, { ReactNode, useContext, useReducer } from "react";
import { ClientType, ColleaguesType } from "../types/chatTypes";

export interface useChatsStoreType {
    addClientLoading: boolean;
    chats: [ClientType[], ColleaguesType[]];
    chatsLoading: boolean;
    selectedContactGroup: number;
}

export const ChatsContext = React.createContext<| { state: useChatsStoreType, dispatch: React.Dispatch<ChatsContextActionType> } | undefined>(undefined);

type ChatsContextActionType =
    | { type: 'SET_ADD_CLIENT_LOADING', payload: { value: boolean } }
    | { type: 'SET_CHATS_LOADING', payload: { value: boolean } }
    | { type: 'SET_SELECTED_CONTACT_GROUPS', payload: { value: number } }
    | { type: 'SET_CHATS', payload: { value: [ClientType[], ColleaguesType[]] } }

const initialState: useChatsStoreType = {
    addClientLoading: false,
    chats: [[], []],
    chatsLoading: false,
    selectedContactGroup: 0,
}

function reduce(state: useChatsStoreType, action: ChatsContextActionType): useChatsStoreType {
    switch (action.type) {
        case 'SET_ADD_CLIENT_LOADING':
            return { ...state, addClientLoading: action.payload.value };
        case 'SET_CHATS_LOADING':
            return { ...state, chatsLoading: action.payload.value };
        case 'SET_SELECTED_CONTACT_GROUPS':
            return { ...state, selectedContactGroup: action.payload.value };
        case 'SET_CHATS':
            return { ...state, chats: action.payload.value };
        default:
            return state;
    }
}

export function ChatsContextProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reduce, initialState);
    return (
        <ChatsContext.Provider value={{ state, dispatch }}>
            {children}
        </ChatsContext.Provider>
    )
}

export function useChatsContext() {
    const context = useContext(ChatsContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatsContextProvider");
    }
    return context;
}