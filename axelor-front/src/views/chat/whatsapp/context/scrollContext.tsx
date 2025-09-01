import React, { ReactNode, useContext, useReducer } from "react";

interface ScrollContextType {
    scrollTop: any;
    scrollIntoViewBehavior: string;

}

type ScrollContextActionType =
    | { type: 'SET_SCROLLINTOVIEW_BEHAVIOR', payload: { value: string } }
    | { type: 'SET_SCROLL_TOP', payload: { value: number | null } }

const initialState: ScrollContextType = {
    scrollTop: null,
    scrollIntoViewBehavior: "smooth",
}

export const ScrollContext = React.createContext<| { state: ScrollContextType, dispatch: React.Dispatch<ScrollContextActionType> } | undefined>(undefined);

function reduce(state: ScrollContextType, action: ScrollContextActionType) {
    switch (action.type) {
        case 'SET_SCROLLINTOVIEW_BEHAVIOR':
            return { ...state, scrollIntoViewBehavior: action.payload.value }
        case 'SET_SCROLL_TOP':
            return { ...state, scrollTop: action.payload.value }
        default:
            return state;
    }
}

export function ScrollContextProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reduce, initialState);
    return (
        <ScrollContext.Provider value={{ state, dispatch }}>
            {children}
        </ScrollContext.Provider>
    )
}

export function useScrollContext() {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}