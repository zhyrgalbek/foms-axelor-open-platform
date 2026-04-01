import { enqueueSnackbar } from "notistack";
import { create } from "zustand";
const CONTEXT = import.meta.env.VITE_PROXY_CONTEXT;

interface useChatUserType {
  currentUserId: {
    id: number;
  } | null;
  getCurrentUserId: () => void;
}

export const useChatUserStore = create<useChatUserType>()((set, get) => ({
  currentUserId: null,
  getCurrentUserId: async () => {
    try {
      const response = await fetch(CONTEXT + "/ws/user/id", {
        method: "GET",
      });
      if (response.ok) {
        let jsondata = await response.json();
        let currentUser = jsondata.data;
        set({ currentUserId: currentUser });
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      enqueueSnackbar("Не удалось получить текщий пользователь!", { variant: "error" });
    }
  },
}));
