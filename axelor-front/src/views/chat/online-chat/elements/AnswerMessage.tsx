import { Box, IconButton, Stack, Typography } from "@mui/material";
import AudioPlayer from "./AudioPlayer";
import Photo from "./Photo";
import FileView from "./FileView";
import TemplateMessage from "./TemplateMessage";
import TransferMessage from "./TransferMessage";
import CloseIcon from "@mui/icons-material/Close";
import VideoPlayer from "./VideoPlayer";
import { memo, useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { useChatMessage } from "../store/message";
import { MessageTypeEnum } from "../types/chatTypes";
const DOMAIN = import.meta.env.VITE_PROXY_TARGET;
const CONTEXT = import.meta.env.VITE_PROXY_CONTEXT;
function AnswerMessage() {
    let { setAnswerSelectMessage, answerSelectMessage } = useChatMessage();
    const { chat } = useChatStore((state) => state);
    const onClose = useCallback(() => {
        setAnswerSelectMessage(null);
    }, [setAnswerSelectMessage]);
    return (
        <Box
            sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: "#fff",
                maxHeight: "200px",
                p: 2,
            }}
        >
            {answerSelectMessage && (
                <Box>
                    {answerSelectMessage.messageAuthor && (
                        <Box>
                            {answerSelectMessage.type !== MessageTypeEnum.TRANSFER && (
                                <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                                    <Typography fontWeight={600} fontSize="13px" color="#3f51b5">
                                        {answerSelectMessage.messageAuthor.fullName}
                                    </Typography>
                                </Stack>
                            )}

                            {answerSelectMessage.type === MessageTypeEnum.AUDIO && (
                                <AudioPlayer
                                    src={`${DOMAIN}${CONTEXT}/ws/dms/inline/${answerSelectMessage.fileId}`}
                                />
                            )}
                            {answerSelectMessage.type === MessageTypeEnum.IMAGE && <Photo message={answerSelectMessage} answer />}
                            {answerSelectMessage.type === MessageTypeEnum.DOCUMENT && (
                                <FileView message={answerSelectMessage} answer />
                            )}
                            {answerSelectMessage.type === MessageTypeEnum.VIDEO && (
                                <VideoPlayer message={answerSelectMessage} answer />
                            )}
                            {answerSelectMessage.type === MessageTypeEnum.TEXT && (
                                <Typography fontSize={11.5} sx={{ marginLeft: "10px" }}>
                                    <pre style={{ textWrap: "wrap" }}>{answerSelectMessage.body}</pre>
                                </Typography>
                            )}
                            {answerSelectMessage.type === MessageTypeEnum.TEMPLATE && (
                                <TemplateMessage body={answerSelectMessage.body} />
                            )}

                            {answerSelectMessage.type === MessageTypeEnum.TRANSFER && (
                                <TransferMessage message={answerSelectMessage} />
                            )}
                        </Box>
                    )}
                    {!answerSelectMessage.messageAuthor && !answerSelectMessage.appeal && (
                        <AudioPlayer
                            src={`${DOMAIN}${CONTEXT}/ws/dms/inline/${answerSelectMessage.fileId}`}
                        />
                    )}
                    {answerSelectMessage.appeal && !answerSelectMessage.messageAuthor && (
                        <Box>
                            <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                                <Stack direction="row" spacing={1}>
                                    <Typography fontWeight={600} fontSize="13px" color="#3f51b5">
                                        {chat?.["appeal.client.fullName"] || answerSelectMessage.appeal.name}
                                    </Typography>
                                    <Typography fontSize="12px" fontWeight={500}>
                                        {chat?.["appeal.client.mobilePhone"] || chat?.phoneNumber}
                                    </Typography>
                                </Stack>
                            </Stack>
                            {answerSelectMessage.type === MessageTypeEnum.AUDIO && (
                                <AudioPlayer
                                    src={`${DOMAIN}${CONTEXT}/ws/dms/inline/${answerSelectMessage.fileId}`}
                                />
                            )}
                            {answerSelectMessage.type === MessageTypeEnum.IMAGE && <Photo message={answerSelectMessage} answer />}
                            {answerSelectMessage.type === MessageTypeEnum.VIDEO && (
                                <VideoPlayer message={answerSelectMessage} answer />
                            )}
                            {answerSelectMessage.type === MessageTypeEnum.DOCUMENT && (
                                <FileView message={answerSelectMessage} answer />
                            )}
                            {answerSelectMessage.type === MessageTypeEnum.TEXT && (
                                <Typography fontSize={11.5} sx={{ marginLeft: "10px" }}>
                                    {
                                        <pre style={{ textWrap: "wrap" }}>
                                            {answerSelectMessage.body}
                                        </pre>
                                    }
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            )}
            <IconButton sx={{ position: "absolute", top: 4, right: 4 }} onClick={onClose}>
                <CloseIcon sx={{ width: "16px", height: "16px" }} />
            </IconButton>
        </Box>
    );
}

export default memo(AnswerMessage);
