"use client";
import React, { memo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { MessageType } from "../types/chatTypes";
import "../index.css";
const DOMAIN = import.meta.env.VITE_PROXY_TARGET;
const CONTEXT = import.meta.env.VITE_PROXY_CONTEXT;
interface PhotoPropsType {
    message: MessageType;
    answer?: boolean;
}

const Photo = memo(({ message, answer }: PhotoPropsType) => {
    const src = `${DOMAIN}${CONTEXT}/ws/dms/inline/${message.fileId}`;
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = `${DOMAIN}${CONTEXT}/ws/dms/download/${message.fileId}`;
        link.download = message.fileName;
        link.click();
    };

    return (
        <>
            <Box sx={{ marginTop: "10px", marginRight: "40px" }}>
                <Stack direction="row" alignItems="end">
                    <a href={src} target="_blink">
                        <Box
                            component="img"
                            src={src}
                            alt={message.fileName}
                            loading="lazy"
                            sx={{
                                width: answer ? "60px" : "100%",
                                height: answer ? "60px" : "230px",
                                cursor: "pointer",
                                objectFit: "cover",
                            }}
                        />
                    </a>
                    {!answer && (
                        <Box
                            sx={{
                                border: "1px solid #9e9e9e",
                                borderRadius: "50%",
                                paddingLeft: "5px",
                                paddingRight: "5px",
                                marginLeft: "10px",
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
                {message.caption && (
                    <Typography fontSize={16} sx={{ marginRight: "30px", paddingTop: '10px' }}>
                        {<pre style={{ textWrap: "wrap", fontFamily: "Roboto" }}>{message.caption}</pre>}
                    </Typography>
                )}
            </Box>
        </>
    );
});

Photo.displayName = "Photo";

export default Photo;
