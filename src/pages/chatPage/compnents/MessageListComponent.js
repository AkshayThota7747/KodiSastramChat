import React, { forwardRef, useEffect, useRef, useState } from "react";
import { MessageBox } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import { useNavigate } from "react-router-dom";
import { handleOpenUserChat } from "../chatUtil";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import imageError from "../../../assets/icons/image-error.png";
import MessageItem from "./MessageItem";

const MessageListComponent = forwardRef(
  ({ messageList, loggedInUserId, scrollToLastMessage, loadMoreMessages, scrolled, setScrolled }, ref) => {
    const [showPreview, setShowPreview] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isReplyPrivtelyLoader, setIsReplyPrivtelyLoader] = useState(false);
    const [messageId, setMessageId] = useState(-1);
    const navigate = useNavigate();

    // const ref = useRef(null);

    useEffect(() => {
      !scrolled && scrollToLastMessage();
      // setScrolled(true);
      const container = ref.current;
      if (container) {
        container.addEventListener("scroll", handleScroll);
      }

      return () => {
        if (container) {
          container.removeEventListener("scroll", handleScroll);
        }
      };
    }, [scrollToLastMessage, scrolled]);

    const handleScroll = () => {
      const container = ref.current;
      if (container.scrollTop === 0 && container.scrollHeight > container.clientHeight) {
        // User has scrolled to the top
        loggedInUserId && loadMoreMessages();
      }
    };

    return (
      <div className="flex-1 overflow-y-auto pt-24 pb-16 mb-2 bg-[#1A1D1F]" ref={ref}>
        {messageList.map((message) => {
          const isImage = message.type === "photo";
          const isVideo = message.type === "video";
          const position = message.from === loggedInUserId ? "right" : "left";
          const borderTopLeft = message.from === loggedInUserId ? "0px" : "25px";
          const borderTopRight = message.from === loggedInUserId ? "0px" : "25px";
          const bgColor = message.from === loggedInUserId ? "#000" : "#535C66";
          const titleColor = message.from === loggedInUserId ? "#EF4444" : "#FEBC99";
          const messageTitle = message.from === loggedInUserId ? "You" : message.title;
          const textColor = "#FBFBFB";

          const props = {
            onDownload: (e) => {
              console.log("Add Video Ad");
              const fileUrl = message.data.uri;
              const link = document.createElement("a");
              link.href = fileUrl;
              link.download = message.text;
              link.setAttribute("rel", "noopener noreferrer");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            },
          };
          const handleMessageOpen = () => {
            if (isImage || isVideo) {
              console.log("first");
              setMessageId(message.id);
              setShowPreview(true);
            }
          };
          const handleOnPreviewClose = () => {
            setMessageId(-1);
            setShowPreview(false);
          };
          const handleTitleClick = () => {
            if (message.from !== loggedInUserId) {
              messageId === -1 ? setMessageId(message.id) : setMessageId(-1);
              setShowPopup(!showPopup);
            }
          };
          return (
            <div key={message.id} className="bg-[#1A1D1F]">
              {showPopup && messageId === message.id && (
                <>
                  {message.from !== loggedInUserId ? (
                    <div
                      className={`cursor-pointer w-[150px] h-[34px] flex items-center justify-center text-white bg-[#8391A1] rounded-md z-50 ml-2`}
                      onClick={async () => {
                        setIsReplyPrivtelyLoader(true);
                        await handleOpenUserChat(message.from, navigate, setIsReplyPrivtelyLoader);
                      }}
                      style={{
                        borderRadius: "20px",
                        height: "36px",
                      }}
                    >
                      <ReplyRoundedIcon className="pr-1" />
                      Reply Privately
                    </div>
                  ) : (
                    <div
                      className={`cursor-pointer w-[130px] h-[34px] float-right flex items-center justify-center text-white bg-red-500 rounded-md z-50 mr-2`}
                      onClick={async () => {
                        console.log("delete btn clicked");
                      }}
                    >
                      <DeleteForeverRoundedIcon className="pr-1" />
                      Delete
                    </div>
                  )}
                </>
              )}

              {isReplyPrivtelyLoader && (
                <div className="absolute fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center relative w-full h-[75vh]">
                    <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
                  </div>
                </div>
              )}
              <MessageItem
                id={message.id}
                position={position}
                title={messageTitle}
                onTitleClick={handleTitleClick}
                onOpen={handleMessageOpen}
                text={message.text}
                type={message.type}
                date={new Date(message.dateString)}
                data={message.data}
                onDownload={props.onDownload}
                // notch={false}
                notchStyle={{
                  fill: bgColor,
                }}
                titleColor={titleColor}
                styles={{
                  // backgroundColor: bgColor,
                  borderRadius: "25px",
                  borderTopRightRadius: message.from === loggedInUserId ? "0px" : "25px",
                  borderTopLeftRadius: message.from === loggedInUserId ? "25px" : "0px",
                  marginLeft: "30px",
                  color: textColor,
                  objectFit: "contain",
                  backgroundColor: bgColor,
                }}
                avatar="https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png"
                isFirstPersonMessage={messageTitle === "You"}
              />

              {showPreview && messageId === message.id && (
                <div className="absolute fixed top-0 left-0 w-screen h-screen bg-black flex items-center justify-center z-50">
                  <div className="flex flex-col items-center justify-center relative w-[95%] h-[75%] rounded-lg">
                    <button
                      className="text-white bg-gray-500 p-2 flex items-center justify-center rounded-lg ml-auto text-white focus:outline-none mb-3"
                      onClick={handleOnPreviewClose}
                      style={{
                        borderRadius: "20px",
                        height: "36px",
                      }}
                    >
                      <CloseRoundedIcon fontSize="small" className="text-white h-2 w-2 mr-1" />
                      Close
                    </button>
                    {isImage ? (
                      <div className="flex items-center justify-center text-lg z-50">
                        <img
                          src={message.data.uri}
                          alt="uploadedImage"
                          className="object-contain w-full h-full max-h-[60vh]"
                          onError={(e) => {
                            e.target.src = imageError;
                          }}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                    {isVideo ? (
                      <div className="flex items-center justify-center text-lg z-50">
                        <video controls className="object-contain w-full h-full max-h-[60vh]">
                          <source src={message.videoData.videoURL} type={"video/mp4"} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

export default MessageListComponent;
