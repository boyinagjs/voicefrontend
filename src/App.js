import React from "react";
import Sample from "./sample";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import SpeechToAI from "./components/voice";
import Chat from "./components/chat";
import Login from "./components/Login";
import CreateUser from "./components/CreateUser";
import Users from "./components/Users";


export default function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/speech" element={<SpeechToAI />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/createuser" element={<CreateUser />} />
          <Route path="/userslist" element={<Users />} />
          <Route path="/sample" element={<Sample />} />
        </Routes>
      </Router>
    </div>
  );
}