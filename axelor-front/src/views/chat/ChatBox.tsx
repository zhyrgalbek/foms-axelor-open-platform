"use client";
import { Card, Grid, Snackbar, Stack } from "@mui/material";
import { useSocketStore } from "./store/socketStore";
import React, { Suspense, useEffect } from "react";
import { useChatStore } from "./store/chatStore";
import { useChatUserStore } from "./store/chatUser";
import { useNotificationStore } from "./store/notificationStore";
import { ChatBoxVariant } from "./types/chatTypes";
import MessageTone from "@/assets/music/new_message_tone.mp3";
import MessageToneOdnoklassniki from "@/assets/music/odnoklassniki_-_zvuk_soobscheniy.mp3";
import { Box } from "@mui/system";
const ChatHeader = React.lazy(() => import("./ChatHeader"));
const ChatFooter = React.lazy(() => import("./ChatFooter"));
const ChatMain = React.lazy(() => import("./ChatMain"));

interface ChatBoxPropsType {
    order?: boolean;
    chatId: number | null;
    page: string;
    variant: ChatBoxVariant;
}

export default function ChatBox({ order = false, chatId, page, variant }: ChatBoxPropsType) {
    const { socket, startSocket, closeSocket, sendEvent, _hasRehydrated } = useSocketStore((state) => state);
    const { setNewMessageTone, setNewMessageToneCollega } = useNotificationStore((state) => state);
    const { currentUserId } = useChatUserStore((state) => state);
    const { chat } = useChatStore((state) => state);

    useEffect(() => {
        if (!_hasRehydrated) return;
        let newMessageTone = new Audio();
        newMessageTone.controls = true;
        newMessageTone.src = MessageTone;
        let newMessageToneCollega = new Audio();
        newMessageToneCollega.controls = true;
        newMessageToneCollega.src = MessageToneOdnoklassniki;
        setNewMessageTone(newMessageTone);
        setNewMessageToneCollega(newMessageToneCollega);
    }, [_hasRehydrated]);

    useEffect(() => {
        if (!_hasRehydrated) return;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            startSocket({ type: variant });
        }
        return () => {
            closeSocket();
        };
    }, [_hasRehydrated]);

    useEffect(() => {
        if (!_hasRehydrated || !currentUserId || socket?.readyState !== WebSocket.OPEN) return;
        if (!chatId) {
            sendEvent({ event: "currentUser", data: { currentUserId: currentUserId, connect: true } });
        }
        if (chatId) {
            sendEvent({
                event: "getChat",
                data: {
                    activeChat: { id: chatId },
                    currentUserId,
                    connect: true,
                },
            });
        }
    }, [currentUserId, _hasRehydrated]);

    useEffect(() => {
        const clearStorage = () => {
            localStorage.removeItem("chat-whatsapp-store");
        };
        window.addEventListener("beforeunload", clearStorage);
        return () => {
            clearStorage();
            window.removeEventListener("beforeunload", clearStorage);
        };
    }, []);

    return (
        <Grid {...{ item: true }} >
            <Card sx={{ border: 'none' }}>
                {order && (
                    <Stack direction="column" flexWrap="nowrap">
                        <Suspense fallback={<div>Loading...</div>}>
                            <ChatHeader order={order} page={page} variant={variant} />
                            <ChatMain order={order} />
                            <ChatFooter order={order} variant={variant} />
                            <Snackbar />
                        </Suspense>
                    </Stack>
                )}
                {!order && chat && (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Stack direction="column">
                            <ChatHeader order={order} page={page} variant={variant} />
                            <ChatMain order={order} />
                            <ChatFooter order={order} variant={variant} />
                            <Snackbar />
                        </Stack>
                    </Suspense>
                )}
            </Card>
        </Grid>
    );
}
