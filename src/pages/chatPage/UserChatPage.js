import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
// import KeyboardVoiceRoundedIcon from "@mui/icons-material/KeyboardVoiceRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import MessageListComponent from "./compnents/MessageListComponent";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import "react-chat-elements/dist/main.css";
import { setMessageObject } from "./compnents/messageUtils";
import Popup from "./compnents/Popup";
import { v4 } from "uuid";
import ChatToolbar from "./compnents/ChatToolbar";
import { startRecording, stopRecording } from "./chatUtil";
import { AttachmentButton } from "./compnents/AttachmentIcon";
import Compressor from "compressorjs";

const fileTypeStyles = {
  color: "#fff",
  marginLeft: "5px",
  fontSize: "14px",
};

const UserChatPage = () => {
  const location = useLocation();

  const { chatId } = useParams();
  const [messageList, setMessageList] = useState(null);
  const [inputText, setInputText] = useState("");
  const chatContainerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  const [showOptions, setShowOptions] = useState(false);

  const [inputFile, setInputFile] = useState(null);
  const [showFilePopup, setShowFilePopup] = useState(false);

  const handleOnFileClose = () => {
    setShowFilePopup(false);
    setInputFile(null);
  };

  const handleToggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleAudioRecordingStart = () => {
    startRecording({
      mediaRecorderRef,
      setInputFile,
      setIsRecording,
      setShowFilePopup,
    });
  };

  const handleAudioRecordingStop = () => {
    stopRecording({ mediaRecorderRef });
  };

  const handleOptionSelection = (e, option) => {
    // Handle option selection based on chosen type (e.g., image, video, file)
    setShowOptions(false);

    const uploadedFile = e.target.files[0];

    if (uploadedFile !== null && uploadedFile.type.startsWith("image/")) {
      new Compressor(uploadedFile, {
        quality: 0.2,
        success: (compressedFile) => {
          setInputFile(compressedFile);
          setShowFilePopup(true);
        },
      });
    } else {
      setInputFile(uploadedFile);
      setShowFilePopup(true);
    }
  };

  const scrollToLastMessage = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Async Utils

  const handleOnFileSend = async () => {
    setIsSending(true);
    const fileType = inputFile.type.startsWith("image/")
      ? "photo"
      : inputFile.type.startsWith("video/")
      ? "video"
      : inputFile.type.startsWith("audio/")
      ? "audio"
      : "file";

    try {
      window.NativeInterface.showFullscreenAdInChat();
    } catch (e) {
      console.log("Failed to Call Native Ad from ChatPage", e);
    }
    const fileName = inputFile.name;
    const imageRef = ref(storage, `${fileType}/${v4() + fileName}`);
    await uploadBytes(imageRef, inputFile).then(async (snapshot) => {
      setIsSending(false);
      handleOnFileClose();

      const createdDate = new Date();
      await getDownloadURL(snapshot.ref).then(async (url) => {
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            id: v4(),
            url: url,
            fromUsername: auth.currentUser.displayName,
            from: doc(db, "users", `${auth.currentUser.uid}`),
            messageType: fileType,
            createdAt: createdDate,
            filename: fileName,
          }),
        })
          .then(async (res) => {
            await updateDoc(doc(db, "userChats", auth.currentUser.uid), {
              [chatId + ".lastMessage"]: {
                message: `${fileType}: ${fileName}`,
              },
              [chatId + ".date"]: createdDate,
            });
            await updateDoc(doc(db, "userChats", location.state.userId), {
              [chatId + ".lastMessage"]: {
                message: `${fileType}: ${fileName}`,
              },
              [chatId + ".date"]: createdDate,
            });
          })
          .then((res) => {});
      });
    });
  };

  const fetchMessages = async () => {
    // setIsFetching(true);
    onSnapshot(doc(db, "chats", chatId), (doc) => {
      const messageData = doc.data().messages;
      const messages = messageData.map((message) => {
        return setMessageObject({ id: message.id }, message);
      });
      setMessageList(messages);
    });
    scrollToLastMessage();
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSendTextMessage = async () => {
    setIsSending(true);
    if (inputText.trim() !== "") {
      const message = inputText.trim();
      setInputText("");
      if (message !== "") {
        const createdDate = new Date();

        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            id: v4(),
            message: message,
            fromUsername: auth.currentUser.displayName,
            from: doc(db, "users", `${auth.currentUser.uid}`),
            messageType: "text",
            createdAt: createdDate,
          }),
        })
          .then(async (res) => {
            await updateDoc(doc(db, "userChats", auth.currentUser.uid), {
              [chatId + ".lastMessage"]: {
                message: message,
              },
              [chatId + ".date"]: createdDate,
            });
            await updateDoc(doc(db, "userChats", location.state.userId), {
              [chatId + ".lastMessage"]: {
                message: message,
              },
              [chatId + ".date"]: createdDate,
            });
          })
          .then((res) => {
            setIsSending(false);
            setInputText("");
          });
      }
    }
  };

  useEffect(() => {
    // getUserfromLocal();
    fetchMessages();
  }, [chatId]);

  return (
    <div className="relative h-screen flex flex-col  bg-[#1A1D1F]" onClick={() => showOptions && setShowOptions(false)}>
      {messageList ? (
        <MessageListComponent
          messageList={messageList}
          loggedInUserId={auth.currentUser?.uid}
          scrollToLastMessage={scrollToLastMessage}
          ref={chatContainerRef}
        />
      ) : (
        <div className="animate-spin bg-[#1A1D1F] mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
      )}
      <div className="absolute w-screen top-0 z-[50]">
        <ChatToolbar
          avatar={location.state.avatar}
          title={location.state.title}
          description={location.state.description}
        />
      </div>
      {/* bottom-[5vh] for cct */}
      <div className="px-4 py-3 flex justify-between absolute bottom-2 w-full z-[50] bg-[#1A1D1F] items-center">
        <div
          className="flex felx-1 w-full mx-2"
          style={{
            borderRadius: "50px",
            overflow: "hidden",
          }}
        >
          <button
            key="addButton"
            className="bg-[#8391A1] rounded-l-2xl text-blue-500 focus:outline-none pl-2"
            onClick={handleToggleOptions}
          >
            <AddCircleOutlineRoundedIcon className="text-[#D0E6FF] text-[24px]" />
          </button>
          <input
            placeholder="Type a message..."
            className="bg-[#8391A1] placeholder-[#D0E6FF] text-white rounded-r-2xl py-2 px-4 w-full focus:outline-none"
            value={inputText}
            onChange={handleInputChange}
            type="text"
          />
        </div>

        {/* {isSending ? (
          <button
            key="sendButton"
            onClick={() => {}}
            className={`text-blue-500 focus:outline-none ${isRecording ? "text-red-500" : ""}`}
          >
            <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
          </button>
        ) : inputText.trim() === "" ? (
          <button
            key="sendButton"
            disabled={inputText.trim() !== ""}
            onTouchStart={handleAudioRecordingStart}
            onTouchEnd={handleAudioRecordingStop}
            onTouchMove={handleAudioRecordingStop}
            onMouseDown={handleAudioRecordingStart}
            onMouseUp={handleAudioRecordingStop}
            onMouseLeave={handleAudioRecordingStop}
            className={`text-blue-500 focus:outline-none ${isRecording ? "text-red-500" : ""}`}
          >
            <KeyboardVoiceRoundedIcon className={`text-[28px] ${isRecording ? "text-red-500" : "text-blue-500"}`} />
          </button>
        ) : (
          <button
            key="sendButton"
            onClick={handleSendTextMessage}
            disabled={inputText.trim() === ""}
            className="text-blue-500 p-2 focus:outline-none flex justify-center items-center text-white bg-blue-500 rounded-lg focus:outline-none"
          >
            Send <SendRoundedIcon fontSize="small" className="text-white ml-2" />
          </button>
        )} */}
        <button
          key="sendButton"
          onClick={handleSendTextMessage}
          disabled={inputText.trim() === ""}
          className="text-blue-500 p-2 focus:outline-none flex justify-center items-center text-white bg-blue-500 rounded-lg focus:outline-none"
          style={{
            borderRadius: "20px",
            height: "36px",
          }}
        >
          Send <SendRoundedIcon fontSize="small" className="text-white ml-2" />
        </button>

        {showOptions && (
          <div
            className="absolute flex flex-col justify-around left-6 bottom-12 mb-2 bg-white rounded-md shadow-lg py-2 z-10 w-28"
            style={{
              backgroundColor: "rgb(83, 92, 102)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AttachmentButton
              id={"fileInputPhoto"}
              accept={".jpg,.jpeg,.png,.gif"}
              type={"photo"}
              handleOptionSelection={handleOptionSelection}
            >
              <ImageRoundedIcon className="text-gray-400 text-[20px]" />
              <span style={fileTypeStyles}>Photo</span>
            </AttachmentButton>
            <AttachmentButton
              id={"fileInputVideo"}
              accept={".mp4"}
              type={"video"}
              handleOptionSelection={handleOptionSelection}
            >
              <VideocamRoundedIcon className="text-gray-400 text-[20px]" />
              <span style={fileTypeStyles}>Video</span>
            </AttachmentButton>
            <AttachmentButton
              id={"fileInputFile"}
              accept={".pdf,.doc,.docx"}
              type={"file"}
              handleOptionSelection={handleOptionSelection}
            >
              <UploadFileRoundedIcon className="text-gray-400 text-[20px]" />
              <span style={fileTypeStyles}>File</span>
            </AttachmentButton>
          </div>
        )}
      </div>
      {showFilePopup && (
        <Popup file={inputFile} onSend={handleOnFileSend} onClose={handleOnFileClose} isSending={isSending} />
      )}

      {/* h-[5vh] for cct */}
      <div className=" w-full bg-[#1A1D1F]"></div>
    </div>
  );
};

export default UserChatPage;
