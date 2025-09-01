"use client";
import { create } from "zustand";
import { ClientContactType, DepartMentType, addChatContactsType } from "../types/chatTypes";

interface searchColleguesType {
  transferLoading: boolean;
  contacts: addChatContactsType | null;
  departMents: DepartMentType[];
  clients: ClientContactType[];
  searchLoading: boolean;
  setSearchLoading: (value: boolean) => void;
  setTransferLoading: (value: boolean) => void;
  setContacts: (value: addChatContactsType | null) => void;
  setDepartMents: (value: DepartMentType[]) => void;
  setClients: (value: ClientContactType[]) => void;
}

export const useSearchColleguesStore = create<searchColleguesType>()((set, get) => ({
  transferLoading: false,
  contacts: null,
  departMents: [],
  clients: [],
  searchLoading: false,
  setSearchLoading: (value: boolean) => {
    set({ searchLoading: value });
  },
  setTransferLoading: (value: boolean) => {
    set({ transferLoading: value });
  },
  setContacts: (value: addChatContactsType | null) => {
    set({ contacts: value, searchLoading: false });
  },
  setDepartMents: (value: DepartMentType[]) => {
    set({ departMents: value, searchLoading: false });
  },
  setClients: (value: ClientContactType[]) => {
    set({ clients: value, searchLoading: false });
  },
}));
