"use client";
import React, { memo, useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Stack,
    Grid,
    Typography,
    Card,
    Skeleton,
} from "@mui/material";
import { useSocketStore } from "./store/socketStore";
import { getChatClientName } from "./helpers/helpers";
import ContactProfile from "./elements/ContactProfile";
import ChatCommentary from "./elements/ChatCommentary";
import { useChatCommentary } from "./store/chatCommentary";
import { useChatMessage } from "./store/message";
import { useChatsStore } from "./store/chatsStore";
import { useChatStore } from "./store/chatStore";
import { ChatBoxVariant, ChatType } from "./types/chatTypes";


type ChatHeaderPropsType = {
    order: boolean;
    page: string;
    variant: ChatBoxVariant;
};

export type ContactInfoType = {
    name: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    commentary: string;
};

const ChatHeader = ({ order, page, variant, ...props }: ChatHeaderPropsType) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { sendEvent } = useSocketStore((state) => state);
    const { chat } = useChatStore((state) => state);
    const { chats, selectedContactGroup } = useChatsStore((state) => state);
    const { messageLoading, setMessageLoading } = useChatMessage((state) => state);
    const [activeChat, setActiveChat] = useState<ChatType>(null);
    const [openContactCommentary, setOpenContactCommentary] = useState<boolean>(false);
    const chatCommentaryStory = useChatCommentary();
    const [form, setForm] = useState<ContactInfoType>({
        name: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        commentary: "",
    });
    const [contactInfo, setContactInfo] = useState<ContactInfoType>({
        name: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        commentary: "",
    });
    const open = Boolean(anchorEl);
    const id = open ? "simple-popper" : undefined;

    const handleOpenContactCommentary = () => {
        setOpenContactCommentary(true);
    };

    const handleCloseContactCommentary = () => {
        setOpenContactCommentary(false);
    };

    useEffect(() => {
        if (contactInfo) {
            setForm({
                ...contactInfo,
            });
        }
    }, [contactInfo]);

    useEffect(() => {
        if (activeChat && selectedContactGroup === 0) {
            setContactInfo({
                name:
                    (selectedContactGroup === 0 && activeChat["appeal.client.firstName"]) || activeChat["appeal.firstName"] || "",
                lastName:
                    (selectedContactGroup === 0 && activeChat["appeal.client.lastName"]) || activeChat["appeal.name"] || "",
                email:
                    (selectedContactGroup === 0 && activeChat["appeal.client.email"]) || activeChat["appeal.importOrigin"] || "",
                dateOfBirth:
                    (selectedContactGroup === 0 && activeChat["appeal.client.dateOfBirth"]) ||
                    activeChat["appeal.processInstanceId"] ||
                    "",
                commentary: (selectedContactGroup === 0 && activeChat["appeal.commentary"]) || "",
            });
        }
    }, [activeChat]);

    useEffect(() => {
        if (chat && chat.id && !order) {
            let activeClientChat = chats[0].find((el) => el?.id === chat.id);
            let activeCollegusChat = chats[1].find((el) => el?.id === chat.id);
            if (activeClientChat) {
                setActiveChat(chat);
            }
            if (activeCollegusChat) {
                setActiveChat(activeCollegusChat);
            }
        }
        if (order && chat && chat.id) {
            sendEvent({ event: "getChatorderpage", data: { chat: chat } });
            setActiveChat(chat);
        }
    }, [chat]);

    return (
        <Card sx={{ py: order ? 0.5 : 1.5, px: 1, bgcolor: "#F0F2F5", border: "none" }}>
            <Grid container alignItems="center" spacing={1}>
                <Grid {...{ item: true }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {!order && messageLoading && <Skeleton variant="circular" sx={{ width: "30px", height: "30px" }} />}
                        {!order && messageLoading && (
                            <Box>
                                <Skeleton
                                    variant="text"
                                    sx={{ fontSize: "16px", fontWeight: "600", padding: 0, margin: 0, width: "130px", height: "30px" }}
                                />
                                <Skeleton
                                    variant="text"
                                    sx={{ padding: 0, margin: 0, fontWeight: 600, width: "130px", height: "30px" }}
                                />
                            </Box>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {!order && !messageLoading && (
                            <Avatar sx={{ width: "30px", height: "30px", fontSize: 13 }}>{getChatClientName(chat)}</Avatar>
                        )}
                        {!order && !messageLoading && (
                            <Box
                                onClick={() => {
                                    if (activeChat?.["appeal.id"]) {
                                        handleOpenContactCommentary();
                                    }
                                }}
                                sx={{ cursor: "pointer" }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ fontSize: "14px", padding: 0, margin: 0, color: "#667781" }}
                                >
                                    {activeChat?.["appeal.id"] ? activeChat?.phoneNumber : activeChat?.fullName}
                                </Typography>
                                <Typography sx={{ padding: 0, margin: 0, fontWeight: 600, fontSize: 14 }} color="#3f51b5">
                                    {contactInfo.name + " " + contactInfo.lastName}
                                </Typography>
                                {activeChat?.["appeal.id"] && (
                                    <Typography fontSize={12}>{contactInfo.commentary.slice(0, 50)}...</Typography>
                                )}
                            </Box>
                        )}
                    </Stack>
                </Grid>
                {/* <ContactProfile
                    openModal={openContactCommentary}
                    contactInfo={contactInfo}
                    form={form}
                    activeChat={activeChat}
                    setForm={setForm}
                    handleCloseModal={handleCloseContactCommentary}
                />
                <ChatCommentary
                    openModal={chatCommentaryStory.openChatCommentary}
                    handleCloseModal={chatCommentaryStory.handleCloseChatCommentary}
                /> */}
            </Grid>
        </Card>
    );
};
export default memo(ChatHeader);
