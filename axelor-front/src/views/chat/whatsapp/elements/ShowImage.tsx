"use client";

import { Box } from "@mui/material";
import { memo } from "react";
interface ShowImagePropsType {
  src: string | undefined;
  alt: string;
}

function ShowImage({ src, alt }: ShowImagePropsType) {
  return <Box component="img" src={src} sx={{ width: "30%", height: "30%", objectFit: "cover" }} alt={alt}></Box>;
}

export default memo(ShowImage);
