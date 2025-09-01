import { Box, Stack, Typography } from "@mui/material";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { memo } from "react";
import { useChatUserStore } from "../store/chatUser";
import { MessageType } from "../types/chatTypes";

interface TransferMessagePropsType {
  message: MessageType;
}

function TransferMessage({ message }: TransferMessagePropsType) {
  const { currentUserId } = useChatUserStore((state) => state);
  return (
    <Box sx={{ maxWidth: "300px" }}>
      <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize="13px" color="#fff">
            {message["transfer.fromTr"]?.id === currentUserId?.id ? "Вы" : message["transfer.fromTr"]?.fullName}
          </Typography>
          <TrendingFlatIcon sx={{ color: "#fff" }} />
        </Stack>
        <Stack direction="row" justifyContent="center" flexWrap="wrap">
          {message?.toTr?.map((transferTo, transferToIndex, transferToArray) => {
            let transferToArraylength = transferToArray.length - 1;
            return (
              <Typography fontSize="13px" color="#fff" key={transferTo.id}>
                {transferTo.id === currentUserId?.id ? "Вам" : transferTo.fullName}
                {transferToIndex < transferToArraylength ? ", " : " "}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}

export default memo(TransferMessage);
