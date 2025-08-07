"use client";
import { FC, memo, useCallback } from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MessageTypeEnum } from "../types/chatTypes";

interface TimePropsType extends BoxProps {
  timestamp: number;
  formatStr: string;
  type?: MessageTypeEnum;
}

const Time: FC<TimePropsType> = memo(({ timestamp, formatStr, type = MessageTypeEnum.TEXT, ...rest }) => {
  const displayTime = useCallback(() => {
    const date = new Date(timestamp * 1000);
    {
      return format(date, formatStr, { locale: ru });
    }
  }, [timestamp, formatStr]);

  return (
    <Box>
      <Typography fontSize={13} color={type === MessageTypeEnum.TRANSFER ? "#fff" : "#667781"}>
        {displayTime()}
      </Typography>
    </Box>
  );
});

Time.displayName = "Time";

export default Time;
