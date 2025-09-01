import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import Contacts from "./online-chat/Contacts";
import ChatBox from "./online-chat/ChatBox";
import { ChatBoxVariant } from "./online-chat/types/chatTypes";
import { useEffect, useRef, useState } from "react";
import { SnackbarProvider } from "notistack";
import ClearIcon from '@mui/icons-material/Clear';
import { useChatStore as OnlineChatStore } from "./online-chat/store/chatStore";

export default function GetOnlineChat() {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const positionRef = useRef({ x: 1000, y: 0 });
    const offsetRef = useRef({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const scale = 0.7;
    const { setChat: setOnlineChat,width, height, setWidth, setHeight } = OnlineChatStore(state => state);
    const [transition, setTransition] = useState<string>("contact");

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        e.preventDefault();
        document.body.style.pointerEvents = 'none';
        draggingRef.current = true;
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) {
            offsetRef.current = {
                x: (e.clientX - rect.left),
                y: (e.clientY - rect.top)
            }
        }
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        if (!draggingRef.current || !cardRef.current) return;
        const cardWidth = cardRef.current.offsetWidth - 40;
        const cardHeight = cardRef.current.offsetHeight - 75;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let newX = e.clientX - offsetRef.current.x - 78;
        let newY = e.clientY - offsetRef.current.y - 78;

        newX = Math.max(-40, Math.min(screenWidth - cardWidth, newX));
        newY = Math.max(-75, Math.min(screenHeight - cardHeight, newY));

        positionRef.current = { x: newX, y: newY };
        cardRef.current.style.left = `${newX}px`;
        cardRef.current.style.top = `${newY}px`;
    }

    const handleMouseUp = () => {
        draggingRef.current = false;
        document.body.style.pointerEvents = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    useEffect(() => {
        if (!cardRef.current) return;
        const cardWidth = cardRef.current.offsetWidth;
        const cardHeight = cardRef.current.offsetHeight;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let x = positionRef.current.x || 0;
        let y = positionRef.current.y || 0;

        if (x + cardWidth > screenWidth) x = screenWidth - cardWidth;
        if (y + cardHeight > screenHeight) y = screenHeight - cardHeight;

        positionRef.current = { x, y };
        cardRef.current.style.position = 'fixed';
        cardRef.current.style.left = `${x}px`;
        cardRef.current.style.top = `${y}px`;

        function handleResize() {
            if (!cardRef.current) return;
            const cardWidth = cardRef.current.offsetWidth;
            const cardHeight = cardRef.current.offsetHeight;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            let { x, y } = positionRef.current;

            // Если при ресайзе виджет выходит за экран — поправить позицию
            if (x + cardWidth > screenWidth) {
                x = screenWidth - cardWidth;
            }
            if (y + cardHeight > screenHeight) {
                y = screenHeight - cardHeight;
            }
            x = Math.max(0, x);
            y = Math.max(0, y);

            positionRef.current = { x, y };
            cardRef.current.style.left = `${x}px`;
            cardRef.current.style.top = `${y}px`;
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onClearIconOnlineChat = (e: any) => {
        e.stopPropagation();
        setWidth("0");
        setHeight("0");
        setOnlineChat(null);
        setTransition("contact")
    }

    return <SnackbarProvider maxSnack={3}>
        <Box >
            <Card
                ref={cardRef}
                onDragStart={(e) => e.preventDefault()}
                draggable={false}
                sx={{
                    position: 'fixed',
                    left: `${positionRef.current.x}px`,
                    top: `${positionRef.current.y}px`,
                    background: '#fff',
                    height: height,
                    width: width,
                    transform: 'scale(0.8)',
                    zIndex: 1000,
                    boxShadow: '0px 1px 24px 5px rgba(34, 60, 80, 0.2)',
                    boxSizing: 'border-box'
                }}
            >
                <Box
                    onMouseDown={handleMouseDown}
                    sx={{
                        cursor: 'move',
                        backgroundColor: '#f5f5f5',
                        borderBottom: '1px solid #ddd',
                        userSelect: 'none',
                        height: '50px',
                        padding: 1,
                        // border: '1px solid red'
                    }}>
                    <Stack justifyContent="space-between" direction="row" alignItems="center">
                        <Typography variant="h6" sx={{ mt: 0.3 }}>Online-chat</Typography>
                        <IconButton onClick={onClearIconOnlineChat} >
                            <ClearIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <Box >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: transition === "contact" ? "block" : 'none'
                        }}
                    >
                        <Contacts variant={ChatBoxVariant.hd} setTransition={setTransition} />
                    </Box>
                    <Box sx={{
                        background: '#fff',
                        height: transition === "contact" ? '0' : "751px",
                        overflow: 'hidden',
                        width: '100%',
                    }}>
                        <ChatBox order={false} chatId={null} page="/chat" variant={ChatBoxVariant.hd} setTransition={setTransition} transition={transition} />
                    </Box>
                </Box>
            </Card >
        </Box>
    </SnackbarProvider >
}
