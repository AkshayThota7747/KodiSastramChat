import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../common/Navbar";
import TabPanel from "../common/TabPanel";
import "react-chat-elements/dist/main.css";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ChatListComponent from "./chatPage/compnents/ChatListComponent";
import Search from "../common/Search";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("grpchat");
  const [groupChats, setGroupChats] = useState(null);
  const [userChats, setUserChats] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const validateUser = (user) => {
    if (user.uid && user.phoneNumber && user.username && user.photoURL) {
      return true;
    } else {
      return false;
    }
  };
  const handleGroupItemClick = (groupId, avatar, title, description) => {
    navigate(`/chat/${groupId}`, {
      state: { avatar, title, description },
    });
  };
  const handleUserChatItemClick = (chatId, avatar, title, userId) => {
    navigate(`/chat/userChat/${chatId}`, {
      state: { avatar, title, userId },
    });
  };

  const tabs = [
    { id: "privatechat", label: "Chats •" },
    { id: "grpchat", label: "Groups •" },
  ];

  const getGroupsData = async () => {
    setIsFetching(true);

    const fetchGroupsDataQuery = query(
      collection(db, "GroupChats")
      // , orderBy("date", "desc")
    );
    const unsub = onSnapshot(fetchGroupsDataQuery, (querySnapshot) => {
      var groupChatsArray = [];
      querySnapshot.forEach((doc) => {
        var groupData = doc.data();
        groupData.id = doc.id;
        groupData.subtitle = groupData.lastMessage;
        groupData.date = groupData.date.toDate();
        delete groupData.lastMessage;
        groupChatsArray.push(groupData);
      });
      setGroupChats(groupChatsArray);
    });
    setIsFetching(false);
    return () => {
      unsub();
    };
  };

  const getUserChatsData = async () => {
    setIsFetching(true);
    const unsub = onSnapshot(doc(db, "userChats", auth.currentUser.uid), (doc) => {
      const userChatsArray =
        doc.data() &&
        Object.entries(doc.data())
          ?.sort((a, b) => b[1].date.toDate() - a[1].date.toDate())
          .map((chat) => {
            return {
              id: chat[0],
              title: chat[1].userInfo.displayName,
              avatar: chat[1].userInfo.photoURL,
              subtitle: chat[1].lastMessage?.message || "say hi...",
              date: chat[1].date?.toDate(),
              userId: chat[1].userInfo.uid,
            };
          });
      setIsFetching(false);
      setUserChats(userChatsArray);
    });
    setIsFetching(false);
    return () => {
      unsub();
    };
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const loggedInUser = {
          username: user.displayName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
          uid: user.uid,
        };
        if (!validateUser(loggedInUser)) {
          navigate("/details");
        } else {
          getGroupsData();
          getUserChatsData();
        }
      } else {
        console.log("user is logged out");
        navigate("/login");
      }
    });
  }, []);

  return (
    <>
      {auth.currentUser ? (
        <div className="h-screen flex flex-col bg-[#1A1D1F] font-primary">
          {auth.currentUser && <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />}

          <div className="flex justify-between items-center px-6">
            {/* <div className="text-xl sm:text-2xl font-bold text-[#D0E6FF]">Recent Chats</div> */}
            {/* <button
          className="flex text-sm sm:text-md items-center px-2 text-blue-500 rounded-full focus:outline-none"
          // onClick={handleNewMessageClick}
        >
          <AddCircleOutlineRoundedIcon className="mr-1" />
          New Message
        </button> */}
          </div>

          <div style = {{
              flex: "1",
              container: "true",
              mxAuto: "true",
              // background: "#1F1F1F"
              background: "linear-gradient(to top, #614385, #2E3192 )"
              // background : "#000000"

            }}>
            {activeTab === "grpchat" ? (
              <div className="px-4">
                {auth.currentUser && groupChats ? (
                  <ChatListComponent chats={groupChats} handleChatItemClick={handleGroupItemClick} />
                ) : (
                  <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-black"></div>
                )}
              </div>
            ) : (
              <div className="px-4">
                <Search />

                {auth.currentUser && userChats ? (
                  <ChatListComponent chats={userChats} handleChatItemClick={handleUserChatItemClick} />
                ) : isFetching ? (
                  <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-black"></div>
                ) : (
                  <div className="text-center text-white">No chats yet{userChats}</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Home;
