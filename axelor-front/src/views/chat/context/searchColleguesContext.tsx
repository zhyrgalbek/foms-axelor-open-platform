import React, { ReactNode, useContext, useReducer } from "react";
import { ClientContactType, DepartMentType, addChatContactsType } from "../types/chatTypes";

interface SearchColleguesContextType {
    transferLoading: boolean;
    contacts: addChatContactsType | null;
    departMents: DepartMentType[];
    clients: ClientContactType[];
    searchLoading: boolean;
}

type SearchColleguesContextActionType =
    | { type: 'SET_SEARCH_LOADING', payload: { value: boolean } }
    | { type: 'SET_TRANSFER_LOADING', payload: { value: boolean } }
    | { type: 'SET_CONTACTS', payload: { value: addChatContactsType | null } }
    | { type: 'SET_DEPARTMENTS', payload: { value: DepartMentType[] } }
    | { type: 'SET_CLIENTS', payload: { value: ClientContactType[] } }

const initialState: SearchColleguesContextType = {
    transferLoading: false,
    contacts: null,
    departMents: [],
    clients: [],
    searchLoading: false,
}

export const SearchColleguesContext = React.createContext<| { state: SearchColleguesContextType, dispatch: React.Dispatch<SearchColleguesContextActionType> } | undefined>(undefined);

function reduce(state: SearchColleguesContextType, action: SearchColleguesContextActionType) {
    switch (action.type) {
        case 'SET_CLIENTS':
            return { ...state, clients: action.payload.value, searchLoading: false };
        case 'SET_CONTACTS':
            return { ...state, contacts: action.payload.value, searchLoading: false };
        case 'SET_DEPARTMENTS':
            return { ...state, departMents: action.payload.value, searchLoading: false };
        case 'SET_SEARCH_LOADING':
            return { ...state, searchLoading: action.payload.value };
        case 'SET_TRANSFER_LOADING':
            return { ...state, transferLoading: action.payload.value };
        default:
            return state;
    }
}

export function SearchColleguesContextProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reduce, initialState);
    return (
        <SearchColleguesContext.Provider value={{ state, dispatch }}>
            {children}
        </SearchColleguesContext.Provider>
    )
}

export function useSearchColleguesContext() {
    const context = useContext(SearchColleguesContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}