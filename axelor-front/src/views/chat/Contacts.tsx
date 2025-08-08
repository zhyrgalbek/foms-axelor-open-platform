"use client";
import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import {
  CircularProgress,
  CssBaseline,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSocketStore } from "./store/socketStore";
import Contact from "./elements/Contact";
import theme from "./styles/theme";
import ContactDrawer from "./elements/ContactsDrawer";
import { useChatsStore } from "./store/chatsStore";
import { useChatStore } from "./store/chatStore";
import { useChatUserStore } from "./store/chatUser";
import { ChatBoxVariant, ClientType, ColleaguesType } from "./types/chatTypes";


const ContactBox = styled(Box)({
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  height: "100%",
});


export default function Contacts({ variant }: { variant: ChatBoxVariant }) {
  const { sendEvent } = useSocketStore((state) => state);
  const { currentUserId } = useChatUserStore((state) => state);
  const { setChat } = useChatStore((state) => state);
  const { chats, selectedContactGroup, chatsLoading, setChatsLoading } = useChatsStore(
    (state) => state
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const onChangeSearchInput = (e: any) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const intervalEvent = setTimeout(() => {
      if (searchInput.length > 0 && selectedContactGroup === 0) {
        if (!isNaN(parseInt(searchInput[0]))) {
          setChatsLoading(true);
          sendEvent({
            event: "searchActiveClients",
            data: { currentUserId, phoneNumber: parseInt(searchInput) },
          });
        }
        if (isNaN(parseInt(searchInput[0]))) {
          setChatsLoading(true);
          sendEvent({
            event: "searchActiveClients",
            data: { currentUserId, name: searchInput },
          });
        }
      }
      if (searchInput.length === 0 && selectedContactGroup === 0 && currentUserId) {
        setChatsLoading(true);
        sendEvent({ event: "currentUser", data: { currentUserId: currentUserId } });
      }
      if (searchInput.length > 0 && selectedContactGroup === 1) {
        setChatsLoading(true);
        sendEvent({
          event: "searchActiveUsers",
          data: { currentUserId, name: searchInput },
        });
      }
      if (searchInput.length === 0 && selectedContactGroup === 1 && currentUserId) {
        setChatsLoading(true);
        sendEvent({ event: "currentUser", data: { currentUserId: currentUserId, activeUserSearch: true } });
      }
    }, 800);
    return () => {
      clearInterval(intervalEvent);
    };
  }, [searchInput]);

  useEffect(() => {
    setChat(null);
  }, [selectedContactGroup]);

  return (
    <ContactBox sx={{ pb: 7 }}>
      <CssBaseline />
      <Stack direction="column">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ backgroundColor: "#fff", width: "100%", padding: 1 }}
        >
          <Typography variant="subtitle1" color="#2283D9" fontSize="17px" sx={{ flexGrow: 1 }}>
            Чаты
          </Typography>
          <ContactDrawer selectedContactGroup={selectedContactGroup} />
        </Stack>
        <Box
          component="form"
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "4px",
            height: "40px",
            borderRadius: "4px",
            border: "1px solid #9e9e9e3d",
          }}
        >
          <InputBase
            sx={{ flex: 1 }}
            placeholder="Поиск"
            startAdornment={
              <IconButton>
                <SearchIcon sx={{ width: "20px", height: "20px" }} />
              </IconButton>
            }
            onChange={onChangeSearchInput}
          />
        </Box>
      </Stack>
      <Box
        sx={{
          position: "relative",
          height: "775px",
          overflow: "auto",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
        }}
      >
        {chats[selectedContactGroup].map((contact: ClientType | ColleaguesType) => {
          return <Contact key={contact?.id} contact={contact} />;
        })}
        {chats[selectedContactGroup].length === 0 && (
          <Stack direction="row" justifyContent="center" sx={{ marginTop: "20px" }}>
            <Typography>no data</Typography>
          </Stack>
        )}
        {chatsLoading && (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: "#fff" }}
          >
            <CircularProgress size={24} />
          </Stack>
        )}
      </Box>
    </ContactBox>
  );
}

function getAllCount(index: number, chats: [ClientType[], ColleaguesType[]]) {
  let sum = 0;
  chats[index].forEach((el) => {
    if (el.unreadMessageCount) {
      sum += +el.unreadMessageCount;
    }
  });
  return sum;
}
