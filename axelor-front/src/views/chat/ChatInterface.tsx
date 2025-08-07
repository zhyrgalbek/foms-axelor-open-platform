import { Box, Button, Card, Grid, IconButton, Stack, Typography } from "@mui/material";
import Contacts from "./Contacts";
import ChatBox from "./ChatBox";
import { ChatBoxVariant } from "./types/chatTypes";
import { useEffect, useRef, useState } from "react";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { SnackbarProvider } from "notistack";
import ClearIcon from '@mui/icons-material/Clear';

export default function ChatInterface() {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const positionRef = useRef({ x: 987, y: 143 })
    const offsetRef = useRef({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const [width, setWidth] = useState<string>("0");
    const [height, setHeight] = useState<string>("0");
    const scale = 0.7;

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
        const cardWidth = cardRef.current.offsetWidth - 120;
        const cardHeight = cardRef.current.offsetHeight - 120;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let newX = e.clientX - offsetRef.current.x - 102;
        let newY = e.clientY - offsetRef.current.y - 102;

        newX = Math.max(-148, Math.min(screenWidth - cardWidth, newX));
        newY = Math.max(-135, Math.min(screenHeight - cardHeight, newY));

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

    const onClearIcon = (e: any) => {
        e.stopPropagation();
        setWidth("0");
        setHeight("0");
    }

    const onClickWhatsappIcon = () => {
        setWidth("1000px");
        setHeight("1020px");
    }

    return <SnackbarProvider maxSnack={3}>
        <Box sx={{ border: '1px solid red' }}>
            <Card
                ref={cardRef}
                onDragStart={(e) => e.preventDefault()}
                draggable={false}
                sx={{
                    position: 'fixed',
                    left: `${positionRef.current.x}px`,
                    top: `${positionRef.current.y}px`,
                    // left: "956px !important",
                    // top: "29px !important",
                    background: '#fff',
                    height: height,
                    width: width,
                    // transition: '500ms ease width, 500ms ease height',
                    transform: 'scale(0.8)',
                    overflow: 'hidden',
                    zIndex: 1000,
                    boxShadow: '0px 1px 24px 5px rgba(34, 60, 80, 0.2)',
                }}>
                <Box
                    onMouseDown={handleMouseDown}
                    sx={{
                        cursor: 'move',
                        backgroundColor: '#f5f5f5',
                        padding: 1,
                        borderBottom: '1px solid #ddd',
                        userSelect: 'none',
                    }}>
                    <Stack justifyContent="space-between" direction="row">
                        <Typography variant="h6">Whatsapp</Typography>
                        <IconButton onClick={onClearIcon} >
                            <ClearIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <Grid container>
                    <Grid {...{ item: true }} sx={{ minWidth: "350px", maxWidth: "350px" }}>
                        <Contacts variant={ChatBoxVariant.hd} />
                    </Grid>
                    <Grid {...{ item: true }} flexGrow={1} sx={{ background: '#fff', width: '300px', height: '600px' }}>
                        <ChatBox order={false} chatId={null} page="/chat" variant={ChatBoxVariant.hd} />
                    </Grid>
                </Grid>
            </Card >
            <IconButton sx={{
                position: 'fixed',
                right: 80,
                top: 3,
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
                <WhatsAppIcon sx={{ width: '30px', height: '30px', color: '#fff' }} />
            </IconButton>
        </Box>
    </SnackbarProvider>
}