import React from "react";
import { ChatItem } from "react-chat-elements";

const ChatListComponent = ({ chats, handleChatItemClick }) => {
  return (
    <div className="overflow-y-auto flex-1 w-full">
      {chats.map((chatItem) => {
        return (
          <ChatItem
            key={chatItem.id}
            avatar={chatItem.avatar}
            alt={chatItem.alt}
            title={chatItem.title}
            subtitle={chatItem.subtitle}
            date={chatItem.date}
            onClick={() => handleChatItemClick(chatItem.id, chatItem.avatar, chatItem.title)}
            className="rounded-3xl my-2 text-white bg-[#8391A1]"
          />
        );
      })}
    </div>
  );
};

export default ChatListComponent;
