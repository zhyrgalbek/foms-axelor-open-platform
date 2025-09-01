import { Box, Stack, Typography } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { grey } from "@mui/material/colors";
import { memo, useCallback } from "react";
import { MessageType } from "../types/chatTypes";
const DOMAIN = import.meta.env.VITE_PROXY_TARGET;
const CONTEXT = import.meta.env.VITE_PROXY_CONTEXT;

interface VideoPlayerPropsType {
    message?: MessageType;
    src?: string;
    answer?: boolean;
}

function VideoPlayer({ message, src, answer }: VideoPlayerPropsType) {
    const address = message ? `${DOMAIN}${CONTEXT}/ws/dms/inline/${message.fileId}` : src;
    const handleDownload = useCallback(() => {
        const link = document.createElement("a");
        link.href = message ? `${DOMAIN}${CONTEXT}/ws/dms/download/${message.fileId}` : "";
        link.download = message ? message.fileName : "";
        link.click();
    }, [message]);
    return (
        <Box>
            <Stack direction="row" alignItems="end">
                <video width={320} height={240} controls={!answer}>
                    <source src={address} type="video/mp4" />
                    <source src={address} type="video/3gp" />
                    Ваш браузер не поддерживает тип видео!
                </video>
                {!answer && (
                    <Box
                        sx={{
                            border: "1px solid #9e9e9e",
                            borderRadius: "50%",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                            marginLeft: "10px",
                            marginRight: "10px",
                            height: "30px",
                            cursor: "pointer",
                        }}
                        onClick={handleDownload}
                    >
                        <Stack direction="row" justifyContent="center" alignItems="center" height="100%">
                            <FileDownloadIcon fontSize="small" sx={{ color: grey[500] }} />
                        </Stack>
                    </Box>
                )}
            </Stack>
            {message && message.caption && (
                <Typography fontSize={11.5} sx={{ marginRight: "30px" }}>
                    {<pre style={{ textWrap: "wrap" }}>{message.caption}</pre>}
                </Typography>
            )}
        </Box>
    );
}

export default memo(VideoPlayer);
