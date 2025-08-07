import { create } from "zustand";

interface useScrollStoreType {
  scrollTop: any;
  scrollIntoViewBehavior: string;
  setScrollIntoViewBehavior: (value: string) => void;
  setScrollTop: (value: number | null) => void;
}

export const useScrollStore = create<useScrollStoreType>()((set, get) => ({
  scrollTop: null,
  scrollIntoViewBehavior: "smooth",
  setScrollIntoViewBehavior: (value: string) => {
    set({ scrollIntoViewBehavior: value });
  },
  setScrollTop: (value: number | null) => {
    set({ scrollTop: value });
  },
}));
