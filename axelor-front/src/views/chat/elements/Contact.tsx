"use client";
import {
  Avatar,
  Badge,
  Box,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Time from "./Time";
import ReadMark from "./ReadMarker";
import { useSocketStore } from "../store/socketStore";
import { grey } from "@mui/material/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Description } from "@mui/icons-material";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { getContactName } from "../helpers/helpers";
import { memo, useCallback, useEffect, useState } from "react";

import AdjustIcon from "@mui/icons-material/Adjust";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useChatStore } from "../store/chatStore";
import { useChatUserStore } from "../store/chatUser";
import { ChatType, ClientType, ColleaguesType, CompletedUserType, MemberType, MessageTypeEnum } from "../types/chatTypes";



const Contact = memo(({ contact, setTransition }: { contact: ClientType | ColleaguesType, setTransition: (value: string) => void }) => {
  const { sendEvent } = useSocketStore((state) => state);
  const { currentUserId } = useChatUserStore((state) => state);
  const { chat, setChat } = useChatStore((state) => state);
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [toTr, setToTr] = useState<
    {
      id: number;
      fullName: string;
      code: string;
    }[]
  >([]);
  const [toTrCurrentUser, setToTrCurrentUser] = useState<{
    id: number;
    fullName: string;
    code: string;
  } | null>(null);

  const [members, setMembers] = useState<
    {
      code: string;
      fullName: string;
      id: number;
      version: number;
    }[]
  >([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [anchorElTransfer, setAnchorElTransfer] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const openTransfer = Boolean(anchorElTransfer);
  const idTransfer = openTransfer ? "simple-popover" : undefined;
  const [fullName, setFullName] = useState<string>("");

  const onClickListItem = useCallback(() => {
    setChat(contact as ChatType);
    sendEvent({
      event: "getChatMessages",
      data: {
        chat: contact,
        limit: 40,
      },
    });
    setTransition("chat");
  }, [setChat, sendEvent, contact]);

  const onContextMenu = (event: any) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onMouseEnterTransferIcon = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setAnchorElTransfer(event.currentTarget);
  };

  const handleCloseTransferIcon = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setAnchorElTransfer(null);
  };

  const onClickSupportAgent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (anchorElTransfer) {
      setAnchorElTransfer(e.currentTarget);
    }
    e.stopPropagation();
  };

  useEffect(() => {
    if (contact["appeal.id"]) {
      setFullName(`${contact["appeal.name"]} ${contact["appeal.firstName"] ?? ""}`);
    } else {
      setFullName(contact.fullName);
    }
  }, [contact]);

  useEffect(() => {
    if ("appeal" in contact && "members" in contact) {
      setMembers(
        contact.members.filter((el: MemberType) => {
          let member:
            | {
              code: string;
              fullName: string;
              id: number;
              // version: number;
            }
            | undefined = contact.completedUsers?.find((complUser: CompletedUserType) => complUser.id === el.id);
          if (!member) {
            return el;
          }
        })
      );
    }
  }, [contact]);

  useEffect(() => {
    if (contact && "appeal" in contact && contact?.appeal?.transfer && contact?.appeal?.transfer?.length > 0) {
      setToTr(contact.appeal.transfer[0].toTr);
    }
  }, [contact]);

  useEffect(() => {
    let findCurrentUser = toTr.find((el) => el.id === currentUserId?.id);
    if (findCurrentUser) {
      setToTrCurrentUser(findCurrentUser);
    }
  }, [toTr]);

  useEffect(() => {
    if (chat?.id === contact?.id) {
      setBgColor(grey[700]);
    } else {
      setBgColor("transparent");
    }
  }, [chat]);

  const renderLastMessage = useCallback(
    (contact: ClientType | ColleaguesType) => {
      switch (contact?.lastMessage?.type) {
        case MessageTypeEnum.TEXT: {
          return <Typography fontSize={16}>{contact?.lastMessage?.body?.slice(0, 40) + "..."}</Typography>;
        }
        case MessageTypeEnum.IMAGE: {
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PhotoCameraIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Фото</Typography>
            </Stack>
          );
        }
        case MessageTypeEnum.DOCUMENT: {
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Description sx={{ width: "18px", height: "18px" }} />{" "}
              <Typography fontSize={11}>{contact?.lastMessage?.fileName}</Typography>
            </Stack>
          );
        }
        case MessageTypeEnum.AUDIO: {
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <KeyboardVoiceIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Аудио</Typography>
            </Stack>
          );
        }
        case MessageTypeEnum.TEMPLATE: {
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography fontSize={11}>{JSON.parse(contact?.lastMessage?.body).body}</Typography>
            </Stack>
          );
        }
        case MessageTypeEnum.TRANSFER: {
          return (
            <Stack>
              <Typography>Вам передали чат</Typography>
            </Stack>
          );
        }
        case MessageTypeEnum.COMMENTARY: {
          return (
            <Stack>
              <Typography fontSize={14}>{contact?.lastMessage?.body?.slice(0, 40) + "..."}</Typography>
            </Stack>
          );
        }
      }
    },
    [contact]
  );

  return (
    <>
      <ListItemButton
        key={contact?.id}
        sx={{
          borderBottom: "1px solid #9e9e9e3d",
          gap: "10px",
          position: 'relative',
          "::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundSize: "130px 130px",
            backgroundPosition: "top left",
            backgroundRepeat: "repeat",
            backgroundColor: bgColor,
            opacity: 0.2,
            zIndex: 100,
          },
        }}
        onClick={onClickListItem}
        onContextMenu={onContextMenu}

      >
        <Avatar sx={{ width: "35px", height: "35px", fontSize: 14 }} alt="Profile Picture">
          {getContactName(contact)}
        </Avatar>
        <ListItemText
          sx={{ display: "flex", flexDirection: "column", gap: "5px" }}
          primaryTypographyProps={{ fontWeight: 600 }}
          primary={
            <Stack direction="row" justifyContent="space-between" gap="5px">
              {"appeal" in contact ? (
                <Box component="span">
                  <Stack direction="row" spacing={1}>
                    <Typography
                      fontSize={16}
                      fontWeight={500}
                      color="#3f51b5"
                      title={contact?.appeal?.client?.fullName ?? fullName}
                    >
                      {contact?.appeal?.client?.fullName?.slice(0, 10) || fullName.slice(0, 10)}
                      {(contact?.appeal?.client?.fullName && contact?.appeal?.client?.fullName.length > 10) ||
                        contact.fullName.length > 10
                        ? "..."
                        : ""}
                    </Typography>
                    <Typography>
                      {"status" in contact && contact.status === "Онлайн" && (
                        <FiberManualRecordIcon sx={{ color: "green", width: "15px" }} />
                      )}
                      {"status" in contact && contact.status === "Оффлайн" && (
                        <AdjustIcon sx={{ width: "15px", color: "c#c#c#" }} />
                      )}
                    </Typography>
                    {"isTyping" in contact && contact.isTyping.length > 0 && (
                      <Box sx={{ background: "#bbdefb", padding: "5px", borderRadius: "5px" }}>
                        <Stack direction="row" alignItems="center">
                          <Typography sx={{ fontSize: 16 }}>Печатает...</Typography>
                        </Stack>
                      </Box>
                    )}

                    <Typography fontSize={16} color="#667781">
                      {contact?.appeal?.client?.mobilePhone ?? contact.phoneNumber}
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Box component="span">{contact?.fullName.slice(0, 30)}</Box>
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  sx={{ marginRight: "0px", marginTop: "7px" }}
                  alignItems="center"
                >
                  <Badge badgeContent={contact.unreadMessageCount} color="primary" sx={{ transform: 'scale(1.3)' }}></Badge>
                </Stack>
              </Box>
              <Box component="span" fontWeight={400} fontSize={14} color="#8E8E93">
                {contact?.lastMessage?.timestamp && (
                  <Time timestamp={contact.lastMessage.timestamp} formatStr="HH:mm" />
                )}
              </Box>
            </Stack>
          }
          secondary={
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {contact?.lastMessage?.messageAuthor?.id === currentUserId?.id && (
                <ReadMark status={contact?.lastMessage?.status} appealType={contact?.lastMessage?.appealType} />
              )}
              <Box
                component="span"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {renderLastMessage(contact)}
              </Box>
            </Box>
          }
        />
      </ListItemButton>
    </>
  );
});

Contact.displayName = "Contact";

export default Contact;
