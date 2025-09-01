"use client";
import { MessageType } from "../types/chatTypes";
import { create } from "zustand";

export enum CommentaryVariant {
  sendCommentary = "sendCommentary",
  updateCommentary = "updateCommentary",
}
interface ChatCommentaryType {
  openChatCommentary: boolean;
  message: MessageType | null;
  commentary: string;
  variant: CommentaryVariant | null;
  setCommentary: (value: string) => void;
  setMessage: (value: string) => void;
  handleOpenChatCommentary: (variant: CommentaryVariant, message?: MessageType) => void;
  handleCloseChatCommentary: () => void;
}

export const useChatCommentary = create<ChatCommentaryType>()((set, get) => ({
  openChatCommentary: false,
  message: null,
  commentary: "",
  variant: null,
  setCommentary: (value) => {
    set({ commentary: value });
  },
  setMessage: (value) => {
    let message = get().message;
    if (message) {
      set({ message: { ...message, body: value } });
    }
  },
  handleOpenChatCommentary: (variant, message) => {
    set({ openChatCommentary: true, variant, message });
  },
  handleCloseChatCommentary: () => {
    set({ openChatCommentary: false, commentary: "", variant: null, message: null });
  },
}));
