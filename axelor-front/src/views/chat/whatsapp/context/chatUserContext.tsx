import React, { ReactNode, useContext } from "react";
import { useEffect, useReducer } from "react";

export interface ChatUserContextType {
    currentUserId: {
        id: number;
    } | null;
}

const context = import.meta.env.VITE_PROXY_CONTEXT;

export type ChatUserContextAction =
    | {
        type: 'GET_CURRENT_USER_ID', payload: {
            value: {
                id: number;
            } | null
        }
    }

const initialState: ChatUserContextType = {
    currentUserId: null,
}

function reducer(state: ChatUserContextType, action: ChatUserContextAction): ChatUserContextType {
    switch (action.type) {
        case 'GET_CURRENT_USER_ID':
            return { ...state, currentUserId: action.payload.value };
        default:
            return state;
    }
}

const ChatUserContext = React.createContext<| { state: ChatUserContextType; dispatch: React.Dispatch<ChatUserContextAction> } | undefined>(undefined);

function ChatUserContextHookReducer() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        async function getCurrentUserId() {
            try {
                const response = await fetch(`${context}/ws/user/id`);
                if (response.status === 200) {
                    const jsonData = await response.json();
                    console.log("jsonData: ", jsonData)
                    const currentUser = jsonData.data;
                    dispatch({ type: 'GET_CURRENT_USER_ID', payload: { value: currentUser } })
                } else {
                    throw new Error(`${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`Ну удалось получить текущего пользователя!`);
            }
        }
        getCurrentUserId();
    }, []);

    return { state, dispatch };
}

export function ChatUserContextProvider({ children }: { children: ReactNode }) {
    const value = ChatUserContextHookReducer();
    return (
        <ChatUserContext.Provider value={value}>
            {children}
        </ChatUserContext.Provider>
    )
}

export function useChatUserContext() {
    const context = useContext(ChatUserContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}