import { Badge, Box, IconButton, Stack, Tooltip } from "@mui/material";
import { ClientType, ColleaguesType } from "./whatsapp/types/chatTypes";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { SnackbarProvider } from "notistack";
import { useChatsStore as WhatsappChatsStore } from "./whatsapp/store/chatsStore";
import { useChatsStore as OnlineChatsStore } from "./online-chat/store/chatsStore";
import { useChatStore as OnlineChatStore } from "./online-chat/store/chatStore";
import { useChatStore as WhatsappChatStore } from "./whatsapp/store/chatStore";
import ChatIcon from '@mui/icons-material/Chat';
import GetWhatsappChat from "./GetWhatsappChat";
import GetOnlineChat from "./GetOnlineChat";
import OnlineChatIcon from "@/assets/chat/online-chat-icon.svg";

export default function ChatInterface() {
    const { chats: whatsappChats } = WhatsappChatsStore(state => state);
    const { chats: onlineChats } = OnlineChatsStore(state => state);
    const { setWidth: WhatsappSetWidth, setHeight: WhatsappSetHeight } = WhatsappChatStore();
    const { setWidth: OnlineChatSetWidth, setHeight: OnlineChatSetHeight } = OnlineChatStore();

    const onClickWhatsappIcon = () => {
        WhatsappSetWidth("480px");
        WhatsappSetHeight("800px");
    }

    const onClickOnlineChatIcon = () => {
        OnlineChatSetWidth("480px");
        OnlineChatSetHeight("800px");
    }

    return <SnackbarProvider maxSnack={3}>
        <Box >
            <Tooltip title="Whatsapp">
                <IconButton sx={{
                    position: 'fixed',
                    right: '80px',
                    top: '10px',
                    background: '#28A219',
                    ":focus": {
                        background: '#28A219'
                    },
                    ":hover": {
                        background: '#28A219'
                    },
                    padding: '3px',
                    boxShadow: '0px 1px 24px 5px rgba(34, 60, 80, 0.2)'
                }}
                    onClick={onClickWhatsappIcon}>
                    <Box sx={{ flexGrow: 1, position: 'absolute', top: 0, left: '30px' }}>
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            sx={{ marginRight: "0px", marginTop: "7px" }}
                            alignItems="center"
                        >
                            <Badge badgeContent={getAllCount(0, whatsappChats)} color="primary"></Badge>
                        </Stack>
                    </Box>
                    <WhatsAppIcon sx={{ width: '20px', height: '20px', color: '#fff' }} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Онлайн-чат" >
                <IconButton onClick={onClickOnlineChatIcon}
                    sx={{
                        position: 'fixed',
                        right: '115px',
                        top: '10px',
                        background: '#28A219',
                        ":focus": {
                            background: '#28A219'
                        },
                        ":hover": {
                            background: '#28A219'
                        },
                        padding: '5px',
                        boxShadow: '0px 1px 24px 5px rgba(34, 60, 80, 0.2)'
                    }}>
                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        sx={{ marginRight: "0px", marginTop: "7px", position: "absolute", top: 0, right: '5px' }}
                        alignItems="center"
                    >
                        <Badge badgeContent={getAllCount(0, onlineChats)} color="primary"></Badge>
                    </Stack>
                    <Box sx={{ width: '16px', height: '16px', color: '#fff', backgroundImage: `url(${OnlineChatIcon})`, backgroundRepeat: 'no-repeat' }}></Box>
                </IconButton>
            </Tooltip>
        </Box>
        <GetWhatsappChat />
        <GetOnlineChat />
    </SnackbarProvider >
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
