import { Box, Stack, Typography } from "@mui/material";
import AudioPlayer from "./AudioPlayer";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";
import { CallStatus } from "../helpers/selection";
import { memo } from "react";
import { MessageType } from "../types/chatTypes";

enum CallTypeEnum {
  answered = "answered",
  noAnswer = "noAnswer",
  busy = "busy",
  failed = "failed",
}

function Call({ message }: { message: MessageType }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
        <Box>
          <Stack direction="row" spacing={2}>
            {message["messageCall.type"] && (
              <Box>
                {message["messageCall.type"] === "outgoing" && (
                  <CallMadeIcon
                    sx={{
                      width: 20,
                      height: 20,
                      color:
                        (message["messageCall.status"] === CallTypeEnum.answered && "green") ||
                        (message["messageCall.status"] === CallTypeEnum.noAnswer && "red") ||
                        (message["messageCall.status"] === CallTypeEnum.busy && "red") ||
                        (message["messageCall.status"] === CallTypeEnum.failed && "red") ||
                        "red",
                    }}
                  />
                )}
                {message["messageCall.type"] === "incoming" && (
                  <CallReceivedIcon
                    sx={{
                      width: 20,
                      height: 20,
                      color:
                        (message["messageCall.status"] === CallTypeEnum.answered && "green") ||
                        (message["messageCall.status"] === CallTypeEnum.noAnswer && "red") ||
                        (message["messageCall.status"] === CallTypeEnum.busy && "red") ||
                        (message["messageCall.status"] === CallTypeEnum.failed && "red") ||
                        "red",
                    }}
                  />
                )}
              </Box>
            )}
            {message["messageCall.status"] && (
              <Typography fontWeight={600} fontSize={12}>
                {CallStatus.get(message["messageCall.status"])}
              </Typography>
            )}
            <Typography fontWeight={600} fontSize={12} color="#3f51b5">
              {message["messageCall.user"]?.fullName}
            </Typography>
            {message.callResponsible &&
              message.callResponsible.map((user: any, index, arr) => {
                return (
                  <Typography fontSize={12} fontWeight={600} color="#3f51b5" key={user.id}>
                    {user.name}
                    {index < arr.length - 1 && ","}
                  </Typography>
                );
              })}
          </Stack>
          {message["messageCall.recordId"] && (
            <AudioPlayer
              src={`${process.env.NEXT_PUBLIC_ASTERISK_URL}/monitor/${message["messageCall.recordId"]}.ogg`}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
}
export default memo(Call);
