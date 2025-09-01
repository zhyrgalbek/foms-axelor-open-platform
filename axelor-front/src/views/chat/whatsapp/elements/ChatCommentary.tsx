import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Modal,
    Stack,
    TextareaAutosize,
    Typography,
    styled,
  } from "@mui/material";
  import CloseIcon from "@mui/icons-material/Close";
  import { ChangeEvent, memo, useCallback, useEffect, useState } from "react";
  import { useSocketStore } from "../store/socketStore";
  import { createTimeStamp } from "../helpers/helpers";
  import { CommentaryVariant, useChatCommentary } from "../store/chatCommentary";
  import { useWhatsappTemplate } from "../store/whatsappTemplate";
  import { useChatStore } from "../store/chatStore";
  import { useChatUserStore } from "../store/chatUser";
import { MessageTypeEnum } from "../types/chatTypes";
  
  const style = {
    position: "relative",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  
  const Textarea = styled(TextareaAutosize)(
    () => `
        box-sizing: border-box;
        width: 100%;
        font-weight: 400;
        line-height: 1.5;
        border-radius: 4px;
        color: #1C2025;
        background: #fff;
        resize: none;
        border: none;
        &:hover {
          // border-color: #3399FF;
        }
    
        &:focus {
          outline: 0;
          // border-color: #3399FF;
        }
    
        &:focus-visible {
          outline: 0;
        }
      `
  );
  
  function ChatCommentary({ openModal, handleCloseModal }: { openModal: boolean; handleCloseModal: () => void }) {
    const chatCommentaryStory = useChatCommentary();
    const [disabled, setDisabled] = useState<boolean>(true);
    const { sendEvent } = useSocketStore();
    const { currentUserId } = useChatUserStore((state) => state);
    const { chat } = useChatStore((state) => state);
    const { setLoadingTemplateMessage, loadingTemplateMessage } = useWhatsappTemplate((state) => state);
    const [value, setValue] = useState<string>("");
  
    const sendCommentary = useCallback(() => {
      if (chatCommentaryStory.variant === CommentaryVariant.sendCommentary) {
        sendEvent({
          event: "sendCommentary",
          data: {
            messageAuthor: currentUserId,
            message: {
              type: MessageTypeEnum.COMMENTARY,
              timestamp: createTimeStamp(),
              text: {
                body: value,
              },
            },
            chat,
          },
        });
        chatCommentaryStory.handleCloseChatCommentary();
      }
      if (chatCommentaryStory.variant === CommentaryVariant.updateCommentary) {
        sendEvent({
          event: "updateCommentary",
          data: {
            chat,
            messageAuthor: currentUserId,
            message: {
              id: chatCommentaryStory.message?.id,
              timestamp: createTimeStamp(),
              text: {
                body: value,
              },
            },
          },
        });
        setLoadingTemplateMessage(true);
      }
    }, [chatCommentaryStory, sendEvent, currentUserId, value]);
  
    useEffect(() => {
      if (chatCommentaryStory.variant === CommentaryVariant.sendCommentary) {
        setValue(chatCommentaryStory.commentary);
      }
      if (chatCommentaryStory.variant === CommentaryVariant.updateCommentary && chatCommentaryStory.message) {
        setValue(chatCommentaryStory.message?.body);
      }
    }, [chatCommentaryStory, chatCommentaryStory.openChatCommentary]);
  
    useEffect(() => {
      if (chatCommentaryStory.variant === CommentaryVariant.sendCommentary) {
        if (chatCommentaryStory.commentary !== value) {
          setDisabled(false);
        } else {
          setDisabled(true);
        }
      }
      if (chatCommentaryStory.variant === CommentaryVariant.updateCommentary) {
        if (chatCommentaryStory.message?.body !== value) {
          setDisabled(false);
        } else {
          setDisabled(true);
        }
      }
    }, [value]);
  
    useEffect(() => {
      if (!loadingTemplateMessage) {
        chatCommentaryStory.handleCloseChatCommentary();
      }
    }, [loadingTemplateMessage]);
  
    return (
      <Modal open={openModal} sx={{ display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1301 }}>
        <Box sx={style}>
          {loadingTemplateMessage && (
            <Stack
              sx={{ position: "absolute", right: 0, left: 0, top: 0, bottom: 0, background: "#f5f5f5", zIndex: 100 }}
              alignItems="center"
              justifyContent="center"
              direction="row"
            >
              <CircularProgress />
            </Stack>
          )}
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            onClick={() => {
              setDisabled(true);
              setValue("");
              handleCloseModal();
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ mt: "8px", mb: "8px", color: "rgba(0, 0, 0, 0.6)" }} fontWeight={500} fontSize={13}>
            Комментарии:
          </Typography>
          <Box sx={{ border: "1px solid #C7D0DD", p: 1, overflow: "auto", height: "250px" }}>
            <Textarea
              minRows={10}
              cols={40}
              value={value}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setValue(e.target.value);
              }}
            />
          </Box>
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={sendCommentary} disabled={disabled}>
              Сохранить
            </Button>
          </Stack>
        </Box>
      </Modal>
    );
  }
  export default memo(ChatCommentary);
  