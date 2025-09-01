import { CommentaryVariant, useChatCommentary } from "../store/chatCommentary";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, IconButton, MenuItem, Popover, Typography } from "@mui/material";
import { memo, useCallback, useState } from "react";
import { useChatMessage } from "../store/message";
import { MessageType, MessageTypeEnum } from "../types/chatTypes";

interface ChatMessagePopupType {
  message: MessageType;
}

function ChatMessagePopup({ message }: ChatMessagePopupType) {
  const { setAnswerSelectMessage } = useChatMessage();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const chatCommentaryStory = useChatCommentary();
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClickAnswer = useCallback(() => {
    setAnswerSelectMessage(message);
    handleClose();
  }, [setAnswerSelectMessage, handleClose, message]);

  const onClickUpdateCommentary = useCallback(() => {
    chatCommentaryStory.handleOpenChatCommentary(CommentaryVariant.updateCommentary, message);
    handleClose();
  }, [chatCommentaryStory, message, handleClose]);

  return (
    <>
      <IconButton aria-describedby={id} onClick={handleClick} sx={{ p: 0, m: 0 }}>
        <KeyboardArrowDownIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        slotProps={{
          // disablePortal: true,
          paper: {
            sx: {
              zIndex: 1000,
            },
          },
        }}
      >
        <Box sx={{ p: 0.5 }}>
          {message.type !== MessageTypeEnum.COMMENTARY && (
            <MenuItem onClick={onClickAnswer}>
              <Typography fontSize={11}>Ответить</Typography>
            </MenuItem>
          )}
          {message.type === MessageTypeEnum.COMMENTARY && (
            <MenuItem onClick={onClickUpdateCommentary}>
              <Typography fontSize={11}>Изменить</Typography>
            </MenuItem>
          )}
        </Box>
      </Popover>
    </>
  );
}

export default memo(ChatMessagePopup);
