"use client";
import { Box, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { useSocketStore } from "./store/socketStore";
import React, { Suspense, memo, useCallback, useEffect, useRef, useState } from "react";
import theme from "./styles/theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useChatMessage } from "./store/message";
import { useChatStore } from "./store/chatStore";
import { useChatUserStore } from "./store/chatUser";
import { useScrollStore } from "./store/scrollStore";
import { MessageType, MessageTypeEnum } from "./types/chatTypes";
const AnswerMessage = React.lazy(() => import("./elements/AnswerMessage"));
const ChatMessage = React.lazy(() => import("./elements/ChatMessage"));
import ChatMainBackground from "@/assets/chat/istockphoto-1139840314-612x612.jpg"

function getMessageDate(timeStamp: number) {
    let date = parseTimeStamp(timeStamp);
    if (date.length > 5) {
        return { type: MessageTypeEnum.DATE, text: date };
    } else {
        return { type: "time", text: date };
    }
}

function parseTimeStamp(timeStamp: number) {
    let date = new Date(timeStamp * 1000);
    let today = new Date();
    if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    ) {
        return `${getTwoNumber(date.getHours())}:${getTwoNumber(date.getMinutes())}`;
    } else {
        return date.toLocaleDateString("ru-RU", { hour: "numeric", minute: "numeric", second: "numeric", hour12: false });
    }
}

function getTwoNumber(number: number) {
    if (number < 10) {
        return `0${number}`;
    }
    return number;
}
interface ShowDatePropsType {
    body: string;
    type: MessageTypeEnum.DATE | MessageTypeEnum.TODAY;
}

function ShowDate({ body, type, ...props }: ShowDatePropsType) {
    return (
        <Stack direction="row" justifyContent="center" mb={1}>
            <Box
                sx={{
                    background: "#fff",
                    zIndex: 2,
                    padding: "8px 14px",
                    borderRadius: "5px",
                    color: "#667781",
                    fontSize: "12px",
                    boxShadow: theme.shadows[2],
                }}
            >
                <Typography fontSize={13}>{body}</Typography>
            </Box>
        </Stack>
    );
}

type ChatMainPropsType = {
    order?: boolean;
};

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const ChatMain = ({ order, ...props }: ChatMainPropsType) => {
    const { sendEvent } = useSocketStore((state) => (state));
    const { scrollTop, setScrollTop, scrollIntoViewBehavior } = useScrollStore();
    const { currentUserId } = useChatUserStore((state) => state);
    const { chat } = useChatStore((state) => state);
    const { messages, messagesTotal, oldMessageLoading, setOldMessageLoading, answerSelectMessage } = useChatMessage(
        (state) => state
    );
    const container = useRef<any>(null);
    const messageEndRef = useRef<any>(null);
    const [showMessageEndRef, setShowMessageSendRef] = useState<boolean>(false);
    const [limit, setLimit] = useState<number>(40);
    const [offset, setOffset] = useState(0);
    const backgroundImage = ChatMainBackground;
    const loadMoreRef = useRef(null);
    const [showButton, setShowButton] = useState<boolean>(false);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const [currentChatMessages, setCurrentChatMessages] = useState<MessageType[]>([]);
    const [total, setTotal] = useState<boolean>(false);

    useEffect(() => {
        let timeoute: any = null;
        if (chat && messages) {
            const chatMessages = messages.find((chatMessage) => chatMessage.chatId === chat.id);
            if (chatMessages) {
                if (chatMessages.messages.length > 0 && messagesTotal && chatMessages.messages.length < messagesTotal) {
                    setTotal(true);
                } else {
                    setTotal(false);
                }
                setCurrentChatMessages(chatMessages.messages);
                setShowMessageSendRef(true);
            }
            // timeoute = setTimeout(() => {
            //     setShowMessageSendRef(true);
            // }, 550);
        }
        return () => {
            if (timeoute) {
                clearTimeout(timeoute);
            }
        };
    }, [messages, chat]);

    useEffect(() => {
        let t: any = null;
        if (chat && chat?.unreadMessageCount > 0) {
            t = setTimeout(() => {
                sendEvent({
                    event: "isReadMessages",
                    data: {
                        chat: chat,
                        user: currentUserId,
                    },
                });
            }, 2000);
        }
        return () => {
            clearTimeout(t);
        }
    }, [messages]);

    useEffect(() => {
        const timeoute = setTimeout(() => {
            if (total) {
                setShowButton(true);
            }
        }, 550);
        return () => {
            clearTimeout(timeoute);
        };
    }, [messages, total]);

    const onClickExpandMoreIcon = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setLimit(40);
        setOffset(0);
        setShowButton(false);
    }, [chat, sendEvent]);

    const onClickGetMessages = useCallback(() => {
        if (chat) {
            setOffset(offset + 40);
            setShowButton(false);
        }
    }, [chat, setLimit, offset, setShowButton, limit, setOffset]);

    useEffect(() => {
        if (container.current) {
            const chatContainer = container.current;
            messageEndRef.current?.scrollIntoView({ behavior: scrollIntoViewBehavior });
            const handleScroll = () => {
                const isUserAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 500;
                setIsAtBottom(isUserAtBottom);
            };
            chatContainer.addEventListener("scroll", handleScroll);
        }
    }, [chat]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            console.log("isAtBottom: ", isAtBottom)
            if (isAtBottom) {
                messageEndRef.current?.scrollIntoView({ behavior: scrollIntoViewBehavior });

            }
            if (currentChatMessages.length > 0 && scrollTop) {
                container.current.scrollTop = container.current.scrollHeight - scrollTop;
                setScrollTop(null);
            }
        }, 0);
        return () => {
            clearTimeout(timeout);
        };
    }, [messages, scrollIntoViewBehavior, messageEndRef.current, showMessageEndRef, isAtBottom]);

    useEffect(() => {
        if (chat && offset > 0) {
            setOldMessageLoading(true);
            sendEvent({
                event: "getOldMessages",
                data: {
                    chat,
                    offset,
                    scrollTop: container.current.scrollHeight,
                },
            });
        }
    }, [offset]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && total && showButton) {
                    onClickGetMessages();
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 1,
            }
        );
        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }
    }, [showButton]);

    return (
        <Box
            sx={{
                height: '590px',
                flexGrow: 1,
                background: "#f5f5f5",
                overflow: "hidden",
                position: "relative",
                marginTop: '89px',
                backgroundColor: "rgba(0,0,0,0.15)",
                // paddingTop: '100px',
                "::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "130px 130px",
                    backgroundPosition: "top left",
                    backgroundRepeat: "repeat",
                    opacity: 0.2,
                    zIndex: 0,
                },
            }}
        >
            <Stack
                ref={container}
                sx={{
                    height: `100%`,
                    overflow: "auto",
                    overflowY: "auto",
                    position: 'relative',
                    "&::-webkit-scrollbar": {
                        width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f1f1f1",
                        borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#888",
                        borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#555",
                    },
                }}
                direction="column"
                padding={2}
            >
                {showButton && (
                    <Box
                        ref={loadMoreRef}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1,
                        }}
                    ></Box>
                )}
                {oldMessageLoading && (
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1,
                            marginTop: "-15px",
                        }}
                    >
                        <Box sx={{ marginBottom: "10px" }}>
                            <IconButton>
                                <CircularProgress size={30} sx={{ marginBottom: "-7px" }} />
                            </IconButton>
                        </Box>
                    </Box>
                )}
                {currentChatMessages
                    .slice()
                    .reverse()
                    .reduce((acc, message: MessageType, idx, arr: MessageType[]) => {
                        let messageTimeStamp = getMessageDate(message.timestamp);
                        let nextMessage = arr[idx + 1] ? arr[idx + 1] : null;
                        const isFirstInGroup = idx === 0 || nextMessage?.messageAuthor?.id !== message.messageAuthor?.id;
                        if (messageTimeStamp.type === MessageTypeEnum.DATE) {
                            let messageTimeStampArr = messageTimeStamp.text.split(",");
                            let messageDate = messageTimeStampArr[0];
                            let newMessagesDate = acc.some(
                                (el) => el && el.props && el.props.type === MessageTypeEnum.DATE && el.props.body === messageDate
                            );
                            if (!newMessagesDate) {
                                return acc
                                    .concat(<ShowDate key={generateId()} body={messageDate} type={MessageTypeEnum.DATE} />)
                                    .concat(
                                        <Suspense key={message.id}>
                                            <ChatMessage isFirstInGroup={isFirstInGroup} message={message} />
                                        </Suspense>
                                    );
                            }
                        } else {
                            let today = acc.some((el) => el && el.props && el.props.type === MessageTypeEnum.TODAY);
                            if (!today) {
                                return acc
                                    .concat(<ShowDate key={generateId()} body="СЕГОДНЯ" type={MessageTypeEnum.TODAY} />)
                                    .concat(
                                        <Suspense key={message.id}>
                                            <ChatMessage isFirstInGroup={isFirstInGroup} message={message} />
                                        </Suspense>
                                    );
                            }
                        }
                        return acc.concat(
                            <Suspense key={message.id}>
                                <ChatMessage isFirstInGroup={isFirstInGroup} message={message} />
                            </Suspense>
                        );
                    }, [] as JSX.Element[])}
                {showMessageEndRef && <Box ref={messageEndRef}></Box>}
                {!isAtBottom && (
                    <IconButton
                        sx={{
                            borderRadius: "50%",
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            bgcolor: "#3f51b5",
                            color: "#fff",
                            boxShadow: 3,
                            ":hover": {
                                bgcolor: "#3f51b5",
                            },
                        }}
                        onClick={onClickExpandMoreIcon}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                )}
            </Stack>
            {answerSelectMessage && (
                <Suspense>
                    <AnswerMessage />
                </Suspense>
            )}
        </Box>
    );
};

export default memo(ChatMain);
