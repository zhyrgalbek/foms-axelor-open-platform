"use client";
import { KeyboardVoice, Send } from "@mui/icons-material";
import { Fab, IconButton, Zoom } from "@mui/material";
import { memo } from "react";
interface SendBtnPropsType {
  state: number;
  onClickMicrophone?: () => void;
  variant?: string;
  onClick?: () => void;
}

function SendButton({ state, onClickMicrophone, variant, onClick }: SendBtnPropsType) {
  return (
    <>
      {state === 1 && (
        <Zoom in={state === 1}>
          <IconButton sx={{ color: "#3f51b5" }} onClick={onClickMicrophone}>
            <KeyboardVoice sx={{ width: "20px", height: "20px" }} />
          </IconButton>
        </Zoom>
      )}
      {state === 3 && !variant && (
        <Zoom in={state === 3}>
          <IconButton sx={{ color: "#3f51b5" }} onClick={onClick}>
            <Send sx={{ width: "20px", height: "20px" }} />
          </IconButton>
        </Zoom>
      )}
      {state === 3 && variant === "fab" && (
        <Fab color="primary" onClick={onClick} sx={{ width: "40px", height: "40px" }}>
          <Send sx={{ width: "16px", height: "16px" }} />
        </Fab>
      )}
    </>
  );
}

export default memo(SendButton);
