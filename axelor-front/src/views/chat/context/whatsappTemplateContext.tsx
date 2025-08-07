import React, { ReactNode, useContext, useReducer } from "react";
import { StatusMessageEnum, HttpStatusEnum, TemplateType, SuccessMessageEnum } from "../types/chatTypes";

export interface WhatsappTemplateType {
    loadingTemplateMessage: boolean;
    templateLoading: boolean;
    status: { variant: StatusMessageEnum; value: HttpStatusEnum };
    createSuccessTemplate: TemplateType | null;
    errorMessage: string | null;
    successMessage: SuccessMessageEnum | null;
    templates: TemplateType[];
}

type WhatsappTemplateContextActionType =
    | { type: 'SET_STATUS', payload: { variant: StatusMessageEnum, value: HttpStatusEnum } }
    | { type: 'SET_SUCCESS', payload: { value: SuccessMessageEnum | null } }
    | { type: 'SET_LOADING_TEMPLATE_MESSAGE', payload: { value: boolean } }
    | { type: 'SET_TEMPLATE_LOADING', payload: { value: boolean } }
    | { type: 'SET_CREATE_SUCCESS_TEMPLATE', payload: { value: TemplateType | null } }
    | { type: 'SET_ERROR_MESSAGE', payload: { value: string | null } }
    | { type: 'SET_TEMPLATES', payload: { value: TemplateType[] } }

export const whatsappTemplateContext = React.createContext<| { state: WhatsappTemplateType, dispatch: React.Dispatch<WhatsappTemplateContextActionType> } | undefined>(undefined);

const initialState: WhatsappTemplateType = {
    loadingTemplateMessage: false,
    templateLoading: false,
    status: { variant: StatusMessageEnum.noStatus, value: HttpStatusEnum.noStatus },
    createSuccessTemplate: null,
    errorMessage: null,
    successMessage: null,
    templates: [],
}

function reducer(state: WhatsappTemplateType, action: WhatsappTemplateContextActionType) {
    switch (action.type) {
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'SET_SUCCESS':
            return { ...state, successMessage: action.payload.value };
        case 'SET_LOADING_TEMPLATE_MESSAGE':
            return { ...state, loadingTemplateMessage: action.payload.value };
        case 'SET_TEMPLATE_LOADING':
            return { ...state, templateLoading: action.payload.value };
        case 'SET_CREATE_SUCCESS_TEMPLATE':
            return { ...state, createSuccessTemplate: action.payload.value };
        case 'SET_ERROR_MESSAGE':
            return { ...state, errorMessage: action.payload.value };
        case 'SET_TEMPLATES':
            return { ...state, templates: action.payload.value };
        default:
            return state;
    }
}

export function WhatsappTemplateProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <whatsappTemplateContext.Provider value={{ state, dispatch }}>
            {children}
        </whatsappTemplateContext.Provider>
    )
}

export function useWhatsappTemplate() {
    const context = useContext(whatsappTemplateContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}