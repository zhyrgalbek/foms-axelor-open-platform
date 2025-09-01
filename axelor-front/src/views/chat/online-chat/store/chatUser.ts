import { enqueueSnackbar } from "notistack";
import { create } from "zustand";

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
      const response = await fetch("/foms/ws/user/id", {
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
