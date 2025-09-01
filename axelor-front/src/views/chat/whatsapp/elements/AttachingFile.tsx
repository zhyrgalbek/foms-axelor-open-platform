"use client";
import { Add } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React, { memo } from "react";

import { styled } from "@mui/material";

export const VisuallyHiddenInput = styled("input")({
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
  whiteSpace: "nowrap",
  opacity: 0,
  width: "30px",
  height: "30px",
});


function AttachingFile({ onChange, ...props }: { onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <IconButton sx={{ position: "relative" }} {...props}>
      <VisuallyHiddenInput
        type="file"
        onChange={onChange}
        accept="image/jpeg, 
                image/png, 
                text/plain, 
                application/pdf, 
                application/vnd.ms-powerpoint, 
                application/msword, 
                application/vnd.ms-excel,
                application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                application/vnd.openxmlformats-officedocument.presentationml.presentation,
                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                image/webp,
                video/3gp,
                video/mp4,
                audio/aac,
                audio/amr,
                audio/mpeg,
                audio/mp4,
                audio/ogg"
        multiple
      />
      <Add sx={{ color: "#3f51b5" }} />
    </IconButton>
  );
}

export default memo(AttachingFile);
