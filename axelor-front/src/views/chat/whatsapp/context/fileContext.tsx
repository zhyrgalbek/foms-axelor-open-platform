import { ChatBoxVariant, ChatType } from "../types/chatTypes";
const CHAT_URL = import.meta.env.VITE_PROXY_CHAT_URL;

interface ChatFileFormDataType {
    file: File;
    chat: ChatType;
    currentUserId: {
        id: number;
    } | null;
    caption?: string;
    variant: ChatBoxVariant;
}

interface useChatFileStoresType {

}

export const uploadFileWhatsapp = async ({ file, chat, currentUserId, caption, variant }: ChatFileFormDataType) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("chat", JSON.stringify(chat));
        formData.append("messageAuthor", JSON.stringify(currentUserId));
        if (caption && caption !== "") {
            formData.append("caption", JSON.stringify(caption));
        }
        const res = await fetch(`${CHAT_URL}/chat/uploadFileWhatsapp`, {
            method: 'POST',
            body: formData
        });
        if (res.status === 200) {
            return res;
        } else {
            throw new Error(`${res.status} ${res.statusText}`);
        }
    } catch (error) {
        throw error;
    }
}

export const uploadFileAxelor = async ({ file, chat, currentUserId, caption, variant }: ChatFileFormDataType) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("chat", JSON.stringify(chat));
        formData.append("messageAuthor", JSON.stringify(currentUserId));
        if (caption && caption !== "") {
            formData.append("caption", JSON.stringify(caption));
        }
        const res = await fetch(`${CHAT_URL}/chat/uploadFileAxelor`, {
            method: 'POST',
            body: formData
        });
        if (res.status === 200) {
            return res;
        } else {
            throw new Error(`${res.status} ${res.statusText}`);
        }
    } catch (error) {
        throw error;
    }
}