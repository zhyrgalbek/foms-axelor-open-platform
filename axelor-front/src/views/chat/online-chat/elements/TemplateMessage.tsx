import { Box, IconButton, Stack, Typography } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import UndoIcon from "@mui/icons-material/Undo";
import { blue, grey } from "@mui/material/colors";
import PhoneIcon from "@mui/icons-material/Phone";
import { memo } from "react";
import { TemplateWhatsappFormType } from "./TemplateForm";
import { TemplateButtonType } from "../types/chatTypes";

function TemplateMessage({ body }: { body: string }) {
  const bodyObject: TemplateWhatsappFormType = JSON.parse(body);
  return (
    <Box>
      <Typography fontSize={13} fontWeight={600} color={grey[800]}>
        {bodyObject.header}
      </Typography>
      <Typography fontSize={11.5}>{bodyObject.body}</Typography>
      <Typography fontSize={11.5} color={grey[600]}>
        {bodyObject.footer}
      </Typography>
      {bodyObject?.buttons?.map((el: TemplateButtonType) => {
        if (el.type === "PHONE_NUMBER") {
          return (
            <Box key={Math.random() * 1000} sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px" }}>
              <Stack direction="row" justifyContent="center">
                <IconButton sx={{ color: blue[500] }} size="small">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon sx={{ fontSize: 14 }} />
                    <Typography fontSize={12} sx={{}}>
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
            <Box key={Math.random() * 1000} sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px" }}>
              <Stack direction="row" justifyContent="center">
                <IconButton sx={{ color: blue[500] }} size="small">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LaunchIcon sx={{ fontSize: 14 }} />
                    <Typography fontSize={12} sx={{}}>
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
            <Box key={Math.random() * 1000} sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px" }}>
              <Stack direction="row" justifyContent="center">
                <IconButton sx={{ color: blue[500] }} size="small">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UndoIcon sx={{ fontSize: 14 }} />
                    <Typography fontSize={12} sx={{}}>
                      {el.text}
                    </Typography>
                  </Stack>
                </IconButton>
              </Stack>
            </Box>
          );
        }
      })}
    </Box>
  );
}

export default memo(TemplateMessage);
