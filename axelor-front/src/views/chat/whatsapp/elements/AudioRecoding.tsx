"use client";
import { Delete, KeyboardVoice, Send, StopCircle } from "@mui/icons-material";
import { Box, CircularProgress, Fab, IconButton, Stack, Zoom } from "@mui/material";
import { grey, red } from "@mui/material/colors";
import { memo, useCallback, useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { enqueueSnackbar } from "notistack";
import { useChatMessage } from "../store/message";
import { useChatStore } from "../store/chatStore";
import { useChatFileStore } from "../store/fileStore";
import { useChatUserStore } from "../store/chatUser";
import { ChatBoxVariant } from "../types/chatTypes";

interface BlobType {
  readonly size: number;
  readonly type: string;
  slice(start?: number, end?: number, contentType?: string): Blob;
}

interface StateBlobType {
  file: any;
  send: false;
  src: any;
}

interface AudioRecordingProps {
  state: number;
  onClickMicrophone?: () => void;
  variant: ChatBoxVariant;
}

function AudioRecording(props: AudioRecordingProps) {
  const { state, onClickMicrophone, variant } = props;
  const [blob, setBlob] = useState<StateBlobType>({
    send: false,
    file: null,
    src: null,
  });
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const [mediaRecord, setMediaRecord] = useState<MediaRecorder | null>(null);
  const [stateMicrophone, setStateMicrophone] = useState<number>(1);
  const { currentUserId } = useChatUserStore((state) => state);
  const { uploadFileAxelor, uploadFileWhatsapp } = useChatFileStore((state) => state);
  const { chat } = useChatStore((state) => state);
  const { sendMessageLoading } = useChatMessage((state) => state);
  const [sendAudio, setSendAudio] = useState<boolean>(false);
  const { setSendMessageLoading, setMessageLoading } = useChatMessage((state) => state);

  const startRecord = useCallback(() => {
    setChunks([]);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream: MediaStream) => {
        let media = new MediaRecorder(stream, { mimeType: "audio/webm" });
        setMediaRecord(media);

        media.onstart = function () {
          if (blob && blob.file) {
            setBlob({
              send: false,
              file: null,
              src: null,
            });
          }
        };

        media.start();

        media.ondataavailable = function (e: BlobEvent) {
          let newChunks: BlobPart[] = chunks;
          newChunks.push(e.data);
          setChunks(newChunks);
        };

        media.onstop = function (event: any) {
          let newBlob: any = new Blob(chunks, { type: "audio/webm" });

          if (event && event.target && event.target.stream) {
            event.target.stream.getTracks().forEach((track: any) => {
              track.stop(); // Остановка всех треков медиапотока
            });
          }
          let reader = new FileReader();
          reader.readAsDataURL(newBlob);
          reader.onload = function () {
            setBlob((prevBlob) => ({
              ...prevBlob,
              file: newBlob,
              src: reader.result,
            }));
          };
          reader.onerror = function () {
            // console.log(reader.onerror);
          };
          // console.log("stopRecording");
        };

        media.onerror = function (error) {
          // console.error("Error:", error);
        };
      })
      .catch(function (error) {
        // console.error("getUserMediar error", error);
      });
  }, [chunks, setChunks, setMediaRecord, setBlob]);

  const stopRecording = useCallback(() => {
    if (mediaRecord) {
      mediaRecord?.stop();
      setStateMicrophone(2);
    }
  }, [mediaRecord, setStateMicrophone]);

  const startRecording = useCallback(() => {
    startRecord();
    setStateMicrophone(1);
  }, [startRecord, setStateMicrophone]);

  const sendAudioRecord = useCallback(async () => {
    stopRecording();
    setSendAudio(true);
    // socket.send(file);
    // Здесь можно отправлять файл file
    // Здесь можно отправлять файл blob.file
  }, [stopRecording, setSendAudio]);

  const removeRecording = useCallback(() => {
    onClickMicrophone && onClickMicrophone();
  }, [onClickMicrophone]);

  useEffect(() => {
    if (state === 2 && (!mediaRecord || mediaRecord.state === "inactive")) {
      startRecord();
    }
    if (state !== 2) {
      stopRecording();
      setMediaRecord(null);
      setChunks([]);
      setBlob({
        send: false,
        file: null,
        src: null,
      });
      setSendAudio(false);
      setStateMicrophone(1);
    }
  }, [state]);

  useEffect(() => {
    const func = async function () {
      if (state !== 2 && blob.file) {
        setBlob({ file: null, src: null, send: false });
      }
      if (sendAudio && blob.file) {
        if (blob.file && chat && currentUserId) {
          setSendMessageLoading(true);
          if (!chat.appeal) {
            try {
              const res = await uploadFileAxelor({ file: blob.file, chat, currentUserId, variant });
              setMessageLoading(false);
              setSendMessageLoading(false);
              removeRecording();
              enqueueSnackbar("Файл успешно загружен", { variant: "success" });
            } catch (error: any) {
              setMessageLoading(false);
              setSendMessageLoading(false);
              enqueueSnackbar(error?.message, { variant: "error" });
            }
          }
          if (chat.appeal) {
            try {
              const res = await uploadFileWhatsapp({ file: blob.file, chat, currentUserId, variant });
              setMessageLoading(false);
              setSendMessageLoading(false);
              removeRecording();
              enqueueSnackbar("Файл успешно загружен", { variant: "success" });
            } catch (error: any) {
              setMessageLoading(false);
              setSendMessageLoading(false);
              enqueueSnackbar(error?.message, { variant: "error" });
            }
          }
        }
      }
    };
    func();
  }, [blob, sendAudio]);

  return (
    <>
      {state === 2 && (
        <Box
          sx={{
            bgcolor: grey[300],
            position: "absolute",
            top: -15,
            left: -15,
            right: -15,
            bottom: -15,
            zIndex: 100,
            display: "flex",
          }}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
            flexGrow={1}
            alignItems="center"
            sx={{ pl: 2, pr: 2, position: "relative" }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%", position: "relative" }}
            >
              <Zoom in={state === 2}>
                <IconButton sx={{ color: "#3f51b5" }} onClick={removeRecording}>
                  <Delete />
                </IconButton>
              </Zoom>
              {stateMicrophone === 2 && blob.src && <AudioPlayer src={blob.src} />}
              {stateMicrophone === 1 && (
                <Zoom in={stateMicrophone === 1}>
                  <IconButton sx={{ color: red[400] }} onClick={stopRecording}>
                    <StopCircle />
                  </IconButton>
                </Zoom>
              )}
              {stateMicrophone === 2 && (
                <Zoom in={stateMicrophone === 2}>
                  <IconButton sx={{ color: red[400] }} onClick={startRecording}>
                    <KeyboardVoice />
                  </IconButton>
                </Zoom>
              )}

              <Zoom in={state === 2}>
                <Fab color="primary" onClick={sendAudioRecord} sx={{ width: "45px", height: "45px" }}>
                  <Send />
                </Fab>
              </Zoom>
              {sendMessageLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    bgcolor: "#fff",
                    zIndex: 10000,
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              )}
            </Stack>
          </Stack>
        </Box>
      )}
    </>
  );
}
export default memo(AudioRecording);
