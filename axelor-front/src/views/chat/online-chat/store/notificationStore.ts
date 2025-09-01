import { create } from "zustand";

interface useNotificationStoreType {
  newMessageTone: HTMLAudioElement | null;
  newMessageToneCollega: HTMLAudioElement | null;
  setNewMessageTone: (newAudio: HTMLAudioElement) => void;
  setNewMessageToneCollega: (newAudio: HTMLAudioElement) => void;
}

export const useNotificationStore = create<useNotificationStoreType>()((set, get) => ({
  newMessageTone: null,
  newMessageToneCollega: null,
  setNewMessageTone: (newAudio: HTMLAudioElement) => {
    set({ newMessageTone: newAudio });
  },
  setNewMessageToneCollega: (newAudio: HTMLAudioElement) => {
    set({ newMessageToneCollega: newAudio });
  },
}));
