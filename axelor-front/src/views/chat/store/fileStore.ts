
import { create } from "zustand";
import { ChatBoxVariant, ChatType } from "../types/chatTypes";

interface chatFileFormDataType {
  file: File;
  chat: ChatType;
  currentUserId: {
    id: number;
  } | null;
  caption?: string;
  variant: ChatBoxVariant;
}

const CHAT_URL = import.meta.env.VITE_PROXY_CHAT_URL;
const csrfToken = getCookie("CSRF-TOKEN");

export function getCookie(name: string): string | null {
  let cookieName = encodeURIComponent(name) + "=",
    cookieStart = document.cookie.indexOf(cookieName),
    cookieValue = null,
    cookieEnd;

  if (cookieStart > -1) {
    cookieEnd = document.cookie.indexOf(";", cookieStart);
    if (cookieEnd === -1) {
      cookieEnd = document.cookie.length;
    }
    cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
  }

  return cookieValue;
}


interface useChatFileStoreStype {
  uploadFileWhatsapp: ({ file, chat, currentUserId, caption }: chatFileFormDataType) => void;
  uploadFileAxelor: ({ file, chat, currentUserId, caption }: chatFileFormDataType) => void;
}

export const useChatFileStore = create<useChatFileStoreStype>()((set, get) => ({
  uploadFileWhatsapp: async ({ file, chat, currentUserId, caption, variant }: chatFileFormDataType) => {
    try {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("chat", JSON.stringify(chat));
      formData.append("messageAuthor", JSON.stringify(currentUserId));
      if (caption && caption !== "") {
        formData.append("caption", JSON.stringify(caption));
      }
      const domen = CHAT_URL;
      console.log("domen: ", domen)
      const res = await fetch("https://" + domen + "/uploadFileWhatsapp", {
        method: "POST",
        body: formData,
      });
      if (res.status === 200) {
        return res;
      } else {
        throw new Error(`${res.status} ${res.statusText}`);
      }
    } catch (error) {
      throw error;
    }
  },
  uploadFileAxelor: async ({ file, chat, currentUserId, caption, variant }: chatFileFormDataType) => {
    try {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("chat", JSON.stringify(chat));
      formData.append("messageAuthor", JSON.stringify(currentUserId));
      if (caption && caption !== "") {
        formData.append("caption", JSON.stringify(caption));
      }
      const domen = CHAT_URL;
      const res = await fetch("https://" + domen + "/uploadFileAxelor", {
        method: "POST",
        body: formData,
      });
      if (res.status === 200) {
        return res;
      } else {
        throw new Error(`${res.status} ${res.statusText}`);
      }
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  },
}));
