"use client";
import {
  Box,
  Button,
  Card,
  Skeleton,
  Stack,
  Typography,
  styled,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  SnackbarOrigin,
  Alert,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  CircularProgress,
} from "@mui/material";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import SendButton from "./elements/SendButton";
import AttachingFile from "./elements/AttachingFile";
import ShowSelectDocument from "./elements/ShowSelectDocument";
import AudioRecording from "./elements/AudioRecoding";
import { TextareaAutosize } from "@mui/material";
import { useSocketStore } from "./store/socketStore";
import { enqueueSnackbar } from "notistack";
import TextsmsIcon from "@mui/icons-material/Textsms";
import TemplateComponent from "./elements/TemplateComponent";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import data from "@emoji-mart/data/sets/15/apple.json";
import Picker from "@emoji-mart/react";
import Paper from "@mui/material/Paper";
import { createTimeStamp } from "./helpers/helpers";
import { TemplateType, TemplateVariantEnum, useMessageTemplateStore } from "./store/messageTemplate";
import { useChatMessage } from "./store/message";
import { useChatStore } from "./store/chatStore";
import { useChatUserStore } from "./store/chatUser";
import { ChatBoxVariant, CompletedUserType, MemberType, MessageTypeEnum } from "./types/chatTypes";

export const Textarea = styled(TextareaAutosize)(
  ({ order }: { order: string }) => `
    box-sizing: border-box;
    width: 100%;
    font-weight: 400;
    line-height: 1.5;
    padding: ${order === "true" ? "8px" : "12px"};
    border-radius: 4px;
    color: #1C2025;
    background: #fff;
    border: 1px solid #C7D0DD;
    resize: none;
    border: none;
    &:hover {
      border-color: #3399FF;
    }

    &:focus {
      outline: 0;
      border-color: #3399FF;
    }

    &:focus-visible {
      outline: 0;
    }

  `
);

export interface SelectFileStateType {
  file: File;
  fileBase64: string | ArrayBuffer | null;
}
interface StateSnackType extends SnackbarOrigin {
  openSnack: boolean;
}
const readAsDataURL = (blob: Blob) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function () {
      resolve(reader.result);
    };
  })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return error;
    });
};
interface ChatFooterPropsType {
  order: boolean;
  variant: ChatBoxVariant;
}

const ChatFooter = ({ order, variant, ...props }: ChatFooterPropsType) => {
  const [value, setValue] = useState<string>("");
  const [currentIsTyping, setCurrentIsTyping] = useState<boolean>(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [stateBtn, setStateBtn] = useState(1);
  const [showCommands, setShowCommands] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectFileStateType[]>([]);
  const { sendEvent } = useSocketStore((state) => state);
  const { currentUserId } = useChatUserStore((state) => state);
  const { chat, setCompletedLoading, completedLoading, isTyping } = useChatStore((state) => state);
  const {
    messageLoading,
    sendMessageLoading,
    setSendMessageLoading,
    setMessageLoading,
    setAnswerSelectMessage,
    answerSelectMessage,
  } = useChatMessage((state) => state);
  const [complete, setComplete] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<MessageTypeEnum>(MessageTypeEnum.TEXT);
  const useMessageTemplate = useMessageTemplateStore((state) => state);
  const [caption, setCaption] = useState<string | null>(null);
  const [state, setState] = React.useState<StateSnackType>({
    openSnack: false,
    vertical: "bottom",
    horizontal: "center",
  });
  const { vertical, horizontal, openSnack } = state;
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {

      const items = e.clipboardData.items;

      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === "file") {
            const blob: any = items[i].getAsFile();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = (e: any) => {
              const dataUrl = e.target.result;
              setSelectedFiles([
                {
                  fileBase64: dataUrl,
                  file: blob,
                },
              ]);
            };
            reader.onerror = function () {
              enqueueSnackbar("Не удалось распознать файл", { variant: "error" });
            };
          }
        }

      }
    },
    [enqueueSnackbar, setSelectedFiles]
  );

  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event && event.target && event.target.files) {
        let filesArray = Array.from(event.target.files);
        let fileReaders: Promise<SelectFileStateType>[] = filesArray.map((file) => {
          return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({ file, fileBase64: reader.result });
            reader.onerror = () => reject(reader.onerror);
          });
        });

        Promise.all(fileReaders)
          .then((filesWithBase64) => {
            const validFiles = filesWithBase64.filter((file) => file !== null) as SelectFileStateType[];
            setSelectedFiles([...selectedFiles, ...validFiles]);
          })
          .catch((error) => {
            console.log("Ошибка при чтении файлов: ", error);
          });
      }
    },
    [setSelectedFiles, selectedFiles]
  );

  const handleClickSnack = (newState: StateSnackType) => {
    setState({ ...newState, openSnack: true });
  };

  const sendMessage = useCallback(() => {
    if (value.length >= 4096) {
      handleClickSnack({
        openSnack: true,
        vertical: "top",
        horizontal: "center",
      });
      return;
    }
    setSendMessageLoading(true);
    sendEvent({
      event: "sendMessage",
      data: {
        messageAuthor: currentUserId,
        chat: chat,
        message: {
          type: MessageTypeEnum.TEXT,
          timestamp: createTimeStamp(),
          text: {
            body: value,
          },
        },
        prevMessage: answerSelectMessage,
        currentUserId,
      },
    });
    setValue("");
    setAnswerSelectMessage(null);
  }, [
    value,
    handleClickSnack,
    setSendMessageLoading,
    sendEvent,
    setValue,
    setAnswerSelectMessage,
    currentUserId,
    chat,
    answerSelectMessage,
  ]);

  const sendMessageWhatsapp = useCallback(() => {
    if (value.length >= 4096) {
      handleClickSnack({
        openSnack: true,
        vertical: "top",
        horizontal: "center",
      });
      return;
    }
    setSendMessageLoading(true);
    const data = {
      messageAuthor: currentUserId,
      chat: chat,
      message: {
        type: messageType,
        timestamp: createTimeStamp(),
        text: {
          body: value,
        },
      },
      prevMessageSecretKey: answerSelectMessage?.messageSecretKey,
    };
    sendEvent({
      event: "sendMessageWhatsapp",
      data: data,
    });
    setValue("");
    setAnswerSelectMessage(null);
  }, [
    value,
    handleClickSnack,
    setSendMessageLoading,
    sendEvent,
    setValue,
    setAnswerSelectMessage,
    currentUserId,
    chat,
    messageType,
    answerSelectMessage,
  ]);

  const onClickBeginChat = useCallback(() => {
    setMessageLoading(true);
    setCompletedLoading(true);
    sendEvent({
      event: "updateAppeal",
      data: {
        currentUserId,
        appeal: { ...chat?.appeal, chat: chat },
        status: 2,
      },
    });
  }, [setMessageLoading, setCompletedLoading, sendEvent, chat]);

  const handleOpenPopup = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setValue((prevValue) => prevValue + emoji.native);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = event.target.value;
    setValue(inputValue);
  };

  const handleCommandClick = useCallback(
    async (el: TemplateType) => {
      if (!el.templateFile1 && !el.templateFile2 && !el.templateFile3) {
        setValue(el?.content);
        setShowCommands(false);
      } else {
        let filesToProcess = [el.templateFile1, el.templateFile2, el.templateFile3];
        for (const templateFile of filesToProcess) {
          if (templateFile) {
            const blob = await useMessageTemplate.getTemplateFile({
              fileId: templateFile.id,
              fileVersion: templateFile.$version,
              templateId: el.id,
              fileName: templateFile.fileName,
            });
            let fileBase64: any = await readAsDataURL(blob);
            setSelectedFiles((prev) => [...prev, { file: blob, fileBase64: fileBase64 }]);
          }
        }
        setShowCommands(false);
        setCaption(el.content);
        setValue("");
      }
    },
    [setValue, setShowCommands, useMessageTemplate, setSelectedFiles, setCaption]
  );

  const handleCloseSnack = () => {
    setState({ ...state, openSnack: false });
  };

  const onChangeTemplate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      useMessageTemplate.postTemplate({ TemplateVariant: e.target.value as TemplateVariantEnum });
    },
    [useMessageTemplate]
  );

  const onKeyUpFunc = useCallback(() => {
    if (!currentIsTyping) {
      setCurrentIsTyping(true);
      sendEvent({
        event: "typing",
        data: {
          currentUserId,
          isTyping: true,
          chat,
        },
      });
    }
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => {
      setCurrentIsTyping(false);
      sendEvent({
        event: "typing",
        data: {
          currentUserId,
          isTyping: false,
          chat,
        },
      });
    }, 1000);
  }, [currentIsTyping, typingTimeout, setCurrentIsTyping, sendEvent, clearTimeout, currentUserId, chat]);

  const onClickMicrophone = () => {
    if (stateBtn === 1) {
      setStateBtn(2);
    }
    if (stateBtn === 2) {
      setStateBtn(1);
    }
  };

  useEffect(() => {
    if (chat?.appeal) {
      let findCompleteChat = chat.completedUsers?.find((el: CompletedUserType) => el.id === currentUserId?.id);
      if (findCompleteChat) {
        setComplete(true);
      } else {
        setComplete(false);
      }
    }
  }, [chat]);

  useEffect(() => {
    if (value === "") {
      setStateBtn(1);
    }
    if (value !== "") {
      setStateBtn(3);
    }
  }, [value, selectedFiles]);

  useEffect(() => {
    var valueTemplateTimeout: any;
    if (value && value.length === 1 && value === "-") {
      useMessageTemplate.postTemplate({});
      setShowCommands(true);
    }
    if (value && value.startsWith("-")) {
      if (value?.length > 1) {
        valueTemplateTimeout = setTimeout(() => {
          useMessageTemplate.postTemplateSearch({ name: value.substring(1) });
        }, 1000);
      }
    } else {
      setShowCommands(false);
    }
    return () => {
      if (valueTemplateTimeout) {
        clearTimeout(valueTemplateTimeout);
      }
    };
  }, [value]);

  return (
    <Card sx={{ py: 1, bgcolor: "#F0F2F5", height: '90px' }}>
      {selectedFiles.length > 0 && (
        <ShowSelectDocument
          selectFiles={selectedFiles}
          alt="Hello world"
          setSelectedFiles={setSelectedFiles}
          onChange={onChangeFile}
          caption={caption as string}
          setCaption={setCaption}
          variant={variant}
        />
      )}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openSnack}
        onClose={handleCloseSnack}
        key={vertical + horizontal}
      >
        <Alert onClose={handleCloseSnack} severity="error" variant="filled">
          Длина собщений не должна превышать 4096 символов!
        </Alert>
      </Snackbar>
      <Box p={1}>
        {sendMessageLoading && (
          <Stack
            sx={{
              position: "absolute",
              bottom: 0,
              height: "82px",
              left: 0,
              zIndex: 100,
              background: "#fff",
              width: "100%",
            }}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress size={24} />
          </Stack>
        )}

        {!complete && isTyping && isTyping.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: "90px",
              background: "#bbdefb",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            {isTyping.map((userType: MemberType) => {
              return (
                <Typography key={userType.id} sx={{ fontSize: 12 }}>
                  {userType.fullName} печатает ...
                </Typography>
              );
            })}
          </Box>
        )}
        {complete && (
          <Stack direction="column" alignItems="flex-start" sx={{ position: "relative" }}>
            <Box>
              {!messageLoading && (
                <Typography color="error">Вы завершили этот чат и не можете написать на этого клиента!</Typography>
              )}
              {messageLoading && <Skeleton animation="wave" variant="rounded" width={470} />}
            </Box>
            {(chat?.appeal?.status === 3 || chat?.appeal?.status === 1 || chat?.appeal?.status === 2) && (
              <Box>
                {!messageLoading && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TextsmsIcon fontSize="small" />}
                    sx={{
                      whiteSpace: "nowrap",
                      minWidth: "auto",
                    }}
                    onClick={onClickBeginChat}
                  >
                    <Typography fontSize={12} fontWeight={500}>
                      Начать чат
                    </Typography>
                    {completedLoading && <CircularProgress size={18} sx={{ marginLeft: "10px" }} />}
                  </Button>
                )}
                {messageLoading && (
                  <Skeleton animation="wave" variant="rounded" width={120} sx={{ marginTop: "10px" }} />
                )}
              </Box>
            )}
          </Stack>
        )}
        {!complete && (
          <>
            {showCommands && (
              <Paper sx={{ position: "absolute", bottom: "80px", left: 0, width: "100%", zIndex: 10 }}>
                <List sx={{ position: "relative" }}>
                  <ListItem>
                    <FormControl>
                      <Stack>
                        <FormLabel id="demo-radio-buttons-group-label">Шаблоны сообщений</FormLabel>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          defaultValue="female"
                          name="radio-bufttons-group"
                        >
                          <Stack direction="row">
                            <FormControlLabel
                              value={TemplateVariantEnum.isDefault}
                              control={<Radio onChange={onChangeTemplate} size="small" />}
                              label={<Typography fontSize={13}>Мои шаблоны</Typography>}
                            />
                            <FormControlLabel
                              value={TemplateVariantEnum.isSystem}
                              control={<Radio onChange={onChangeTemplate} size="small" />}
                              label={<Typography fontSize={13}>Общие шаблоны</Typography>}
                            />
                          </Stack>
                        </RadioGroup>
                      </Stack>
                    </FormControl>
                  </ListItem>
                  {useMessageTemplate.template.map((el, index) => (
                    <ListItem key={el.id} onClick={() => handleCommandClick(el)} sx={{ cursor: "pointer" }}>
                      <ListItemText
                        sx={{ padding: "2px 8px", margin: 0 }}
                        primary={el?.content?.slice(0, 100)}
                        secondary={"-" + el?.name}
                      />
                    </ListItem>
                  ))}
                  {useMessageTemplate.template.length === 0 && (
                    <ListItem>
                      <ListItemText sx={{ padding: "2px 8px", margin: 0 }} primary="Нет такого шаблона" />
                    </ListItem>
                  )}
                  {useMessageTemplate.templateLoading && (
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      sx={{ position: "absolute", top: "75px", left: 0, right: 0, bottom: 0, background: "#fff" }}
                    >
                      <CircularProgress size={24} />
                    </Stack>
                  )}
                </List>
              </Paper>
            )}
            <Stack direction="row" alignItems="center" sx={{ position: "relative" }}>
              {!complete && messageLoading && (
                <Skeleton animation="wave" variant="rounded" width={30} height={30} sx={{ marginRight: "10px" }} />
              )}
              {!complete && !messageLoading && (
                <IconButton onClick={handleOpenPopup}>
                  <SentimentSatisfiedAltIcon sx={{ color: "#3f51b5" }} />
                </IconButton>
              )}
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopup}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                PaperProps={{
                  sx: {
                    borderRadius: "12px",
                    marginTop: "-10px",
                  },
                }}
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  previewPosition="none"
                  skinTonePosition="search"
                  set="apple"
                  locale="ru"
                />
              </Popover>
              {!complete && messageLoading && (
                <Skeleton animation="wave" variant="rounded" width={30} height={30} sx={{ marginRight: "10px" }} />
              )}
              {!complete && messageLoading && (
                <Skeleton animation="wave" variant="rounded" width={30} height={30} sx={{ marginRight: "10px" }} />
              )}
              {!complete && !messageLoading && <AttachingFile onChange={onChangeFile} />}
              {messageLoading && <Skeleton animation="wave" variant="rounded" sx={{ flexGrow: 1 }} height={50} />}
              {chat?.appeal && <TemplateComponent />}
              {!messageLoading && (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    background: "#fff",
                    borderRadius: "3px",
                    overflowX: "hidden",
                    overflowY: "auto",
                    maxHeight: "100px",
                    "&::-webkit-scrollbar": {
                      width: "0.3em",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,.1)",
                    },
                  }}
                >
                  <Textarea
                    minRows={1}
                    placeholder="Введите сообщение..."
                    value={value}
                    onPaste={handlePaste}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (value !== "" && !chat?.appeal) {
                          sendMessage();
                        }
                        if (value !== "" && chat?.appeal) {
                          sendMessageWhatsapp();
                        }
                      }
                    }}
                    onKeyUp={onKeyUpFunc}
                    order={order ? "true" : "false"}
                    autoFocus
                    disabled={messageType === MessageTypeEnum.TEMPLATE}
                  />
                </Box>
              )}
              {messageLoading && (
                <Skeleton animation="wave" variant="rounded" width={30} height={30} sx={{ marginLeft: "10px" }} />
              )}
              <AudioRecording state={stateBtn} onClickMicrophone={onClickMicrophone} variant={variant} />
              {!chat?.appeal && !messageLoading && (
                <SendButton state={stateBtn} onClickMicrophone={onClickMicrophone} onClick={sendMessage} />
              )}
              {chat?.appeal && !messageLoading && (
                <SendButton state={stateBtn} onClickMicrophone={onClickMicrophone} onClick={sendMessageWhatsapp} />
              )}
            </Stack>
          </>
        )}
      </Box>
    </Card>
  );
};

export default memo(ChatFooter);
