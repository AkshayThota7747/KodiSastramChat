import React from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import imageError from "../../../assets/icons/image-error.png";

const Popup = ({ file, onClose, onSend, isSending }) => {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center relative w-[90%] max-h-[75vh] p-4 rounded-lg bg-[#535C66] ">
        <button
          className=" text-white bg-red-500 p-2 flex items-center justify-center rounded-lg ml-auto text-white focus:outline-none mb-3"
          disabled={isSending}
          onClick={onClose}
          style={{
            borderRadius: "20px",
            height: "36px",
          }}
        >
          <CloseRoundedIcon fontSize="small" className="text-white h-2 w-2 mr-1" />
          Close
        </button>

        {isImage ? (
          // <div className="flex items-center justify-center text-lg">
          <img
            src={URL.createObjectURL(file)}
            alt="uploadedImage"
            className="object-contain w-full h-full max-h-[60vh]"
            onError={(e) => {
              e.target.src = imageError;
            }}
          />
        ) : // {/* </div> */}
        isVideo ? (
          // <div className="flex items-center justify-center text-lg">
          <video controls className="object-contain w-full h-[94%] max-h-[60vh]">
            <source src={URL.createObjectURL(file)} type={file.type} />
            Your browser does not support the video tag.
          </video>
        ) : // </div>
        isAudio ? (
          <div className="flex items-center justify-center text-lg max-h-[60vh]">
            <audio controls>
              <source src={URL.createObjectURL(file)} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <div className="flex items-center justify-center text-lg bg-gray-200 w-[85%] h-[40vh]">{file.name}</div>
        )}

        {isSending ? (
          <button className="ml-auto w-10 h-10 flex items-center justify-center text-white bg-blue-500 rounded-full focus:outline-none mt-1">
            <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
          </button>
        ) : (
          <button
            className="text-lg ml-auto p-2 flex items-center justify-center text-white bg-blue-500 rounded-lg focus:outline-none mt-3"
            onClick={onSend}
            style={{
              borderRadius: "20px",
              height: "36px",
            }}
          >
            Send <SendRoundedIcon fontSize="small" className="text-white h-2 w-2 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Popup;
