import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { HashRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Details from "./pages/Details";
import ChatPage from "./pages/chatPage/ChatPage";
import UserChatPage from "./pages/chatPage/UserChatPage";
import "./App.css";
import { isServerDown } from "./config/config";
import ServerDownPage from "./pages/ServerDownPage";

function App() {
  return (
    <Router>
      <div>
        <section>
          <Routes>
            {" "}
            <Route path="/" element={<Home />} />
            <Route path="/details" element={<Details />} />
            <Route path="/login" element={<Login />} />
            <Route exact path="/chat/:groupId" element={<ChatPage />} />
            <Route exact path="/chat/userChat/:chatId" element={<UserChatPage />} />
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
