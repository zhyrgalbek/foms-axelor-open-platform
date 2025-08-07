"use client";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import { grey } from "@mui/material/colors";
import { memo } from "react";
import { AppelTypeEnum, MessageStatusTypeEnum } from "../types/chatTypes";

interface ReadMarkPropsType {
  status: MessageStatusTypeEnum | undefined | null;
  appealType: AppelTypeEnum | undefined | null;
}

const ReadMark = memo(({ status, appealType }: ReadMarkPropsType) => {
  if (appealType === AppelTypeEnum.whatsapp) {
    if (status === MessageStatusTypeEnum.sent || status !== MessageStatusTypeEnum.delivered) {
      return <DoneIcon sx={{ width: "16px", height: "16px", color: grey[600] }} />;
    }
    if (status === MessageStatusTypeEnum.delivered) {
      return <DoneAllIcon sx={{ width: "16px", height: "16px", color: grey[600] }} />;
    }
  }
  return <DoneAllIcon sx={{ width: "16px", height: "16px", color: grey[600] }} />;
});

ReadMark.displayName = "ReadMark";

export default ReadMark;
