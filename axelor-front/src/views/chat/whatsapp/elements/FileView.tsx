"use client";
import { grey } from "@mui/material/colors";
import { Description } from "@mui/icons-material";
import Box from "@mui/material/Box";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Stack, Typography } from "@mui/material";
import { memo } from "react";
import { MessageType } from "../types/chatTypes";
const DOMAIN = import.meta.env.VITE_PROXY_TARGET;
const CONTEXT = import.meta.env.VITE_PROXY_CONTEXT;
interface FileViewPropsType {
    message: MessageType;
    answer?: boolean;
}

const FileView = memo(({ message, answer }: FileViewPropsType) => {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = `${DOMAIN}${CONTEXT}/ws/dms/download/${message.fileId}`;
        link.download = message.fileName;
        link.click();
    };
    return (
        <Box sx={{ marginTop: "10px" }}>
            <Stack direction="row" alignContent="center">
                <Box sx={{ display: "flex" }}>
                    <Description
                        sx={{
                            width: answer ? "20px" : "40px",
                            height: answer ? "20px" : "40px",
                            color: grey[500],
                            marginRight: "10px",
                        }}
                    />
                    <Stack direction="column">
                        <Typography fontSize="13px" fontWeight={500}>
                            {message.fileName}
                        </Typography>
                        {!answer && (
                            <Stack direction="row" spacing={1}>
                                <Typography fontSize="13px" fontWeight={500} color={grey[500]}>
                                    {message.fileType.slice(0, 20)}...
                                </Typography>
                                <Typography fontSize="13px" fontWeight={500} color={grey[500]}>
                                    {message.fileSize}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Box>
                {!answer && (
                    <Box
                        sx={{
                            border: "1px solid #9e9e9e",
                            borderRadius: "50%",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                            marginLeft: "10px",
                            marginRight: "40px",
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
                <Typography fontSize={11.5} sx={{ marginRight: "30px", marginTop: "15px" }}>
                    {<pre style={{ textWrap: "wrap" }}>{message.caption}</pre>}
                </Typography>
            )}
        </Box>
    );
});

FileView.displayName = "FileView";

export default FileView;
