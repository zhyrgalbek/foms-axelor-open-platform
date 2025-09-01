import { Alert, Box, Button, IconButton, Modal, Snackbar, Stack, Typography } from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import ListIcon from "@mui/icons-material/List";
import { blue, grey } from "@mui/material/colors";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useSocketStore } from "../store/socketStore";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import LaunchIcon from "@mui/icons-material/Launch";
import UndoIcon from "@mui/icons-material/Undo";
import TemplateForm, { horizontalEnum, snackBarSeverityEnum, verticalEnum } from "./TemplateForm"
import Time from "./Time";
import { createTimeStamp } from "../helpers/helpers";
import { useWhatsappTemplate } from "../store/whatsappTemplate";
import { useChatMessage } from "../store/message";
import { useChatStore } from "../store/chatStore";
import { useChatUserStore } from "../store/chatUser";
import { HttpStatusEnum, StatusMessageEnum, SuccessMessageEnum, TemplateType } from "../types/chatTypes";

const style = {
    position: "relative",
    maxWidth: 800,
    minWidth: 400,
    bgcolor: "background.paper",
    borderRadius: 1,
    boxShadow: 24,
    p: 4,
    overflow: "auto",
    maxHeight: "700px",
};

function TemplateComponent() {
    const { setStatus, createSuccessTemplate } = useWhatsappTemplate((state) => state);
    const [open, setOpen] = React.useState(false);
    const [showTemplate, setShowTemplate] = useState<TemplateType | null>(null);
    const [modalVariant, setModalVariant] = useState<number>(0);
    const [selectTemplate, setSelectTemplate] = useState<TemplateType | null>(null);

    const onClickModalVariant = (variant: number) => {
        setModalVariant(variant);
    };
    const handleOpen = () => setOpen(true);

    const onClickShowTemplate = (template: TemplateType) => {
        setShowTemplate(template);
    };

    const handleClose = () => {
        setStatus({ variant: StatusMessageEnum.noStatus, value: HttpStatusEnum.noStatus });
        setOpen(false);
        setModalVariant(0);
    };

    useEffect(() => {
        setShowTemplate(createSuccessTemplate);
    }, [createSuccessTemplate]);

    return (
        <div>
            <IconButton onClick={handleOpen}>
                <ListIcon sx={{ color: "#3f51b5" }} />
            </IconButton>
            <Modal
                open={open}
                sx={{ display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1301 }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <IconButton sx={{ position: "absolute", top: 0, right: 0 }} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                    {modalVariant === 0 && (
                        <>
                            <Typography variant="h2" fontSize={18} fontWeight={500}>
                                Список шаблонов
                            </Typography>
                            <DataTable
                                onClickModalVariant={onClickModalVariant}
                                onClickShowTemplate={onClickShowTemplate}
                                setSelectTemplate={setSelectTemplate}
                            />
                            <Box>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setShowTemplate(null);
                                        setModalVariant(1);
                                    }}
                                    sx={{ fontSize: 11 }}
                                >
                                    Добавить шаблон
                                </Button>
                            </Box>
                        </>
                    )}
                    {modalVariant === 1 && <TemplateForm showTemplate={showTemplate} onClickModalVariant={onClickModalVariant} />}
                    {modalVariant === 2 && (
                        <SendTemplate
                            template={selectTemplate}
                            onClickModalVariant={onClickModalVariant}
                            handleCloseModal={handleClose}
                        />
                    )}
                </Box>
            </Modal>
        </div>
    );
}

export default memo(TemplateComponent);

const rows = [
    {
        id: 1014431433630586,
        name: "state_available",
        header: "Snow",
        body: "Jon",
        footer: 35,
        language: "ru",
        status: "REJECTED",
        category: "MARKETING",
    },
];

function DataTable({
    onClickModalVariant,
    onClickShowTemplate,
    setSelectTemplate,
}: {
    onClickModalVariant: (variant: number) => void;
    onClickShowTemplate: (template: TemplateType) => void;
    setSelectTemplate: (value: TemplateType) => void;
}) {
    const { sendEvent } = useSocketStore((state) => state);
    const { currentUserId } = useChatUserStore((state) => state);
    const { templates, successMessage, setErrorMessage, setSuccess, setStatus } = useWhatsappTemplate((state) => state);

    useEffect(() => {
        sendEvent({
            event: "getTemplates",
            data: {
                currentUserId,
            },
        });
    }, []);

    const handleEditClick = (id: number) => {
        let template = templates.find((el) => el.id == id);
        if (template) {
            onClickShowTemplate(template);
            onClickModalVariant(1);
        }
    };

    const columns: GridColDef[] = [
        {
            field: "actions",
            type: "actions",
            headerName: "Редактировать",
            width: 100,
            cellClassName: "actions",
            getActions: ({ id }) => {
                let templateID: number = +id;
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => handleEditClick(templateID)}
                        color="inherit"
                        key={id}
                    />,
                ];
            },
        },
        {
            field: "status",
            headerName: "Статус",
            width: 90,
        },
        { field: "name", headerName: "Название шаблона", width: 130 },
        { field: "header", headerName: "Заголовок", width: 160 },
        {
            field: "body",
            headerName: "Основной текст",
            width: 250,
        },
        {
            field: "footer",
            headerName: "Нижний текст",
            width: 160,
        },
        {
            field: "language",
            headerName: "Язык",
            width: 90,
        },
    ];

    const [stateSnack, setStateSnack] = useState<{
        open: boolean;
        vertical: verticalEnum;
        horizontal: horizontalEnum;
        message: SuccessMessageEnum | null;
        severity: snackBarSeverityEnum;
    }>({
        open: false,
        vertical: verticalEnum.top,
        horizontal: horizontalEnum.center,
        message: null,
        severity: snackBarSeverityEnum.error,
    });

    useEffect(() => {
        if (successMessage === SuccessMessageEnum.deleteTemplate) {
            setStateSnack((prev) => {
                return {
                    ...prev,
                    open: true,
                    message: successMessage,
                    severity: snackBarSeverityEnum.success,
                };
            });
        }
    }, [successMessage]);

    const handleClose = () => {
        setStatus({ variant: StatusMessageEnum.noStatus, value: HttpStatusEnum.noStatus });
        setStateSnack((prev) => {
            return { ...prev, open: false, message: null };
        });
        setErrorMessage(null);
        setSuccess(null);
    };

    const onRowClick = ({ id }: { id: number }) => {
        let template = templates.find((el: TemplateType) => +el.id === id);

        if (template) {
            setSelectTemplate(template);
        }
        onClickModalVariant(2);
    };

    return (
        <div style={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={templates}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                onRowClick={({ id }) => {
                    let templateID: number = +id;
                    onRowClick({ id: templateID });
                }}
            />
            <Snackbar
                anchorOrigin={{ vertical: stateSnack.vertical, horizontal: stateSnack.horizontal }}
                key={stateSnack.vertical + stateSnack.horizontal}
                open={stateSnack.open}
                onClose={handleClose}
            >
                <Alert onClose={handleClose} severity={stateSnack.severity} variant="filled" sx={{ width: "100%" }}>
                    {stateSnack.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

const SendTemplate = ({
    template,
    onClickModalVariant,
    handleCloseModal,
}: {
    template: TemplateType | null;
    onClickModalVariant: (value: number) => void;
    handleCloseModal: () => void;
}) => {
    const { sendEvent } = useSocketStore((state) => state);
    const { currentUserId } = useChatUserStore((state) => state);
    const { chat } = useChatStore((state) => state);
    const { setSendMessageLoading } = useChatMessage((state) => state);
    const onClickPrev = () => {
        onClickModalVariant(0);
    };

    const onClickSendTemplate = () => {
        setSendMessageLoading(true);
        sendEvent({
            event: "sendTemplate",
            data: {
                currentUserId,
                chat,
                template,
            },
        });
        handleCloseModal();
    };

    return (
        <Box sx={{ position: "relative", width: 300 }}>
            <Stack direction="row" justifyContent="flex-end">
                <Button onClick={onClickPrev}>Назад</Button>
            </Stack>
            <Stack spacing={2} sx={{ position: "relative" }}>
                <Typography fontSize={16} fontWeight={600} color={grey[700]}>
                    {template?.header}
                </Typography>
                <Typography fontWeight={400} fontSize={14}>
                    {template?.body}
                </Typography>
                <Typography fontSize={14} fontWeight={400} color={grey[500]}>
                    {template?.footer}
                </Typography>
                <Box sx={{ position: "absolute", right: 0, bottom: 0 }}>
                    <Time timestamp={createTimeStamp()} formatStr="HH:mm" />
                </Box>
            </Stack>
            <Stack>
                {template?.buttons?.map((el) => {
                    if (el.type === "PHONE_NUMBER") {
                        return (
                            <Box
                                key={Math.random() * 1000}
                                sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px", paddingTop: "10px" }}
                            >
                                <Stack direction="row" justifyContent="center">
                                    <IconButton sx={{ color: blue[500] }} size="small">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PhoneIcon sx={{ fontSize: 16 }} />
                                            <Typography fontSize={14} sx={{}}>
                                                {el.text}
                                            </Typography>
                                        </Stack>
                                    </IconButton>
                                </Stack>
                            </Box>
                        );
                    }
                    if (el.type === "URL") {
                        return (
                            <Box
                                key={Math.random() * 1000}
                                sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px", paddingTop: "10px" }}
                            >
                                <Stack direction="row" justifyContent="center">
                                    <IconButton sx={{ color: blue[500] }} size="small">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LaunchIcon sx={{ fontSize: 16 }} />
                                            <Typography fontSize={14} sx={{}}>
                                                {el.text}
                                            </Typography>
                                        </Stack>
                                    </IconButton>
                                </Stack>
                            </Box>
                        );
                    }
                    if (el.type === "QUICK_REPLY") {
                        return (
                            <Box
                                key={Math.random() * 1000}
                                sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px", paddingTop: "10px" }}
                            >
                                <Stack direction="row" justifyContent="center">
                                    <IconButton sx={{ color: blue[500] }} size="small">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <UndoIcon sx={{ fontSize: 16 }} />
                                            <Typography fontSize={14} sx={{}}>
                                                {el.text}
                                            </Typography>
                                        </Stack>
                                    </IconButton>
                                </Stack>
                            </Box>
                        );
                    }
                })}
            </Stack>
            <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                sx={{ borderTop: "1px solid blue", marginTop: "15px" }}
            >
                <Button onClick={onClickSendTemplate} disabled={template?.status !== "Активный"}>
                    Отправить
                </Button>
            </Stack>
        </Box>
    );
};
