"use client";

import { create } from "zustand";
import { ChatType, MemberType } from "../types/chatTypes";

interface useChatStoreType {
  chatloading: boolean;
  completedLoading: boolean;
  chat: ChatType;
  isTyping: MemberType[];
  width: string,
  height: string,
  setWidth: (value: string)=> void,
  setHeight: (value: string)=> void,
  setChatLoading: (value: boolean) => void;
  setCompletedLoading: (value: boolean) => void;
  setChat: (value: ChatType) => void;
  setIsTyping: (value: MemberType[]) => void;
}

export const useChatStore = create<useChatStoreType>()((set, get) => ({
  chatloading: false,
  completedLoading: false,
  chat: null,
  isTyping: [],
  width: "0",
  height: "0",
  setWidth: (value: string) => {
    set({ width: value });
  },
  setHeight: (value: string) => {
    set({ height: value });
  },
  setChatLoading: (value: boolean) => {
    set({ chatloading: value });
  },
  setCompletedLoading: (value: boolean) => {
    set({ completedLoading: value });
  },
  setChat: (value: ChatType) => {
    set({ chat: value });
  },
  setIsTyping: (value: MemberType[]) => {
    set({ isTyping: value });
  },
}));
