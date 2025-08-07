import { Box, Button, ListItemButton, Popover, Stack, Typography } from "@mui/material";
import { memo, useState } from "react";
import { DepartMentType } from "../types/chatTypes";

interface TransferClientPopupPropsType {
  department: DepartMentType;
  children: any;
}

function TransferClientPopup({ department, children }: TransferClientPopupPropsType) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <ListItemButton sx={{ m: 0, p: 0 }}>
      <Button
        aria-describedby={id}
        style={{ fontSize: 11, width: "100%", textAlign: "left", color: "rgba(0, 0, 0, 0.87)" }}
        onClick={handleClick}
      >
        {children}
      </Button>
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
            <Typography>
              Передать клиент к <span style={{ fontSize: "14px", fontWeight: 500 }}>{department.name}</span>?
            </Typography>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Button variant="contained" sx={{ fontSize: 11 }} onClick={handleClose}>
                Отменить
              </Button>
              <Button variant="contained" sx={{ fontSize: 11 }}>
                Передать
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </ListItemButton>
  );
}

export default memo(TransferClientPopup);
