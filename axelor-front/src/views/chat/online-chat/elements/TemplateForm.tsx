import { useSocketStore } from "../store/socketStore";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fab,
  FormControl,
  FormHelperText,
  Input,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";
import { validateButtons, validateTemplateButtons } from "../helpers/helpers";
import { IMaskInput } from "react-imask";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { green } from "@mui/material/colors";
// import "../css/style.css";
import DeleteTemplate from "./DeleteTemplate";
import { useWhatsappTemplate } from "../store/whatsappTemplate";
import { HttpStatusEnum, StatusMessageEnum, SuccessMessageEnum, TemplateButtonType, TemplateType } from "../types/chatTypes";

enum onChangeTemplateEnum {
  name = "name",
  header = "header",
  body = "body",
  footer = "footer",
  nameError = "nameError",
  headerError = "headerError",
  bodyError = "bodyError",
  footerError = "footerError",
}

export enum verticalEnum {
  top = "top",
  bottom = "bottom",
}

export enum horizontalEnum {
  left = "left",
  center = "center",
  right = "right",
}

const CustomSelect = styled(Select)({
  fontSize: 12,
  "& > div": {
    padding: "7.5px 11px",
  },
});

export enum snackBarSeverityEnum {
  success = "success",
  error = "error",
}

interface TemplateFormPropsType {
  showTemplate: TemplateType | null;
  onClickModalVariant: (variant: number) => void;
}
interface StateSnackType {
  open: boolean;
  vertical: verticalEnum;
  horizontal: horizontalEnum;
  message: string;
  severity: snackBarSeverityEnum;
}
interface StateTemplateType {
  name: string;
  nameError: boolean;
  nameEmpty: boolean;
  header: string;
  headerError: boolean;
  body: string;
  bodyError: boolean;
  bodyEmpty: boolean;
  footer: string;
  footerError: boolean;
}
export interface TemplateWhatsappFormType {
  name: string;
  header?: string;
  body: string;
  footer?: string;
  buttons?: TemplateButtonType[];
  language: string;
  id?: number;
}

function TemplateForm({ showTemplate, onClickModalVariant }: TemplateFormPropsType) {
  const { sendEvent } = useSocketStore((state) => state);
  const { status, setStatus, errorMessage, setErrorMessage, successMessage, setSuccess } = useWhatsappTemplate(
    (state) => state
  );
  const [language, setLanguage] = useState<string>(showTemplate?.language ?? "");
  const [stateSnack, setStateSnack] = useState<StateSnackType>({
    open: false,
    vertical: verticalEnum.top,
    horizontal: horizontalEnum.center,
    message: "",
    severity: snackBarSeverityEnum.error,
  });
  const [template, setTemplate] = useState<StateTemplateType>({
    name: showTemplate ? showTemplate.name : "",
    nameError: false,
    nameEmpty: false,
    header: showTemplate && showTemplate.header ? showTemplate.header : "",
    headerError: false,
    body: showTemplate ? showTemplate?.body : "",
    bodyError: false,
    bodyEmpty: false,
    footer: showTemplate && showTemplate.footer ? showTemplate.footer : "",
    footerError: false,
  });
  const [updateTemplate, setUpdateTemplate] = useState<boolean>(true);
  const [buttons, setButtons] = useState<TemplateButtonType[]>([]);
  const addTemplate = (e: any) => {
    if (
      template.name === "" ||
      template.body === "" ||
      template.nameEmpty ||
      template.bodyEmpty ||
      validateButtons(buttons) ||
      template.nameError ||
      template.bodyError ||
      template.footerError
    ) {
      const regexEn = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
      const regexRu = /^[А-Яа-яЁё0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
      const regexName = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      setTemplate((prev) => {
        return {
          ...prev,
          nameEmpty: prev.name === "" ? true : false,
          bodyEmpty: prev.body === "" ? true : false,
        };
      });
      setButtons((prev) =>
        prev.map((el) => {
          if (el.type === "PHONE_NUMBER") {
            return {
              ...el,
              textEmpty: el.text === "" ? true : false,
              phone_number_error: el?.phone_number && el.phone_number.length < 12 ? true : false,
            };
          }
          if (el.type === "URL") {
            return {
              ...el,
              textEmpty: el.text === "" ? true : false,
              urlError: (el.url && !/^https:\/\/.*/.test(el.url)) || el?.url === "" ? true : false,
            };
          }
          if (el.type === "QUICK_REPLY") {
            return {
              ...el,
              textEmpty: el.text === "" ? true : false,
            };
          }
          return el;
        })
      );
      e.preventDefault();
      return;
    }
    let data: TemplateWhatsappFormType = {
      name: template.name,
      body: template.body,
      language: language,
    };
    if (template.header !== "") {
      data.header = template.header;
    }
    if (template.footer !== "") {
      data.footer = template.footer;
    }
    if (buttons.length > 0) {
      data.buttons = buttons;
    }
    setStatus({ variant: StatusMessageEnum.createTemplate, value: HttpStatusEnum.loading });
    sendEvent({ event: "createTemplate", data: { form: data } });
    e.preventDefault();
  };

  const onClickUpdateTemplate = (e: any) => {
    if (
      template.name === "" ||
      template.body === "" ||
      template.nameEmpty ||
      template.bodyEmpty ||
      validateButtons(buttons) ||
      template.nameError ||
      template.bodyError ||
      template.footerError
    ) {
      const regexEn = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
      const regexRu = /^[А-Яа-яЁё0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
      const regexName = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      setTemplate((prev) => {
        return {
          ...prev,
          nameEmpty: prev.name === "" ? true : false,
          bodyEmpty: prev.body === "" ? true : false,
        };
      });
      setButtons((prev) =>
        prev.map((el) => {
          if (el.type === "PHONE_NUMBER") {
            return {
              ...el,
              textEmpty: el.text === "" ? true : false,
              phone_number_error: el?.phone_number && el.phone_number.length < 12 ? true : false,
            };
          }
          if (el.type === "URL") {
            return {
              ...el,
              textEmpty: el.text === "" ? true : false,
              urlError: (el.url && !/^https:\/\/.*/.test(el.url)) || el?.url === "" ? true : false,
            };
          }
          if (el.type === "QUICK_REPLY") {
            return {
              ...el,
              textEmpty: el.text === "" ? true : false,
            };
          }
          return el;
        })
      );
      e.preventDefault();
      return;
    }
    let data: TemplateWhatsappFormType = {
      name: template.name,
      body: template.body,
      language: language,
    };
    if (template.header !== "") {
      data.header = template.header;
    }
    if (template.footer !== "") {
      data.footer = template.footer;
    }
    if (buttons.length > 0) {
      data.buttons = buttons;
    }
    if (showTemplate) {
      data.id = showTemplate.id;
    }
    setStatus({ variant: StatusMessageEnum.updateTemplate, value: HttpStatusEnum.loading });
    sendEvent({ event: "updateTemplate", data: { form: data } });
    e.preventDefault();
  };

  const handleClick = (newState: boolean, message: string) => {
    setStateSnack((prev) => {
      return { ...prev, open: newState, message, severity: snackBarSeverityEnum.error };
    });
  };

  const onChangeBtn = (btn: TemplateButtonType) => {
    const regexEn = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
    const regexRu = /^[А-Яа-яЁё0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
    let choiseRegex = language === "ru" ? regexRu : language === "en_US" ? regexEn : null;
    if (choiseRegex === null) {
      handleClick(true, "Чтобы заполнять поля сначала выберите язык!");
      return;
    }
    setButtons((prev) => {
      return prev.map((el) => {
        if (el.id === btn.id && btn.type === "PHONE_NUMBER" && choiseRegex !== null) {
          return {
            ...btn,
            text: choiseRegex.test(btn.text) ? btn.text : el.text,
            textLngError: !choiseRegex.test(btn.text) ? true : false,
            textEmpty: btn.text === "" ? true : false,
            phone_number_error: btn?.phone_number && btn.phone_number.length < 12 ? true : false,
          };
        }
        if (el.id === btn.id && btn.type === "URL" && choiseRegex !== null) {
          return {
            ...btn,
            text: choiseRegex.test(btn.text) ? btn.text : el.text,
            textLngError: !choiseRegex.test(btn.text) ? true : false,
            textEmpty: btn.text === "" ? true : false,
            urlError: (btn.url && !/^https:\/\/.*/.test(btn.url)) || btn?.url === "" ? true : false,
          };
        }
        if (el.id === btn.id && btn.type === "QUICK_REPLY" && choiseRegex !== null) {
          return {
            ...btn,
            text: choiseRegex.test(btn.text) ? btn.text : el.text,
            textLngError: !choiseRegex.test(btn.text) ? true : false,
            textEmpty: btn.text === "" ? true : false,
          };
        }
        return el;
      });
    });
  };

  const handleClose = () => {
    setStateSnack((prev) => {
      return { ...prev, open: false, message: "" };
    });
    setErrorMessage(null);
    setSuccess(null);
  };

  const addButton = () => {
    let button: TemplateButtonType = {
      id: Math.random() * 1000,
      type: "",
      text: "",
      textEmpty: false,
      textLngError: false,
    };
    setButtons((prev) => {
      return [...prev, button];
    });
  };

  const deleteBtn = (id: number) => {
    setButtons((prev) => prev.filter((el) => el.id !== id));
  };

  const onChangeTemplate = (e: any, field: onChangeTemplateEnum, fieldError: onChangeTemplateEnum) => {
    const regexEn = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
    const regexRu = /^[А-Яа-яЁё0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
    const regexName = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    let choiseRegex = language === "ru" ? regexRu : language === "en_US" ? regexEn : null;
    setTemplate((prev) => {
      if (field !== "name" && choiseRegex === null) {
        handleClick(true, "Чтобы заполнять поля сначала выберите язык!");
      }
      if (field === "name") {
        return {
          ...prev,
          [field]: regexName.test(e.target.value) ? e.target.value : prev[field],
          nameError: !regexName.test(e.target.value) ? true : false,
          nameEmpty: e.target.value === "" ? true : false,
        };
      }
      if (choiseRegex !== null) {
        return {
          ...prev,
          [field]: choiseRegex.test(e.target.value) ? e.target.value : prev[field],
          [fieldError]: !choiseRegex.test(e.target.value) ? true : false,
          bodyEmpty: field === onChangeTemplateEnum.body && e.target.value === "" ? true : false,
        };
      }
      return prev;
    });
  };

  const onChangeSelect = (event: SelectChangeEvent, btn: TemplateButtonType) => {
    setButtons((prev) =>
      prev.map((el: TemplateButtonType) => {
        if (el.id === btn.id) {
          let newEl = {
            ...el,
            type: event.target.value as string,
            text: "",
            textLngError: false,
            textEmpty: false,
          };
          if (event.target.value === "PHONE_NUMBER") {
            newEl.phone_number = "";
            newEl.phone_number_error = false;
          }
          if (event.target.value === "URL") {
            newEl.url = "";
            newEl.urlError = false;
          }
          return newEl;
        }
        return el;
      })
    );
  };

  const onChangeLanguage = (event: any) => {
    setLanguage(event.target.value as string);
    setTemplate((prev) => {
      return {
        ...prev,
        nameError: false,
        header: "",
        headerError: false,
        body: "",
        bodyError: false,
        footer: "",
        footerError: false,
      };
    });
  };

  const onClickPrev = () => {
    setStatus({ variant: StatusMessageEnum.noStatus, value: HttpStatusEnum.noStatus });
    onClickModalVariant(0);
    setErrorMessage(null);
    setSuccess(null);
  };

  useEffect(() => {
    if (showTemplate && showTemplate.buttons) {
      setButtons(() => {
        if (showTemplate.buttons) {
          return showTemplate.buttons.map((el) => {
            let newEl = {
              ...el,
              id: Math.random() * 1000,
              textLngError: false,
              textEmpty: false,
            };
            if (el.type === "PHONE_NUMBER") {
              newEl.phone_number_error = false;
            }
            if (el.type === "URL") {
              newEl.urlError = false;
            }
            return newEl;
          });
        }
        return [];
      });
    }
  }, [showTemplate]);

  useEffect(() => {
    if (errorMessage) {
      setStateSnack((prev) => {
        return {
          ...prev,
          open: true,
          message: errorMessage,
          severity: snackBarSeverityEnum.error,
        };
      });
    }
    if (successMessage === SuccessMessageEnum.createTemplate || successMessage === SuccessMessageEnum.updateTemplate) {
      setStateSnack((prev) => {
        return {
          ...prev,
          open: true,
          message: successMessage,
          severity: snackBarSeverityEnum.success,
        };
      });
    }
  }, [errorMessage, successMessage]);

  useEffect(() => {
    if (status.variant === StatusMessageEnum.deleteTemplate && status.value === HttpStatusEnum.success) {
      onClickModalVariant(0);
    }
  }, [status]);

  useEffect(() => {
    if (showTemplate) {
      if (
        template.name !== showTemplate.name ||
        template.header !== showTemplate.header ||
        template.body !== showTemplate.body ||
        template.footer !== showTemplate.footer ||
        language !== showTemplate.language ||
        validateTemplateButtons(buttons, showTemplate?.buttons)
      ) {
        setUpdateTemplate(false);
        return;
      }
      setUpdateTemplate(true);
    }
  }, [template, language, buttons]);

  return (
    <Box component="form" sx={{}}>
      <Stack direction="row" justifyContent="flex-end">
        <Button onClick={onClickPrev} sx={{ fontSize: 11 }}>
          Назад
        </Button>
      </Stack>
      <Stack direction="column">
        <Typography variant="h2" fontSize={24} fontWeight={500} sx={{ marginBottom: "10px" }}>
          {!showTemplate ? "Создание шаблона" : "Редактировать шаблон"}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {showTemplate && (
            <Box>
              <Typography fontWeight={500} sx={{ marginBottom: "10px" }}>
                Статус
              </Typography>
              <Typography>{showTemplate.status}</Typography>
            </Box>
          )}
          {showTemplate && <DeleteTemplate templateName={showTemplate.name} templateID={showTemplate.id} />}
        </Stack>
        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
          Название шаблона: <span style={{ color: "red" }}>*</span>
        </Typography>
        <Input
          // inputRef={templateNameRef}
          disabled={showTemplate ? true : false}
          value={template.name}
          type="text"
          required
          id="templateName"
          error={template.nameError || template.nameEmpty}
          onChange={(e) => onChangeTemplate(e, onChangeTemplateEnum.name, onChangeTemplateEnum.nameError)}
        />
        {template.nameError && (
          <FormHelperText error>
            Название шаблона должно быть только на английском. Могут быть только буквы нижнего регистра и символы
            подчеркивания.
          </FormHelperText>
        )}
        {template.nameEmpty && <FormHelperText error>Обязательное поле</FormHelperText>}
        <Typography>Выберите язык.</Typography>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <CustomSelect
              disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
              value={language}
              onChange={onChangeLanguage}
              MenuProps={{
                disablePortal: true,
                PaperProps: {
                  sx: {
                    zIndex: 1402,
                  },
                },
              }}
            >
              <MenuItem value="en_US" sx={{ fontSize: 12 }}>
                EN
              </MenuItem>
              <MenuItem value="ru" sx={{ fontSize: 12 }}>
                RU
              </MenuItem>
            </CustomSelect>
            {language === "ru" && <Typography>Заполняйте следующие поля на русском языке</Typography>}
            {language === "en_US" && <Typography>Заполняйте следующие поля на английском языке</Typography>}
          </Stack>
        </Box>
        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
          Заголовок:{" "}
        </Typography>
        <Input
          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
          error={template.headerError}
          value={template.header}
          type="text"
          id="templateHeader"
          onChange={(e) => onChangeTemplate(e, onChangeTemplateEnum.header, onChangeTemplateEnum.headerError)}
        />
        {template.headerError && language === "ru" && (
          <FormHelperText error>Введите текст только на русском языке</FormHelperText>
        )}
        {template.headerError && language === "en_US" && (
          <FormHelperText error>Введите текст только на английском языке</FormHelperText>
        )}

        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
          Текст шаблона: <span style={{ color: "red" }}>*</span>
        </Typography>
        <TextField
          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
          value={template.body}
          required
          id="templateBody"
          multiline
          rows={4}
          variant="standard"
          error={template.bodyError || template.bodyEmpty}
          onChange={(e) => onChangeTemplate(e, onChangeTemplateEnum.body, onChangeTemplateEnum.bodyError)}
        />
        {template.bodyError && language === "ru" && (
          <FormHelperText error>Введите текст только на русском языке</FormHelperText>
        )}
        {template.bodyError && language === "en_US" && (
          <FormHelperText error>Введите текст только на английском языке</FormHelperText>
        )}
        {template.bodyEmpty && <FormHelperText error>Обязательное поле</FormHelperText>}
        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
          Нижний текст:{" "}
        </Typography>
        <Input
          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
          id="templateFooter"
          type="text"
          value={template.footer}
          onChange={(e) => onChangeTemplate(e, onChangeTemplateEnum.footer, onChangeTemplateEnum.footerError)}
        />
        {template.footerError && language === "ru" && (
          <FormHelperText error>Введите текст только на русском языке</FormHelperText>
        )}
        {template.footerError && language === "en_US" && (
          <FormHelperText error>Введите текст только на английском языке</FormHelperText>
        )}
        <Box sx={{ position: "relative", zIndex: 100 }}>
          <Typography sx={{ marginTop: "10px", marginBottom: "10px" }} fontWeight={500}>
            Кнопки
          </Typography>
          {buttons.map((btn: TemplateButtonType) => {
            return (
              <Box key={btn.id}>
                <Box sx={{ maxWidth: 150, marginBottom: "10px" }}>
                  <FormControl
                    disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
                    fullWidth
                    sx={{ padding: "0px", marginTop: 1 }}
                  >
                    <CustomSelect
                      value={btn.type}
                      labelId="selectBtn"
                      onChange={(event: any) => onChangeSelect(event, btn)}
                      MenuProps={{
                        disablePortal: true,
                      }}
                    >
                      <MenuItem value="PHONE_NUMBER" sx={{ fontSize: 12 }}>
                        Позвонить
                      </MenuItem>
                      <MenuItem value="URL" sx={{ fontSize: 12 }}>
                        Ссылка
                      </MenuItem>
                    </CustomSelect>
                  </FormControl>
                </Box>
                <Stack direction="row" alignItems="flex-end" spacing={2} sx={{ mb: "10px" }}>
                  {btn.type === "PHONE_NUMBER" && (
                    <Stack direction="row" spacing={3} sx={{ marginBottom: "10px" }}>
                      <Box>
                        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
                          Текст кнопки: <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Input
                          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
                          id="textBtn"
                          error={btn.textLngError || btn.textEmpty}
                          value={btn.text}
                          onChange={(e) => onChangeBtn({ ...btn, text: e.target.value })}
                        />
                        {btn.textLngError && language === "ru" && (
                          <FormHelperText error>Введите текст только на русском языке</FormHelperText>
                        )}
                        {btn.textLngError && language === "en_US" && (
                          <FormHelperText error>Введите текст только на английском языке</FormHelperText>
                        )}
                        {btn.textEmpty && <FormHelperText error>Обязательное поле</FormHelperText>}
                      </Box>
                      <Box>
                        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
                          Номер телефона: <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <IMaskInput
                          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
                          mask={"{+996}(000)-00-00-00"}
                          lazy={false}
                          value={btn.phone_number}
                          onAccept={(value: string) =>
                            onChangeBtn({ ...btn, phone_number: value.replace(/[^a-zA-Z0-9 ]/g, "") })
                          }
                          type="text"
                          required
                          className={btn.phone_number_error ? "imask-input imask-error" : "imask-input"}
                        />
                        {btn.phone_number_error && (
                          <FormHelperText error>
                            Введенный номер не является действительным номером телефона.
                          </FormHelperText>
                        )}
                      </Box>
                    </Stack>
                  )}
                  {btn.type === "URL" && (
                    <Stack direction="row" spacing={3} sx={{ marginBottom: "10px" }}>
                      <Box>
                        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
                          Текст кнопки: <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Input
                          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
                          id="textBtn"
                          error={btn.textLngError || btn.textEmpty}
                          value={btn.text}
                          type="text"
                          onChange={(e) => onChangeBtn({ ...btn, text: e.target.value })}
                        />
                        {btn.textLngError && language === "ru" && (
                          <FormHelperText error>Введите текст только на русском языке</FormHelperText>
                        )}
                        {btn.textLngError && language === "en_US" && (
                          <FormHelperText error>Введите текст только на английском языке</FormHelperText>
                        )}
                        {btn.textEmpty && <FormHelperText error>Обязательное поле</FormHelperText>}
                      </Box>
                      <Box>
                        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
                          Url адрес: <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Input
                          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
                          id="urlBtn"
                          error={btn.urlError}
                          value={btn.url}
                          type="url"
                          placeholder="https://www.example.com"
                          onChange={(e) => onChangeBtn({ ...btn, url: e.target.value })}
                        />
                        {btn.urlError && <FormHelperText error>Введите действительный URL</FormHelperText>}
                      </Box>
                    </Stack>
                  )}
                  {btn.type === "QUICK_REPLY" && (
                    <Stack direction="row" spacing={3} sx={{ marginBottom: "10px" }}>
                      <Box>
                        <Typography sx={{ marginTop: "10px" }} fontWeight={500}>
                          Текст: <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Input
                          disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
                          id="textBtn"
                          error={btn.textLngError || btn.textEmpty}
                          value={btn.text}
                          onChange={(e) => onChangeBtn({ ...btn, text: e.target.value })}
                        />
                        {btn.textLngError && language === "ru" && (
                          <FormHelperText error>Введите текст только на русском языке</FormHelperText>
                        )}
                        {btn.textLngError && language === "en_US" && (
                          <FormHelperText error>Введите текст только на английском языке</FormHelperText>
                        )}
                        {btn.textEmpty && <FormHelperText error>Обязательное поле</FormHelperText>}
                      </Box>
                    </Stack>
                  )}
                  {btn.type !== "" && (
                    <Fab
                      disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
                      variant="extended"
                      size="small"
                      color="primary"
                      onClick={() => deleteBtn(btn.id)}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <RemoveIcon sx={{ width: "20px", height: "20px" }} />
                        <Typography fontSize={11}>Убрать</Typography>
                      </Stack>
                    </Fab>
                  )}
                </Stack>
              </Box>
            );
          })}
          <Fab
            disabled={showTemplate && showTemplate.status === "На проверке" ? true : false}
            variant="extended"
            size="small"
            color="primary"
            onClick={addButton}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AddIcon sx={{ width: "20px", height: "20px" }} />
              <Typography fontSize={11}>Добавить кнопки</Typography>
            </Stack>
          </Fab>
        </Box>
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
        <Stack direction="row" justifyContent="flex-end">
          <Box sx={{ paddingTop: "20px" }}>
            {showTemplate && (
              <Box sx={{ m: 1, position: "relative" }}>
                <Button
                  variant="contained"
                  sx={{ fontSize: 11 }}
                  onClick={onClickUpdateTemplate}
                  type="submit"
                  disabled={
                    updateTemplate ||
                    (status.variant === StatusMessageEnum.updateTemplate && status.value === HttpStatusEnum.loading) ||
                    (status.variant === StatusMessageEnum.updateTemplate && status.value === HttpStatusEnum.success)
                  }
                >
                  Сохранить
                </Button>
                {status.variant === StatusMessageEnum.updateTemplate && status.value === HttpStatusEnum.loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: green[500],
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>
            )}

            {!showTemplate && (
              <Box sx={{ m: 1, position: "relative" }}>
                <Button
                  variant="contained"
                  sx={{ fontSize: 11 }}
                  onClick={addTemplate}
                  type="submit"
                  disabled={
                    (status.variant === StatusMessageEnum.createTemplate && status.value === HttpStatusEnum.loading) ||
                    (status.variant === StatusMessageEnum.createTemplate && status.value === HttpStatusEnum.success)
                  }
                >
                  Добавить
                </Button>
                {status.variant === StatusMessageEnum.createTemplate && status.value === HttpStatusEnum.loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: green[500],
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
export default memo(TemplateForm);
