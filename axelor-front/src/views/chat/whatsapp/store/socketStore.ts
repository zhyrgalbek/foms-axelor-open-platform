"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { enqueueSnackbar } from "notistack";
import { useChatMessage } from "./message";
import { useChatsStore } from "./chatsStore";
import { useSearchColleguesStore } from "./searchCollegues";
import { useChatStore } from "./chatStore";
import { useChatUserStore } from "./chatUser";
import { useScrollStore } from "./scrollStore";
import { useNotificationStore } from "./notificationStore";
import { ChatBoxVariant, ChatType, ClientType, ColleaguesType, HttpStatusEnum, LastMessageType, MemberType, MessageType, SocketStoreEventType, StatusMessageEnum, SuccessMessageEnum, TemplateType } from "../types/chatTypes";
import { useWhatsappTemplate } from "./whatsappTemplate";
import { getStatusTemplate } from "../helpers/helpers";
const CHAT_URL_WS = import.meta.env.VITE_PROXY_WHATSAPP_WS;
const CHAT_KEY = import.meta.env.VITE_PROXY_WHATSAPP_KEY

interface ChatMessage {
  chatId: number;
  messages: MessageType[];
}

interface socketStoretype {
  pingPong: string;
  socket: any;
  socketInterval: any;
  type: any;
  clearSocket: () => void;
  startSocket: ({ type }: { type: ChatBoxVariant }) => void;
  closeSocket: () => void;
  sendEvent: ({}: SocketStoreEventType) => void;
  _hasRehydrated?: boolean;
}

export const useSocketStore = create(
  persist<socketStoretype>(
    (set, get) => ({
      pingPong: "",
      socket: null, //socket
      socketInterval: null, //socket
      type: null,
      _hasRehydrated: false,
      clearSocket: () => {
        set({ socket: null });
      },
      startSocket: ({ type }: { type: ChatBoxVariant }) => {
        if (!get().socket || get().socket?.readyState !== WebSocket.OPEN) {

          set({ type: type });

          let s = new WebSocket(`${CHAT_URL_WS}/ws?apiKey=${CHAT_KEY}`);
          s.onopen = async function () {
            const { getCurrentUserId } = useChatUserStore.getState();
            getCurrentUserId();
          };
          s.onmessage = function (event: any) {
            let data: any = JSON.parse(event.data);
            switch (data.event) {
              case "ping": {
                get().sendEvent({ event: "pong", data: {} });
                break;
              }
              case "allChats": {
                const { setChatsLoading, setSelectedContactGroups, setChats } = useChatsStore.getState();
                setChatsLoading(false);
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let Colleagues: ColleaguesType[] = data.Colleagues;
                let Clients: ClientType[] = data.Clients;
                Colleagues?.sort((a: ColleaguesType, b: ColleaguesType) => {
                  if (a?.lastMessage && b?.lastMessage) {
                    return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
                  } else if (!a?.lastMessage && !b?.lastMessage) {
                    // Оба объекта не имеют lastMessage, оставляем их на своих местах
                    return 0;
                  } else if (!a?.lastMessage) {
                    // a не имеет lastMessage, перемещаем его вниз
                    return 1;
                  } else if (!b?.lastMessage) {
                    // b не имеет lastMessage, перемещаем его вниз
                    return -1;
                  }
                  return 0;
                });

                Clients?.sort((a: ClientType, b: ClientType) => {
                  if (a?.lastMessage && b?.lastMessage) {
                    return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
                  } else if (!a?.lastMessage && !b?.lastMessage) {
                    // Оба объекта не имеют lastMessage, оставляем их на своих местах
                    return 0;
                  } else if (!a?.lastMessage) {
                    // a не имеет lastMessage, перемещаем его вниз
                    return 1;
                  } else if (!b?.lastMessage) {
                    // b не имеет lastMessage, перемещаем его вниз
                    return -1;
                  }
                  return 0;
                });
                if (Clients?.length > 0) {
                  setSelectedContactGroups(0);
                }
                if (data.activeUserSearch) {
                  setSelectedContactGroups(1);
                }
                setChats([Clients, Colleagues]);
                break;
              }
              case "close": {
                s.close(1000);
                break;
              }
              case "getChat": {
                const { setChatLoading, setChat } = useChatStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                setChat(data.chat);
                setChatLoading(false);
                get().sendEvent({
                  event: "getChatMessages",
                  data: {
                    chat: data.chat,
                    limit: 40,
                  },
                });
                break;
              }
              case "getChatMessages": {
                const { currentUserId } = useChatUserStore.getState();
                const { messages, setOldMessageLoading, setMessageLoading, setMessages, setMessagesTotal } =
                  useChatMessage.getState();
                const { setScrollIntoViewBehavior, setScrollTop } = useScrollStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let chatMessageIndex = messages.findIndex((chatMessage) => chatMessage.chatId === data.chatId);
                if (chatMessageIndex > -1) {
                  let newMessages: ChatMessage[] = messages.map((chatMessage, index) => {
                    if (index === chatMessageIndex) {
                      return { ...chatMessage, messages: data.messages };
                    }
                    return chatMessage;
                  });
                  setMessages(newMessages);
                } else {
                  let newMessages: ChatMessage[] = [...messages, { chatId: data.chatId, messages: data.messages }];
                  setMessages(newMessages);
                }
                setMessagesTotal(data.total);
                setScrollIntoViewBehavior("auto");
                setScrollTop(data.scrollTop);
                setTimeout(() => {
                  setMessageLoading(false);
                  setOldMessageLoading(false);
                }, 500);
                break;
              }
              case "getOldMessages": {
                const { currentUserId } = useChatUserStore.getState();
                const { messages, setOldMessageLoading, setMessageLoading, setMessages, setMessagesTotal } =
                  useChatMessage.getState();
                const { setScrollIntoViewBehavior, setScrollTop } = useScrollStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let chatMessageIndex = messages.findIndex((chatMessage) => chatMessage.chatId === data.chatId);
                if (chatMessageIndex > -1) {
                  let newMessages: ChatMessage[] = messages.map((chatMessage, index) => {
                    if (index === chatMessageIndex) {
                      let chatMessages: MessageType[] = chatMessage.messages.concat(data.oldMessages);
                      return { ...chatMessage, messages: chatMessages };
                    }
                    return chatMessage;
                  });
                  setMessages(newMessages);
                }
                setMessagesTotal(data.total);
                setScrollIntoViewBehavior("auto");
                setScrollTop(data.scrollTop);
                setTimeout(() => {
                  setMessageLoading(false);
                  setOldMessageLoading(false);
                }, 500);
                break;
              }
              case "unreadMessageCount": {
                const { chats, setChats } = useChatsStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let collegues: ColleaguesType[] = chats[1].map((collega) => {
                  if (collega?.id === data.chat?.id) {
                    return { ...collega, unreadMessageCount: 0 };
                  }
                  return collega;
                });
                let clients: ClientType[] = chats[0].map((client) => {
                  if (client?.id === data.chat?.id) {
                    return { ...client, unreadMessageCount: 0 };
                  }
                  return client;
                });
                setChats([clients, collegues]);
                break;
              }
              case "newMessage": {
                const { currentUserId } = useChatUserStore.getState();
                const { chat } = useChatStore.getState();
                const { messages, setSendMessageLoading, setMessageLoading, setMessages } = useChatMessage.getState();
                const { setScrollIntoViewBehavior } = useScrollStore.getState();
                const { newMessageToneCollega } = useNotificationStore.getState();
                if (data.error) {
                  setMessageLoading(false);
                  setSendMessageLoading(false);
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                if (data.newMessage) {
                  const { chats, setChats } = useChatsStore.getState();
                  setMessageLoading(true);
                  let newMessage: MessageType = data.newMessage;
                  let currentChat: ChatType = chat;
                  let newMessages: ChatMessage[] = messages;
                  let collegaChat = chats[1].find((chat) => chat?.id === newMessage.chat.id);
                  if (!collegaChat) {
                    get().sendEvent({ event: "currentUser", data: { currentUserId: currentUserId } });
                  }
                  let collegues: ColleaguesType[] = chats[1].map((collega) => {
                    if (collega?.id === newMessage.chat.id && !newMessage.appeal) {
                      if (!newMessage.messageAuthor || newMessage.messageAuthor?.id !== currentUserId?.id) {
                        collega.unreadMessageCount++;
                      }
                      return { ...collega, lastMessage: newMessage as LastMessageType };
                    }
                    return collega;
                  });

                  collegues?.sort((a: ColleaguesType, b: ColleaguesType) => {
                    if (a?.lastMessage && b?.lastMessage) {
                      return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
                    } else if (!a?.lastMessage && !b?.lastMessage) {
                      // Оба объекта не имеют lastMessage, оставляем их на своих местах
                      return 0;
                    } else if (!a?.lastMessage) {
                      // a не имеет lastMessage, перемещаем его вниз
                      return 1;
                    } else if (!b?.lastMessage) {
                      // b не имеет lastMessage, перемещаем его вниз
                      return -1;
                    }
                    return 0;
                  });

                  newMessages = newMessages.map((message) => {
                    if (message.chatId === newMessage.chat.id) {
                      message.messages.unshift(newMessage);
                      return message;
                    }
                    return message;
                  });

                  if (newMessage.messageAuthor?.id !== currentUserId?.id) {
                    newMessageToneCollega?.play();
                  }
                  setMessages([...newMessages]);
                  setMessageLoading(false);
                  setSendMessageLoading(false);
                  setChats([chats[0], collegues]);
                  setScrollIntoViewBehavior("smooth");
                }
                break;
              }
              case "getContacts": {
                const { setContacts } = useSearchColleguesStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                setContacts(data.contacts);
                break;
              }
              case "DepartMents": {
                const { setDepartMents } = useSearchColleguesStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                setDepartMents(data.departMents);
                break;
              }
              case "getClients": {
                const { setClients } = useSearchColleguesStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                setClients(data.clients);
                break;
              }
              case "newChat": {
                const { setChat } = useChatStore.getState();
                const { chats, setChats } = useChatsStore.getState();
                const { setMessageLoading } = useChatMessage.getState();
                if (data.error) {
                  useChatMessage.getState().setMessageLoading(false);
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                if (data.newChat) {
                  if (!data.newChat.appeal) {
                    setChats([chats[0], [...chats[1], data.newChat]]);
                    setChat(data.newChat);
                  }
                }
                if (data.chat) {
                  setChat(data.chat);
                }
                setMessageLoading(false);
                break;
              }
              case "newMessageAppeal": {
                const { currentUserId } = useChatUserStore.getState();
                const { chat } = useChatStore.getState();
                const { chats, setChats } = useChatsStore.getState();
                const { messages, setSendMessageLoading, setMessageLoading, setMessages } = useChatMessage.getState();
                const { setScrollIntoViewBehavior } = useScrollStore.getState();
                const { newMessageTone } = useNotificationStore.getState();
                if (data.error) {
                  setMessageLoading(false);
                  setScrollIntoViewBehavior("smooth");
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                if (data.newMessage) {
                  let newMessage: MessageType = data.newMessage;
                  let currentChat: ChatType = chat;
                  let newMessages: ChatMessage[] = messages;
                  let clientChat = chats[0].find((client) => client?.id === newMessage.chat.id);
                  let clients: ClientType[] = chats[0].map((client: ClientType) => {
                    if (client?.id === newMessage.chat.id && newMessage.appeal) {
                      if (!newMessage.messageAuthor) {
                        client.unreadMessageCount++;
                      }
                      if (client.fullName === "" || client.phoneNumber === "") {
                        if (client?.id === currentChat?.id) {
                          get().sendEvent({
                            event: "getChat",
                            data: {
                              activeChat: currentChat,
                              newMessageAuthor: null,
                            },
                          });
                        }
                        return {
                          ...client,
                          appeal: newMessage.appeal,
                          phoneNumber: newMessage.appeal.phoneNumber,
                          fullName: newMessage.appeal.name,
                          lastMessage: newMessage as LastMessageType,
                        };
                      }
                      return { ...client, lastMessage: newMessage as LastMessageType };
                    }
                    return client;
                  });

                  clients?.sort((a: ClientType, b: ClientType) => {
                    if (a?.lastMessage && b?.lastMessage) {
                      return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
                    } else if (!a?.lastMessage && !b?.lastMessage) {
                      // Оба объекта не имеют lastMessage, оставляем их на своих местах
                      return 0;
                    } else if (!a?.lastMessage) {
                      // a не имеет lastMessage, перемещаем его вниз
                      return 1;
                    } else if (!b?.lastMessage) {
                      // b не имеет lastMessage, перемещаем его вниз
                      return -1;
                    }
                    return 0;
                  });

                  newMessages = newMessages.map((chatMessage) => {
                    if (chatMessage.chatId === newMessage.chat.id) {
                      chatMessage.messages.unshift(newMessage);
                      return chatMessage;
                    }
                    return chatMessage;
                  });
                  setMessages([...newMessages]);
                  setSendMessageLoading(false);
                  setChats([clients, chats[1]]);
                  setScrollIntoViewBehavior("smooth");
                  if (!newMessage.messageAuthor) {
                    newMessageTone?.play();
                  }
                }
                break;
              }
              case "newWorkAppeal": {
                const { chat, setCompletedLoading, setChat } = useChatStore.getState();
                const { chats, setAddClientLoading, setSelectedContactGroups, setChats } = useChatsStore.getState();
                const { setMessageLoading } = useChatMessage.getState();
                if (data.error) {
                  setMessageLoading(false);
                  setAddClientLoading(false);
                  setCompletedLoading(false);
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let clients: ClientType[] = chats[0];
                let findAppeal = clients.find((client) => client.id === data.newClient.id);
                if (findAppeal) {
                  clients = clients.map((client) => {
                    if (client.id === findAppeal?.id) {
                      return { ...data.newClient, unreadMessageCount: client.unreadMessageCount };
                    }
                    return client;
                  });
                  if (chat && chat?.id === data.newClient.id) {
                    setChat(data.newClient);
                  }
                  if (chat && chat?.id === data.newClient.id && data.status === "openChat") {
                    setSelectedContactGroups(0);
                    setChat(data.newClient);
                  }
                  if (data.status === "appeals") {
                    setSelectedContactGroups(0);
                    setChat(data.newClient);
                  }
                  if (data.status === "selectChat") {
                    setSelectedContactGroups(0);
                    setChat(data.newClient);
                    s.send(
                      JSON.stringify({
                        event: "getChatMessages",
                        data: {
                          chat: data.newClient,
                          limit: 40,
                        },
                      })
                    );
                  }
                } else {
                  clients.unshift(data.newClient);
                  setSelectedContactGroups(0);
                  // s.send(
                  //   JSON.stringify({
                  //     event: "getChatMessages",
                  //     data: {
                  //       chat: data.newClient,
                  //       limit: 40,
                  //     },
                  //   })
                  // );
                }
                setMessageLoading(false);
                setChats([[...clients], chats[1]]);
                setAddClientLoading(false);
                setCompletedLoading(false);
                break;
              }
              case "transferClient": {
                const { currentUserId } = useChatUserStore.getState();
                const { chat, setChat } = useChatStore.getState();
                const { setTransferLoading } = useSearchColleguesStore.getState();
                const { chats, setChats } = useChatsStore.getState();
                const { messages, setMessages } = useChatMessage.getState();
                if (data.error) {
                  setTransferLoading(false);
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let clients: ClientType[] = chats[0];
                let transferChat: ClientType = data.transferChat;
                let findAppeal1 = clients.find((client) => client.id === transferChat.id);
                if (findAppeal1) {
                  clients = clients.map((client) => {
                    if (client.id === findAppeal1?.id) {
                      if (client?.id !== chat?.id) {
                        client.unreadMessageCount++;
                        client.lastMessage = data.transferMessage;
                      } else {
                        s.send(
                          JSON.stringify({
                            event: "isReadMessages",
                            data: {
                              chat: { id: chat?.id },
                              user: currentUserId,
                            },
                          })
                        );
                      }
                      return {
                        ...transferChat,
                        unreadMessageCount: client.unreadMessageCount,
                        lastMessage: data.transferMessage,
                      };
                    }
                    return client;
                  });
                } else {
                  clients.unshift(transferChat);
                }
                if (chat?.id === transferChat.id) {
                  let newMessages: ChatMessage[] = messages.map((chatMessage) => {
                    if (chatMessage.chatId === transferChat.id) {
                      chatMessage.messages.unshift(data.transferMessage);
                      return chatMessage;
                    }
                    return chatMessage;
                  });
                  setMessages(newMessages);
                }

                if (data.transferChat.id === chat?.id) {
                  setChat(transferChat as unknown as ChatType);
                }
                setChats([[...clients], chats[1]]);
                setTransferLoading(false);
                break;
              }
              case "chatOrderPage": {
                const { setChat } = useChatStore.getState();
                if (data.error) {
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                if (event.chat) {
                  setChat(event.chat);
                }
                break;
              }
              case "statuses": {
                const { chat } = useChatStore.getState();
                const { chats, setChats } = useChatsStore.getState();
                const { messages, setMessages } = useChatMessage.getState();
                let newMessage: MessageType = data.newMessage;
                let currentChat: ChatType = chat;
                let newStatus = data.status;
                if (newMessage.chat.id === currentChat?.id) {
                  let newMessages: ChatMessage[] = messages.map((chatMessage) => {
                    if (chatMessage.chatId === newMessage.chat.id) {
                      return {
                        ...chatMessage,
                        messages: chatMessage.messages.map((message) => {
                          if (message.id === newMessage.id) {
                            return { ...message, status: newStatus, messageSecretKey: newMessage.messageSecretKey };
                          }
                          return message;
                        }),
                      };
                    }
                    return chatMessage;
                  });
                  setMessages(newMessages);
                }
                let clients: ClientType[] = chats[0].map((client: ClientType) => {
                  if (client?.id === newMessage.chat.id) {
                    return {
                      ...client,
                      lastMessage: client?.lastMessage ? { ...client?.lastMessage, status: newStatus } : null,
                    };
                  }
                  return client;
                });
                setChats([clients, chats[1]]);
                break;
              }
              case "getTemplate": {
                const { setTemplateLoading, setTemplates } = useWhatsappTemplate.getState();
                if (data.error) {
                  setTemplateLoading(false);
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let templates = data.templates.filter((el: any) => el.name !== "hello_world");
                let newTemplates = templates;
                newTemplates = [];
                if (templates) {
                  templates.forEach((template: any) => {
                    let templateHeader = template.components.find((el: any) => el.type === "HEADER");
                    let templateBody = template.components.find((el: any) => el.type === "BODY");
                    let templateFooter = template.components.find((el: any) => el.type === "FOOTER");
                    let templateButtons = template.components.find((el: any) => el.type === "BUTTONS");
                    let newTemplate: TemplateType = {
                      id: template.id,
                      name: template.name,
                      header: templateHeader ? templateHeader.text : "",
                      body: templateBody.text,
                      footer: templateFooter ? templateFooter.text : "",
                      status: getStatusTemplate(template.status),
                      category: template.category,
                      language: template.language,
                      buttons: templateButtons?.buttons ?? null,
                    };
                    newTemplates.push(newTemplate);
                  });
                }
                setTemplateLoading(false);
                setTemplates(newTemplates);
                break;
              }
              case "createTemplate": {
                const { setStatus, setSuccess, setCreateSuccessTemplate, setErrorMessage } =
                  useWhatsappTemplate.getState();
                let response = data.response;
                if (response.success) {
                  let successTemplate = response.success;
                  let templateHeader = successTemplate.components.find((el: any) => el.type === "HEADER");
                  let templateBody = successTemplate.components.find((el: any) => el.type === "BODY");
                  let templateFooter = successTemplate.components.find((el: any) => el.type === "FOOTER");
                  let templateButtons = successTemplate.components.find((el: any) => el.type === "BUTTONS");
                  let template: TemplateType = {
                    id: successTemplate.id,
                    name: successTemplate.name,
                    header: templateHeader ? templateHeader.text : "",
                    body: templateBody.text,
                    footer: templateFooter ? templateFooter.text : "",
                    status: getStatusTemplate(successTemplate.status),
                    category: successTemplate.category,
                    language: successTemplate.language,
                    buttons: templateButtons?.buttons ?? null,
                  };
                  setCreateSuccessTemplate(template);
                  setStatus({ variant: StatusMessageEnum.createTemplate, value: HttpStatusEnum.success });
                  setSuccess(SuccessMessageEnum.createTemplate);
                }
                if (response.error) {
                  setStatus({ variant: StatusMessageEnum.createTemplate, value: HttpStatusEnum.success });
                  setErrorMessage(response.error.message);
                }
                break;
              }
              case "updateTemplate": {
                const { setStatus, setSuccess, setCreateSuccessTemplate, setErrorMessage } =
                  useWhatsappTemplate.getState();
                let responseUpdate = data.response;
                if (responseUpdate.success) {
                  let successTemplate = responseUpdate.success;
                  let templateHeader = successTemplate.components.find((el: any) => el.type === "HEADER");
                  let templateBody = successTemplate.components.find((el: any) => el.type === "BODY");
                  let templateFooter = successTemplate.components.find((el: any) => el.type === "FOOTER");
                  let templateButtons = successTemplate.components.find((el: any) => el.type === "BUTTONS");
                  let template: TemplateType = {
                    id: successTemplate.id,
                    name: successTemplate.name,
                    header: templateHeader ? templateHeader.text : "",
                    body: templateBody.text,
                    footer: templateFooter ? templateFooter.text : "",
                    status: getStatusTemplate(successTemplate.status),
                    category: successTemplate.category,
                    language: successTemplate.language,
                    buttons: templateButtons?.buttons ?? null,
                  };
                  setCreateSuccessTemplate(template);
                  setStatus({ variant: StatusMessageEnum.updateTemplate, value: HttpStatusEnum.success });
                  setSuccess(SuccessMessageEnum.updateTemplate);
                }
                if (responseUpdate.error) {
                  setStatus({ variant: StatusMessageEnum.updateTemplate, value: HttpStatusEnum.success });
                  setErrorMessage(responseUpdate.error.message);
                }
                break;
              }
              case "deleteTemplate": {
                const { setStatus, setSuccess, setErrorMessage } = useWhatsappTemplate.getState();
                let responseDelete = data.response;
                if (responseDelete.success) {
                  setStatus({ variant: StatusMessageEnum.deleteTemplate, value: HttpStatusEnum.success });
                  setSuccess(SuccessMessageEnum.deleteTemplate);
                }
                if (responseDelete.error) {
                  setStatus({ variant: StatusMessageEnum.deleteTemplate, value: HttpStatusEnum.error });
                  setErrorMessage(responseDelete.error.message);
                }
                break;
              }
              case "updateAppealInfo": {
                const { chat, setChat } = useChatStore.getState();
                const { chats, setChats } = useChatsStore.getState();
                const { setLoadingTemplateMessage } = useWhatsappTemplate.getState();
                if (data.error) {
                  setLoadingTemplateMessage(false);
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                let newChat = data.newChat;
                let clients: ClientType[] = chats[0].map((client: ClientType) => {
                  if (client.id === newChat.id && client["appeal.id"]) {
                    return client;
                  }
                  return client;
                });
                if (chat?.id === newChat.id) {
                  setChat(newChat);
                }
                setLoadingTemplateMessage(false);
                setChats([[...clients], [...chats[1]]]);
                break;
              }
              case "updateCommentary": {
                const { chat } = useChatStore.getState();
                const { setLoadingTemplateMessage } = useWhatsappTemplate.getState();
                const { messages, setMessages } = useChatMessage.getState();
                if (data.error) {
                  setLoadingTemplateMessage(false);
                  enqueueSnackbar(data.error, { variant: "error" });
                  return;
                }
                const newMessage = data.newMessage;
                if (chat?.id === newMessage.chat.id) {
                  let newMessages: ChatMessage[] = messages.map((chatMessage) => {
                    if (chatMessage.chatId === data.newMessage.chat.id) {
                      return {
                        ...chatMessage,
                        messages: chatMessage.messages.map((message) => {
                          if (message.id === data.newMessage.id) {
                            return { ...data.newMessage };
                          }
                          return message;
                        }),
                      };
                    }
                    return chatMessage;
                  });
                  setMessages(newMessages);
                  setLoadingTemplateMessage(false);
                }
                break;
              }
              case "onlineChat": {
                const { chats, setChats } = useChatsStore.getState();
                const chat: ChatType = data.chat;
                let collegues: ColleaguesType[] = chats[1].map((collega) => {
                  if (collega.id === chat?.id) {
                    return { ...collega, status: chat?.status };
                  }
                  return collega;
                });
                setChats([[...chats[0]], collegues]);
                break;
              }
              case "offlineChat": {
                const { chats, setChats } = useChatsStore.getState();
                const closeCurrentUserId = data.currentUserId;
                const collegues: ColleaguesType[] = chats[1].map((collega) => {
                  const member = collega.members?.find((member) => member.id === closeCurrentUserId.id);
                  if (member) {
                    return {
                      ...collega,
                      status: closeCurrentUserId.status,
                    };
                  }
                  return collega;
                });
                setChats([[...chats[0]], collegues]);
                break;
              }
              case "userTyping": {
                const { chat, setIsTyping, isTyping } = useChatStore.getState();
                const { chats, setChats } = useChatsStore.getState();
                const newChat: ChatType = data.chat;
                const member: MemberType = data.member;
                let collegues: ColleaguesType[] = chats[1].map((collega) => {
                  if (collega.id === newChat?.id) {
                    if (data.isTyping) {
                      return { ...collega, isTyping: [member] };
                    }
                    if (!data.isTyping) {
                      return {
                        ...collega,
                        isTyping: collega.isTyping.filter((isTypeUser: MemberType) => isTypeUser.id !== member.id),
                      };
                    }
                  }
                  return collega;
                });
                if (!newChat?.appeal) {
                  setChats([[...chats[0]], collegues]);
                }
                if (newChat?.id === chat?.id) {
                  if (data.isTyping) {
                    const newIsTyping: MemberType[] = [...isTyping, member];
                    setIsTyping(newIsTyping);
                  }
                  if (!data.isTyping) {
                    const newIsTyping = isTyping.filter((isTypeUser: MemberType) => isTypeUser?.id !== member.id);
                    setIsTyping(newIsTyping);
                  }
                }
                break;
              }
            }
          };
          s.onclose = function (event: CloseEvent) {
            setTimeout(() => {
              get().startSocket({ type: get().type });
            }, 6000);
            console.log("Соединение прервано");
          };
          s.onerror = function (error) {
            console.error("WebSocket error: ", error);
            const socket = get().socket;
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
              socket.close(1000, "Ошибка WebSocket, закрываем соединение.");
              set({ socket: null });
            }
          };
          set({ socket: s });
        }
      },
      sendEvent: ({ event, data }: SocketStoreEventType) => {
        if (get().socket?.readyState === WebSocket.OPEN) {
          get().socket.send(JSON.stringify({ event: event, data }));
        } else {
          console.error("WebSocket connection is not open.");
        }
      },
      closeSocket: () => {
        if (get().socket && get().socket?.readyState === WebSocket.OPEN) {
          get().socket?.close(1000);
          set({ socket: null });
        }
      },
    }),
    {
      name: "chat-whatsapp-store",
      onRehydrateStorage: () => (state) => {
        if (state) state._hasRehydrated = true;
      },
    }
  )
);
