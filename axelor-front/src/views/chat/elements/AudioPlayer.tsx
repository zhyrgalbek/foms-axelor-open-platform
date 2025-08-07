"use client";
import { memo, useCallback, useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useWavesurfer } from "@wavesurfer/react";

interface AudioPlayerPropsType {
  src?: string;
}
const formatTime = (seconds: number) =>
  [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(":");

const AudioPlayer = memo(({ src }: AudioPlayerPropsType) => {
  const containerRef = useRef(null);
  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 40,
    width: 200,
    waveColor: "#ccd0d5",
    progressColor: "#b1b3b9",
    barWidth: 2,
    url: src,
    // plugins: useMemo(
    //   () => [
    //     HoverPlugin.create({
    //       labelBackground: "#555",
    //       labelColor: "#fff",
    //       labelSize: "11px",
    //     }),
    //   ],
    //   []
    // ),
  });

  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  return (
    <Box sx={{ height: "60px", marginRight: "65px", marginTop: "10px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <IconButton onClick={onPlayPause} sx={{ padding: 0 }}>
          {isPlaying ? (
            <PauseIcon sx={{ width: "30px", height: "30px" }} />
          ) : (
            <PlayArrowIcon sx={{ width: "30px", height: "30px" }} />
          )}
        </IconButton>
        <Box sx={{ position: "relative" }}>
          <Box ref={containerRef} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              position: "absolute",
              bottom: "-20px",
            }}
          >
            <Typography variant={"caption"}>{formatTime(currentTime)}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
