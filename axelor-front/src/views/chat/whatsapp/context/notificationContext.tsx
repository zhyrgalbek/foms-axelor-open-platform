import React, { ReactNode, useContext, useReducer } from "react";

interface NotificationContextType {
    newMessageTone: HTMLAudioElement | null;
    newMessageToneCollega: HTMLAudioElement | null;
}

type NotificationContextActionType =
    | { type: 'SET_NEW_MESSAGE_TONE', payload: { newAudio: HTMLAudioElement } }
    | { type: 'SET_NEW_MESSAGE_TONE_COLLEGA', payload: { newAudio: HTMLAudioElement } }

const initialState: NotificationContextType = {
    newMessageTone: null,
    newMessageToneCollega: null,
}

export const NotificationContext = React.createContext<| { state: NotificationContextType, dispatch: React.Dispatch<NotificationContextActionType> } | undefined>(undefined);

function reduce(state: NotificationContextType, action: NotificationContextActionType): NotificationContextType {
    switch (action.type) {
        case 'SET_NEW_MESSAGE_TONE':
            return { ...state, newMessageTone: action.payload.newAudio };
        case 'SET_NEW_MESSAGE_TONE_COLLEGA':
            return { ...state, newMessageToneCollega: action.payload.newAudio }
        default:
            return state;
    }
}

export function NotificationContextProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reduce, initialState);
    return (
        <NotificationContext.Provider value={{ state, dispatch }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}