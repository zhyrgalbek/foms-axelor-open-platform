import { useSocketStore } from "../store/socketStore";
import { Box, Button, CircularProgress, Popover, Stack, Typography } from "@mui/material";
import { green } from "@mui/material/colors";
import { memo, useCallback, useState } from "react";
import { useWhatsappTemplate } from "../store/whatsappTemplate";
import { HttpStatusEnum, StatusMessageEnum } from "../types/chatTypes";

interface DeleteTemplatePropsType {
  templateName: string;
  templateID: number;
}

function DeleteTemplate({ templateName, templateID }: DeleteTemplatePropsType) {
  const { sendEvent } = useSocketStore((state) => state);
  const { setStatus, status } = useWhatsappTemplate((state) => state);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClickDeleteTemplate = useCallback(() => {
    setStatus({ variant: StatusMessageEnum.deleteTemplate, value: HttpStatusEnum.loading });
    sendEvent({
      event: "deleteTemplate",
      data: {
        templateName,
        templateID,
      },
    });
    setAnchorEl(null);
  }, [setStatus, sendEvent, setAnchorEl, templateName, templateID]);

  return (
    <Box sx={{ position: "relative" }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        sx={{ fontSize: 11 }}
        onClick={handleClick}
        disabled={
          (status.variant === "deleteTemplate" && status.value === HttpStatusEnum.loading) ||
          (status.variant === "deleteTemplate" && status.value === HttpStatusEnum.success)
        }
      >
        Удалить
      </Button>
      {status.variant === "deleteTemplate" && status.value === HttpStatusEnum.loading && (
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
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            width: "300px",
            p: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography>Вы действительно хотите удалить?</Typography>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Button variant="contained" sx={{ fontSize: 11 }} onClick={onClickDeleteTemplate}>
                Удалить
              </Button>
              <Button variant="contained" sx={{ fontSize: 11 }} onClick={handleClose}>
                Отменить
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
export default memo(DeleteTemplate);
