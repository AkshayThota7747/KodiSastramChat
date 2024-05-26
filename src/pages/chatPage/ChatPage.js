import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import KeyboardVoiceRoundedIcon from "@mui/icons-material/KeyboardVoiceRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import MessageListComponent from "./compnents/MessageListComponent";
import {
  collection,
  query,
  orderBy,
  addDoc,
  doc,
  onSnapshot,
  updateDoc,
  getCountFromServer,
  limitToLast,
} from "firebase/firestore";
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

const ChatPage = () => {
  const location = useLocation();

  const { groupId } = useParams();
  const [messageList, setMessageList] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [showToolbarPopup, setShowToolbarPopup] = useState(false);

  const [showOptions, setShowOptions] = useState(false);

  const [inputFile, setInputFile] = useState(null);
  const [showFilePopup, setShowFilePopup] = useState(false);

  const [groupSize, setGroupSize] = useState();

  const [scrolled, setScrolled] = useState(false); //handle scroll on new message send

  const handleOnFileClose = () => {
    setShowFilePopup(false);
    setInputFile(null);
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleToggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionSelection = (e, option) => {
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
      const chatContainer = chatContainerRef.current;
      const scrollHeight = chatContainer.scrollHeight;
      const start = chatContainer.scrollTop;
      const change = scrollHeight - start;
      const increment = 20;
      let currentTime = 0;

      const animateScroll = () => {
        currentTime += increment;
        const easedScrollTop = easeInOutQuad(currentTime, start, change, 500);
        chatContainer.scrollTop = easedScrollTop;
        if (currentTime < 500) {
          requestAnimationFrame(animateScroll);
        }
      };

      animateScroll();
    }
  };

  const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  // AsyncUtils

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
    await uploadBytes(imageRef, inputFile)
      .then(async (snapshot) => {
        setIsSending(false);
        handleOnFileClose();

        const createdDate = new Date();

        await getDownloadURL(snapshot.ref).then(async (url) => {
          await addDoc(collectionRef, {
            createdAt: createdDate,
            from: doc(db, "users", `${auth.currentUser.uid}`),
            fromUsername: auth.currentUser.displayName,
            messageType: fileType,
            url: url,
            filename: fileName || "mediaFile",
          }).then(async (res) => {
            await updateDoc(doc(db, "GroupChats", groupId), {
              lastMessage: `${fileType}: ${fileName}`,
              date: createdDate,
            }).then(() => {});
          });
        });
      })
      .catch((e) => console.log(e));
  };

  const childCollection = groupId + "Messages";

  const fetchMessages = async (lim = 20) => {
    console.log("lim:", lim);
    const fetchMessagesQuery = query(
      collection(db, "GroupChats", groupId, childCollection),
      orderBy("createdAt", "asc"),
      limitToLast(lim) //change this to fetch only last n messages
    );

    const unsub = onSnapshot(fetchMessagesQuery, (querySnapshot) => {
      setIsFetching(true);
      var messages = [];
      querySnapshot.forEach((doc) => {
        var messageData = doc.data();
        messages.push(setMessageObject(doc, messageData));
      });
      if (messages.length !== 0) {
        setMessageList(messages);
        setIsFetching(false);
        // scrollToLastMessage();
      }
    });
    return () => {
      unsub();
    };
  };

  const loadMoreMessages = async () => {
    console.log("loading older messages");
    console.log(messageList.length);
    await fetchMessages(messageList.length + 20);
  };

  const getUSersCount = async () => {
    const coll = collection(db, "users");
    const snapshot = await getCountFromServer(coll);
    setGroupSize(snapshot.data().count);
  };

  const collectionRef = collection(db, "GroupChats", groupId, childCollection);
  const handleSendTextMessage = async () => {
    setIsSending(true);
    if (inputText.trim() !== "") {
      const message = inputText.trim();
      setInputText("");
      if (message !== "") {
        const createdDate = new Date();
        await addDoc(collectionRef, {
          createdAt: createdDate,
          from: doc(db, "users", `${auth.currentUser.uid}`),
          fromUsername: auth.currentUser.displayName,
          message: message,
          messageType: "text",
        }).then(async (res) => {
          await updateDoc(doc(db, "GroupChats", groupId), {
            lastMessage: message,
            date: createdDate,
          });
          setScrolled(false);
          setIsSending(false);
          setInputText("");
        });
      }
    }
  };

  useEffect(() => {
    getUSersCount();
    fetchMessages();
    scrollToLastMessage();
  }, [groupId]);

  return (
    <div
      className="relative h-screen flex flex-col bg-[#1A1D1F]"
      onClick={() => {
        showOptions && setShowOptions(false);
        showToolbarPopup && setShowToolbarPopup(false);
      }}
    >
      {/* <div className="flex-1 overflow-y-auto pt-24 pb-16 bg-[#1A1D1F]" ref={chatContainerRef}> */}
      {!isFetching && messageList ? (
        <MessageListComponent
          messageList={messageList}
          loggedInUserId={auth.currentUser?.uid}
          scrollToLastMessage={scrollToLastMessage}
          ref={chatContainerRef}
          loadMoreMessages={loadMoreMessages}
          scrolled={scrolled}
          setScrolled={setScrolled}
        />
      ) : (
        <div className="animate-spin bg-[#1A1D1F] mx-auto rounded-full h-6 w-6"></div>
      )}
      {/* </div> */}
      <div className="absolute w-screen fixed top-0 z-[50]">
        <ChatToolbar
          avatar={location.state.avatar}
          title={location.state.title}
          description={location.state.description}
          groupSize={groupSize}
          showToolbarPopup={showToolbarPopup}
          toggleToolbarPopup={setShowToolbarPopup}
        />
      </div>
      {/* bottom-[5vh]  for cct */}
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
            className="bg-black rounded-l-2xl text-blue-500 focus:outline-none pl-2"
            onClick={handleToggleOptions}
          >
            <AddCircleOutlineRoundedIcon className="text-[#D0E6FF] text-[24px]" />
          </button>
          <input
            placeholder="Type a message..."
            className="bg-black placeholder-[#D0E6FF] text-white rounded-r-2xl py-2 px-4 w-full focus:outline-none"
            value={isSending ? "" : inputText}
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
            onTouchStart={() => {
              startRecording({
                mediaRecorderRef,
                setInputFile,
                setIsRecording,
                setShowFilePopup,
              });
            }}
            onTouchEnd={() => {
              stopRecording({ mediaRecorderRef });
            }}
            onTouchMove={() => {
              stopRecording({ mediaRecorderRef });
            }}
            onMouseDown={() => {
              startRecording({
                mediaRecorderRef,
                setInputFile,
                setIsRecording,
                setShowFilePopup,
              });
            }}
            onMouseUp={() => {
              stopRecording({ mediaRecorderRef });
            }}
            onMouseLeave={() => {
              stopRecording({ mediaRecorderRef });
            }}
            className={`text-blue-500 focus:outline-none ${isRecording ? "text-red-500" : ""}`}
          >
            <KeyboardVoiceRoundedIcon className={` text-[28px] ${isRecording ? "text-red-500" : "text-blue-500"}`} />
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
          className="text-blue-500 p-2 focus:outline-none flex justify-center items-center text-white bg-[#f43f5e] rounded-lg focus:outline-none"
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

export default ChatPage;
