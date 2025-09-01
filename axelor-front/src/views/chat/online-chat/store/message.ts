import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MessageType } from "../types/chatTypes";
interface ChatMessage {
  chatId: number;
  messages: MessageType[];
}
interface useChatMessageType {
  messageLoading: boolean;
  oldMessageLoading: boolean;
  sendMessageLoading: boolean;
  messages: ChatMessage[];
  messagesTotal: number | null;
  answerSelectMessage: MessageType | null;
  setOldMessageLoading: (value: boolean) => void;
  setSendMessageLoading: (value: boolean) => void;
  setMessageLoading: (value: boolean) => void;
  setMessages: (value: ChatMessage[]) => void;
  setMessagesTotal: (value: number | null) => void;
  setAnswerSelectMessage: (value: MessageType | null) => void;
}

export const useChatMessage = create(
  persist<useChatMessageType>(
    (set, get) => ({
      messageLoading: false,
      oldMessageLoading: false,
      sendMessageLoading: false,
      messages: [],
      messagesTotal: null,
      answerSelectMessage: null,
      setMessageLoading: (value: boolean) => {
        set({ messageLoading: value });
      },
      setOldMessageLoading: (value: boolean) => {
        set({ oldMessageLoading: value });
      },
      setSendMessageLoading: (value: boolean) => {
        set({ sendMessageLoading: value });
      },
      setMessages: (value: ChatMessage[]) => {
        set({ messages: value });
      },
      setMessagesTotal: (value: number | null) => {
        set({ messagesTotal: value });
      },
      setAnswerSelectMessage: (value: MessageType | null) => {
        set({ answerSelectMessage: value });
      },
    }),
    {
      name: "useOnlineChatMessage",
    }
  )
);
