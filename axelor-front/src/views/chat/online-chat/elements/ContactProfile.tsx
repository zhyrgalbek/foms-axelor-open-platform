import { useSocketStore } from "../store/socketStore";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  Modal,
  Stack,
  TextareaAutosize,
  Typography,
  styled,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { memo, useCallback, useState } from "react";
import { ContactInfoType } from "../ChatHeader";
import { DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru"; // или любую нужную
import updateLocale from "dayjs/plugin/updateLocale";
import { useWhatsappTemplate } from "../store/whatsappTemplate";
import { useChatUserStore } from "../store/chatUser";
import { ChatType } from "../types/chatTypes";

dayjs.extend(updateLocale);
dayjs.updateLocale("ru", {
  formats: {
    L: "DD.MM.YYYY", // формат по умолчанию
  },
});
dayjs.locale("ru");
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

interface ContactProfilePropsType {
  openModal: boolean;
  contactInfo: ContactInfoType;
  form: ContactInfoType;
  activeChat: ChatType;
  setForm: React.Dispatch<React.SetStateAction<ContactInfoType>>;
  handleCloseModal: () => void;
}

function ContactProfile({
  openModal,
  contactInfo,
  form,
  activeChat,
  setForm,
  handleCloseModal,
}: ContactProfilePropsType) {
  const { sendEvent } = useSocketStore();
  const { currentUserId } = useChatUserStore((state) => state);
  const { setLoadingTemplateMessage, loadingTemplateMessage } = useWhatsappTemplate((state) => state);
  const [saveAppeal, setSaveAppeal] = useState<boolean>(true);

  const sendUpdateAppealInfo = useCallback(() => {
    // sendEvent({
    //   event: "updateAppealInfo",
    //   data: {
    //     form: { ...form },
    //     chat: activeChat,
    //     currentUserId,
    //   },
    // });
    // setLoadingTemplateMessage(true);
  }, [sendEvent, setLoadingTemplateMessage, activeChat, currentUserId, form]);

  const onChangeModalForm = useCallback(
    (key: string, value: string) => {
      // setForm((prev: ContactInfoType) => {
      //   if (
      //     (key === "name" && contactInfo.name !== value) ||
      //     (key === "lastName" && contactInfo.lastName !== value) ||
      //     (key === "email" && contactInfo.email !== value) ||
      //     (key === "dateOfBirth" && contactInfo.dateOfBirth !== value) ||
      //     (key === "commentary" && contactInfo.commentary !== value)
      //   ) {
      //     setSaveAppeal(false);
      //   } else {
      //     setSaveAppeal(true);
      //   }
      //   return { ...prev, [key]: value };
      // });
    },
    [setForm, setSaveAppeal, contactInfo]
  );

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
        <IconButton sx={{ position: "absolute", top: 0, right: 0 }} onClick={handleCloseModal}>
          <CloseIcon />
        </IconButton>
        <Stack direction="row" flexWrap="wrap" spacing={1}>
          <FormControl variant="standard">
            <InputLabel htmlFor="name">Имя:</InputLabel>
            <Input
              id="name"
              defaultValue={contactInfo.name}
              onChange={(e) => onChangeModalForm("name", e.target.value)}
            />
          </FormControl>
          <FormControl variant="standard">
            <InputLabel htmlFor="lastName">Фамилия:</InputLabel>
            <Input
              id="lastName"
              defaultValue={contactInfo.lastName}
              onChange={(e) => onChangeModalForm("lastName", e.target.value)}
            />
          </FormControl>
        </Stack>
        <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ marginTop: "10px" }}>
          <FormControl variant="standard">
            <InputLabel htmlFor="email">E-mail:</InputLabel>
            <Input
              id="email"
              defaultValue={contactInfo.email}
              onChange={(e) => onChangeModalForm("email", e.target.value)}
            />
          </FormControl>
          <FormControl variant="standard">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{
                  popper: {
                    sx: {
                      zIndex: 1302,
                    },
                  },
                }}
                sx={{
                  width: "210px",
                  "& input": {
                    padding: "12.5px 14px",
                  },
                  "& > div": {
                    borderRadius: 0,
                    padding: "0px",
                  },
                  "& fieldset": {
                    borderStyle: "none",
                    borderBottomStyle: "solid",
                  },
                }}
                label="Дата рождения:"
                defaultValue={dayjs(contactInfo.dateOfBirth)}
                onChange={(newValue: dayjs.Dayjs | null, context: PickerChangeHandlerContext<DateValidationError>) => {
                  if (newValue) {
                    const day = newValue.date() < 10 ? `0${newValue.date()}` : newValue.date();
                    const month = newValue.month() + 1 < 10 ? `0${newValue.month() + 1}` : newValue.month() + 1;
                    const year = newValue.year();
                    onChangeModalForm("dateOfBirth", `${year}-${month}-${day}`);
                  }
                }}
                views={["day", "month", "year"]}
              />
            </LocalizationProvider>
          </FormControl>
        </Stack>
        <Typography sx={{ mt: "8px", mb: "8px", color: "rgba(0, 0, 0, 0.6)" }} fontWeight={500} fontSize={13}>
          Комментарии:
        </Typography>
        <Box sx={{ border: "1px solid #C7D0DD", p: 1, overflow: "auto", height: "250px" }}>
          <Textarea
            minRows={10}
            cols={40}
            defaultValue={form.commentary}
            onChange={(e) => onChangeModalForm("commentary", e.target.value)}
          />
        </Box>
        <Stack direction="row" justifyContent="flex-end">
          <Button onClick={sendUpdateAppealInfo} disabled={saveAppeal}>
            Сохранить
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
export default memo(ContactProfile);
