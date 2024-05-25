import React, { useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CustomPopup from "./CustomPopup";
import { useNavigate } from "react-router-dom";
import imageError from "../../../assets/icons/image-error.png";

const ChatToolbar = ({ avatar, title, description, groupSize, showToolbarPopup, toggleToolbarPopup = () => {} }) => {
  const navigate = useNavigate();

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopupOpen = () => {
    setIsPopupOpen(true);
    toggleToolbarPopup(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    toggleToolbarPopup(false);
  };

  const showPopup = showToolbarPopup ?? isPopupOpen;

  return (
    <div className="bg-[#111315] text-[#FBFBFB] py-4 px-8 flex items-center shadow-md">
      <button
        onClick={() => {
          navigate("/");
        }}
        className="pr-4"
      >
        <ArrowBackRoundedIcon className=" text-lg" />
      </button>
      <h2 className="flex-grow text-xl font-bold cursor-pointer ml-2" onClick={handlePopupOpen}>
        {title}
      </h2>
      <button className="w-10 h-10 rounded-full overflow-hidden">
        <img
          src={avatar}
          alt={title + "image"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = imageError;
          }}
        />
      </button>

      {groupSize && (
        <CustomPopup isOpen={showPopup} onClose={handlePopupClose}>
          <div className="text-start">
            <h3
              className="text-lg text-gray-600 font-italic mb-2"
              style={{
                color: "#CCC",
              }}
            >
              <br />
              <span style={{ color: "#FFDF00", fontWeight: "bold", fontSize: "20px" }}>
                Group Description:
                <br />
                Total users in the group: {3000 + groupSize}
              </span>
              <br />
              <span style={{ fontSize: "18px" }}>
                1. Group lo evaru kuda poratam cheyaradhu
                <br />
                2. Group lo photos and videos baytaki share cheyaradhu
                <br />
                3. Group lo kodlaki sambandinchinavi thappa vere discussions pettakudadhu
                <br />
                4. Evaraina Chat lo thappu ga behave chesthe, varini ventane app nundi block cheyadam jaruguthundi.
                <br />
              </span>
              <span style={{ color: "#e1a95f" }}>
                Meeru evartho aina personal ga chat cheyali anukunte, edaina group lo vari photo medha click chesinattu
                aithe variki message pampagalaru
              </span>
            </h3>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        </CustomPopup>
      )}
    </div>
  );
};

export default ChatToolbar;
