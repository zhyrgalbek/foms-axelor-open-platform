"use client";
import { create } from "zustand";
import { ClientType, ColleaguesType } from "../types/chatTypes";

interface useChatsStoreType {
  addClientLoading: boolean;
  chats: [ClientType[], ColleaguesType[]];
  chatsLoading: boolean;
  selectedContactGroup: number;
  setAddClientLoading: (value: boolean) => void;
  setChatsLoading: (value: boolean) => void;
  setSelectedContactGroups: (value: number) => void;
  setChats: (value: [ClientType[], ColleaguesType[]]) => void;
}

export const useChatsStore = create<useChatsStoreType>()((set, get) => ({
  addClientLoading: false,
  chats: [[], []],
  chatsLoading: false,
  selectedContactGroup: 0,
  setAddClientLoading: (value: boolean) => {
    set((state) => ({ ...state, addClientLoading: value }));
  },
  setChatsLoading: (value: boolean) => {
    set((state) => ({ ...state, chatsLoading: value }));
  },
  setSelectedContactGroups: (value: number) => {
    set({ selectedContactGroup: value });
  },
  setChats: (value: [ClientType[], ColleaguesType[]]) => {
    set((state) => ({ ...state, chats: value }));
  },
}));
