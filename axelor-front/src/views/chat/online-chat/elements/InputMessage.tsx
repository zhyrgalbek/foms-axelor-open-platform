"use client";
import { TextField, styled } from "@mui/material";
import React, { ChangeEvent, memo } from "react";

const CustomInput = styled(TextField)({
  "& > .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary.MuiInputBase-formControl.MuiInputBase-multiline.mui-1nqfjt5-MuiInputBase-root-MuiOutlinedInput-root":
    {
      borderRadius: 30,
    },
  width: "100%",
});
interface InputMessagePropsType {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function InputMessage({ value, onChange, ...props }: InputMessagePropsType) {
  return (
    <CustomInput
      variant="outlined"
      id="outlined-multiline-flexible"
      label="Введите сообщение"
      multiline
      maxRows={4}
      value={value}
      onChange={onChange}
      {...props}
      sx={{ fontSize: "13px", width: "100%" }}
    />
  );
}

export default memo(InputMessage);
