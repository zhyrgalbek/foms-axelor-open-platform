"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Box, Menu, MenuItem, Stack, Typography, ListItemIcon, ListItemText, Avatar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Time from "./Time";
import ReadMark from "./ReadMarker";
import Photo from "./Photo";
import FileView from "./FileView";
import AudioPlayer from "./AudioPlayer";
import theme from "../styles/theme";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ErrorIcon from "@mui/icons-material/Error";
import Tooltip from "@mui/material/Tooltip";
import { getChatClientName, getMessageAuthorName } from "../helpers/helpers";

import TemplateMessage from "./TemplateMessage";
import TransferMessage from "./TransferMessage";
import ChatMessagePopup from "./ChatMessagePopup";
import VideoPlayer from "./VideoPlayer";
import Call from "./Call";
import DialerSipIcon from "@mui/icons-material/DialerSip";
import { errors } from "../helpers/errors";
import { useChatStore } from "../store/chatStore";
import { useChatUserStore } from "../store/chatUser";
import { AppelTypeEnum, ChatType, MessageType, MessageTypeEnum } from "../types/chatTypes";
const DOMAIN = import.meta.env.VITE_PROXY_TARGET;
const CONTEXT = import.meta.env.VITE_PROXY_CONTEXT;

interface ChatMessagePropsType {
    message: MessageType;
    isFirstInGroup: boolean;
}


const ChatMessage = ({ message }: ChatMessagePropsType) => {
    const [openNewTaskPopup, setOpenNewTaskPopup] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const { currentUserId } = useChatUserStore((state) => state);
    const { chat } = useChatStore((state) => state);
    let { body, type, messageAuthor, timestamp, status, appealType } = message;

    const bgColor: string = useMemo(() => {
        const types = [MessageTypeEnum.TRANSFER, MessageTypeEnum.COMMENTARY];
        if (type === MessageTypeEnum.COMMENTARY) {
            return "#E4E4E4";
        }
        if (messageAuthor?.id === currentUserId?.id && type !== MessageTypeEnum.TRANSFER) {
            return "#DCF7C5";
        }
        if (type === MessageTypeEnum.TRANSFER) {
            return "#3F51B5";
        }
        if (!messageAuthor || (messageAuthor?.id !== currentUserId?.id && !types.includes(type))) {
            return "#fff";
        }
        return "";
    }, [message]);

    const messageAlign: string = useMemo(() => {
        if (messageAuthor && type === MessageTypeEnum.TRANSFER) {
            return "center";
        }
        if (
            (messageAuthor && type !== MessageTypeEnum.TRANSFER) ||
            (type === MessageTypeEnum.CALL && message["messageCall.type"] === "outgoing")
        ) {
            return "flex-end";
        }
        if (type === MessageTypeEnum.CALL && message["messageCall.type"] === "incoming") {
            return "flex-start";
        }
        if (!chat?.["appeal.id"] && messageAuthor?.id !== currentUserId?.id) {
            return "flex-start";
        }
        return "flex-start";
    }, [message]);

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

    // const isEmail = emailRegex.test(m);
    // const bgColor = isMe ? "#DCF7C5" : "#fff";

    // const content = isEmail ? (
    //   <a href={`mailto:${m}`} style={{ color: "#027EB5", textDecoration: "none" }}>
    //     {m}
    //   </a>
    // ) : (
    //   <p style={{ margin: 0, padding: 0, fontSize: "0.875rem" }}>{m}</p>
    // );

    const messageContent = useCallback(
        ({ message, answer }: { message: MessageType; answer?: boolean }) => {
            switch (message.type) {
                case MessageTypeEnum.AUDIO:
                    return <AudioPlayer src={`${DOMAIN}${CONTEXT}/ws/dms/inline/${message.fileId}`} />;
                case MessageTypeEnum.IMAGE:
                    return <Photo message={message} answer={answer} />;
                case MessageTypeEnum.DOCUMENT:
                    return <FileView message={message} answer={answer} />;
                case MessageTypeEnum.VIDEO:
                    return <VideoPlayer message={message} answer={answer} />;
                case MessageTypeEnum.TEMPLATE:
                    return <TemplateMessage body={message.body} />;
                case MessageTypeEnum.TRANSFER:
                    return <TransferMessage message={message} />;
                case MessageTypeEnum.COMMENTARY:
                    return (
                        <Typography fontSize={13} sx={{ marginRight: "35px" }} component="div">
                            <pre
                                style={{
                                    fontStyle: "italic",
                                    textWrap: "wrap",
                                    fontWeight: "lighter",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word"
                                }}
                            >
                                {message.body}
                            </pre>
                        </Typography>
                    );
                case MessageTypeEnum.TEXT:
                    return (
                        <Typography fontSize={18} sx={{ marginRight: "35px" }} component="div">
                            <pre style={{
                                textWrap: "wrap", whiteSpace: "pre-wrap",
                                wordBreak: "break-word"
                            }}>{message.body}</pre>
                        </Typography>
                    );
                default:
                    return null;
            }
        },
        [message, chat]
    );

    const renderMessage = useCallback(
        ({ chat, message }: { message: MessageType; chat: ChatType }) => {
            const isAuthorMessage = message.messageAuthor && message.type !== MessageTypeEnum.CALL;
            const isAppealMessage = message.appeal && !message.messageAuthor && message.type !== MessageTypeEnum.CALL;

            return (
                <Box sx={{ marginRight: "40px" }}>
                    {(isAuthorMessage || isAppealMessage) && (
                        <Box>
                            {type !== MessageTypeEnum.TRANSFER && (
                                <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                                    <Typography
                                        fontWeight={500}
                                        fontSize={16}
                                        color="#3f51b5"
                                        fontStyle={type === MessageTypeEnum.COMMENTARY ? "italic" : "normal"}
                                    >
                                        {isAuthorMessage
                                            ? message.messageAuthor?.fullName
                                            : chat?.["appeal.client.fullName"] || message.appeal?.name}
                                    </Typography>
                                    {isAppealMessage && (
                                        <Typography fontSize={12} color="#667781" sx={{ marginLeft: "5px" }}>
                                            {chat?.["appeal.client.mobilePhone"] || chat?.phoneNumber}
                                        </Typography>
                                    )}
                                    <Stack
                                        direction="row"
                                        flexGrow={1}
                                        sx={{ position: "absolute", right: "5px", top: "1px" }}
                                        justifyContent="flex-end"
                                        alignItems="start"
                                    >
                                        {((message.appealType === "whatsapp" && message.messageSecretKey) || !message.appealType) && (
                                            <ChatMessagePopup message={message} />
                                        )}
                                    </Stack>
                                </Stack>
                            )}
                            {message.prevAnswerMessage && (
                                <Stack
                                    direction="row"
                                    sx={{
                                        p: 1,
                                        boxShadow: 0,
                                        borderRadius: 2,
                                        bgcolor: "rgba(0,0,0,0.1)",
                                        width: "100%",
                                        marginBottom: "10px",
                                    }}
                                >
                                    {renderAnswerMessage({ message: message.prevAnswerMessage, chat })}
                                </Stack>
                            )}
                            {messageContent({ message })}
                        </Box>
                    )}
                    {message.type === MessageTypeEnum.CALL && <Call message={message} />}
                    <Box sx={{ position: "absolute", right: "8px", bottom: "3px" }}>
                        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing="4px">
                            <Time timestamp={timestamp} formatStr="HH:mm" type={type} />
                            {messageAuthor?.id === currentUserId?.id &&
                                ![MessageTypeEnum.TRANSFER, MessageTypeEnum.CALL, MessageTypeEnum.COMMENTARY].includes(type) && (
                                    <ReadMark status={status} appealType={appealType} />
                                )}
                            {errors[message.status] && (
                                <Tooltip title={errors[message.status]}>
                                    <ErrorIcon sx={{ color: "red" }} />
                                </Tooltip>
                            )}
                        </Stack>
                    </Box>
                </Box>
            );
        },
        [message, chat]
    );

    const renderAnswerMessage = useCallback(
        ({ message, chat }: { message: MessageType; chat: ChatType }) => {
            const isAuthor = Boolean(message.messageAuthor);
            const isAppeal = Boolean(message.appeal && !isAuthor);

            return (
                <Box sx={{ position: "relative", paddingLeft: "15px" }}>
                    <Box
                        sx={{ position: "absolute", width: "5px", bgcolor: "#3f51b5", top: "-7px", left: "0px", bottom: "-7px" }}
                    />
                    {(isAuthor || isAppeal) && (
                        <Box sx={{ width: "100%" }}>
                            {type !== MessageTypeEnum.TRANSFER && (
                                <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                                    <Typography fontWeight={600} fontSize="12px" color="#3f51b5">
                                        {isAuthor
                                            ? message.messageAuthor?.fullName
                                            : chat?.["appeal.client.fullName"] || message.appeal?.name}
                                    </Typography>
                                    {isAppeal && (
                                        <Typography fontSize="12px" color="#667781">
                                            {chat?.["appeal.client.mobilePhone"] || chat?.phoneNumber}
                                        </Typography>
                                    )}
                                </Stack>
                            )}
                            {messageContent({ message, answer: true })}
                        </Box>
                    )}
                </Box>
            );
        },
        [message, chat]
    );

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : null
        );
    };

    const handleContextMenuClose = () => {
        setContextMenu(null);
    };

    return (
        <Box sx={{ direction: "column" }}>
            <Stack direction="column">
                <Box>
                    <Stack
                        direction="row"
                        justifyContent={messageAlign}
                        sx={{ position: "relative", maxWidth: "100%" }}
                        onContextMenu={handleContextMenu}
                    >
                        {appealType === AppelTypeEnum.whatsapp && type !== MessageTypeEnum.TRANSFER && message.messageAuthor && (
                            <Box sx={{ marginRight: "-30px", marginTop: "40px" }}>
                                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                                    <WhatsAppIcon
                                        sx={{
                                            color: "#fff",
                                            width: "25px",
                                            height: "25px",
                                            background: "#00E510",
                                            borderRadius: "50%",
                                            padding: "2px",
                                        }}
                                    />
                                </Stack>
                            </Box>
                        )}
                        {type === MessageTypeEnum.CALL && message["messageCall.type"] === "outgoing" && (
                            <Box sx={{ marginLeft: "10px" }}>
                                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                                    <DialerSipIcon
                                        sx={{
                                            color: message["messageCall.status"] === "answered" ? "green" : "red",
                                            width: "25px",
                                            height: "25px",
                                            marginRight: "10px",
                                        }}
                                    />
                                </Stack>
                            </Box>
                        )}
                        {!messageAuthor && type !== MessageTypeEnum.CALL && (
                            <Avatar sx={{ width: "30px", height: "30px", marginRight: "10px", fontSize: 12 }}>
                                {getChatClientName(chat)}
                            </Avatar>
                        )}
                        {messageAuthor && type !== MessageTypeEnum.TRANSFER && type !== MessageTypeEnum.CALL && (
                            <Avatar sx={{ width: "30px", height: "30px", marginRight: "10px", fontSize: 12 }}>
                                {getMessageAuthorName(messageAuthor)}
                            </Avatar>
                        )}
                        <Box
                            sx={{
                                bgcolor: bgColor,
                                padding: 1,
                                borderRadius: 2,
                                opacity: type === MessageTypeEnum.TRANSFER ? 0.64 : 1,
                                marginBottom: 1,
                                boxShadow: theme.shadows[2],
                                maxWidth: "90%",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "flex-end",
                                position: "relative",
                            }}
                        >
                            {/* <Menu
                                open={contextMenu !== null}
                                onClose={handleContextMenuClose}
                                anchorReference="anchorPosition"
                                anchorPosition={
                                    contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                                }
                            >
                                <MenuItem
                                    onClick={() => {
                                        setOpenNewTaskPopup(true);
                                        handleContextMenuClose();
                                    }}
                                >
                                    <ListItemIcon>
                                        <AddIcon />
                                    </ListItemIcon>
                                    <ListItemText>Создать задачу</ListItemText>
                                </MenuItem>
                            </Menu> */}
                            {renderMessage({ message, chat })}
                        </Box>
                        {appealType === AppelTypeEnum.whatsapp && type !== MessageTypeEnum.TRANSFER && !message.messageAuthor && (
                            <Box sx={{ marginLeft: "10px" }}>
                                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                                    <WhatsAppIcon
                                        sx={{
                                            color: "#fff",
                                            width: "25px",
                                            height: "25px",
                                            background: "#00E510",
                                            borderRadius: "50%",
                                            padding: "2px",
                                        }}
                                    />
                                </Stack>
                            </Box>
                        )}
                        {type === MessageTypeEnum.CALL && message["messageCall.type"] === "incoming" && (
                            <Box sx={{ marginLeft: "10px" }}>
                                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                                    <DialerSipIcon
                                        sx={{
                                            color: message["messageCall.status"] === "answered" ? "green" : "red",
                                            width: "25px",
                                            height: "25px",
                                        }}
                                    />
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

export default memo(ChatMessage);
