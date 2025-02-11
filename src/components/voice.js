import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import Cookies from "js-cookie";
import CustomerComponent from "./CustomerComponent";

const App = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setrole] = useState(null);
  const [userid, seturserid] = useState(null);
  useEffect(() => {
    const storedrole = localStorage.getItem("role")
    const storeduser = localStorage.getItem("userId")
    if (storedrole) {
      setrole(storedrole);
      seturserid(storeduser);
      setIsAuthenticated(true);
    }
    else {
      return navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.clear(); // Clear user role from localStorage
    Cookies.remove("userid");
    return navigate('/login');
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!isAuthenticated ? "Loading..." : (
        <div>
          {/* Add the new button container */}
          {(role === "admin" || role === "superadmin") && (
            <div style={styles.buttonContainer}>
              <a href="/createuser" style={styles.userButton}>
                Show Users
              </a>
              <a href="/userslist" style={styles.userButton}>
                Add User
              </a>
            </div>
          )}

          {role === "admin" || role === "superadmin" ? (
            <ChatGPTComponent />
          ) : (
            <CustomerComponent />
          )}
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};




const ChatGPTComponent = () => {
  const [messages, setMessages] = useState([]); // Stores chat history
  const [userInput, setUserInput] = useState(""); // Tracks the current input
  const [isLoading, setIsLoading] = useState(false); // Loading state for API call
  const [isListening, setIsListening] = useState(false); // Listening state
  const [transcript, setTranscript] = useState(""); // Stores speech transcript

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    recognition.start();

    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      await setUserInput(event.results[0][0].transcript); // Update userInput with spoken text
      recognition.stop();
      setIsListening(false);
      console.log(userInput);
      console.log(event.results[0][0].transcript)
      handleSend(spokenText); // Trigger API call with spoken text
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  };

  const stopListening = () => {
    setIsListening(false);
    recognition.stop();
  };

  const handleSend = async (inputText = null) => {
    const messageContent = inputText || userInput.trim();
    if (!messageContent) return;

    // Create new messages array with only the latest user and AI messages
    const newMessages = [
      { role: "user", content: messageContent },
    ];
    setMessages(newMessages); // Set messages to only the latest user message

    //setUserInput(""); // Clear input
    setIsLoading(true);

    try {
      const apiKey = "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";
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: newMessages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      // Add AI's response to chat history
      const aiResponse = response.data.choices[0].message.content;
      setMessages([
        { role: "user", content: messageContent },
        { role: "assistant", content: aiResponse },
      ]);

      // Optionally, save to database
      await saveToDatabase(messageContent, aiResponse);
      setUserInput("");
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setMessages([
        { role: "user", content: messageContent },
        { role: "assistant", content: "Error: Unable to process your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToDatabase = async (question, answer) => {
    try {
      const data = JSON.stringify({ question, answer, id: 1 });
      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: "https://voicebackend-1dix.onrender.com/updateFaq",
        headers: { "Content-Type": "application/json" },
        data,
      };
      const updateResponse = await axios(config);
      console.log("FAQ Updated:", updateResponse.data);
    } catch (error) {
      console.error("Error updating FAQ:", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.scrollingText}>
        What can I help you?
      </div>
      <div style={styles.chatContainer}>
        {/* Chat Messages */}
        <div style={styles.chatBox}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={
                message.role === "user" ? styles.userMessage : styles.aiMessage
              }
            >
              <p style={styles.messageText}>{message.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}</p>
            </div>
          ))}
          {isLoading && <p style={styles.loadingText}>Typing...</p>}
        </div>

        {/* Input Box */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={userInput} // Ensure this is bound to userInput state
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            style={styles.input}
            disabled={isListening} // Disable input while listening
          />
          <button onClick={() => handleSend()} style={styles.sendButton}>
            Send
          </button>
        </div>


        {/* Voice Input */}
        <div style={styles.voiceContainer}>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              ...styles.voiceButton,
              backgroundColor: isListening ? "red" : "green",
            }}
          >
            {isListening ? "Stop Listening" : "Start Speaking"}
          </button>
        </div>
      </div>
    </div>
  );
};



const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "2rem",
    width: "90%",
    maxWidth: "1200px",
    margin: "0 auto",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  },
  scrollingText: {
    fontSize: "clamp(1.5rem, 2.5vw, 2.5rem)",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "2rem 0",
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chatContainer: {
    width: "100%",
    maxWidth: "800px",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
    overflow: "hidden",
    marginBottom: "2rem",
  },
  chatBox: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto",
    maxHeight: "60vh",
    minHeight: "300px",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "#007bff",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "15px 15px 0 15px",
    margin: "0.8rem 0",
    maxWidth: "85%",
    width: "fit-content",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  aiMessage: {
    alignSelf: "flex-start",
    background: "#28a745",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "15px 15px 15px 0",
    margin: "0.8rem 0",
    maxWidth: "85%",
    width: "fit-content",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  messageText: {
    margin: 0,
    fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  loadingText: {
    fontStyle: "italic",
    color: "#6c757d",
    textAlign: "center",
    padding: "1rem",
    fontSize: "0.9rem",
  },
  inputContainer: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    background: "#f8f9fa",
    borderTop: "1px solid #e9ecef",
  },
  input: {
    flex: 1,
    padding: "0.8rem 1.2rem",
    fontSize: "1rem",
    border: "1px solid #dee2e6",
    borderRadius: "25px",
    outline: "none",
    transition: "all 0.3s ease",
    "&:focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 3px rgba(0, 123, 255, 0.25)",
    },
  },
  sendButton: {
    padding: "0.8rem 1.5rem",
    fontSize: "1rem",
    color: "#fff",
    background: "#17a2b8",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "#138496",
    },
    "&:disabled": {
      background: "#6c757d",
      cursor: "not-allowed",
    },
  },
  voiceContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "1rem",
    background: "#f8f9fa",
  },
  voiceButton: {
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoutButton: {
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "1rem",
    marginBottom: "1rem",
    "&:hover": {
      backgroundColor: "#c82333",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
    "&:active": {
      transform: "translateY(0)",
      boxShadow: "none",
    },
  },

  buttonContainer: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    margin: "0rem 0 1rem 0",
  },

  userButton: {
    padding: "0.8rem 1.5rem",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#6f42c1",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.3s ease",
    display: "inline-block",
    "&:hover": {
      backgroundColor: "#5a3d9b",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
    "&:active": {
      transform: "translateY(0)",
      boxShadow: "none",
    },
  },

  "@media (max-width: 768px)": {
    buttonContainer: {
      flexDirection: "column",
      gap: "0.8rem",
      margin: "1.5rem 0",
    },
    userButton: {
      width: "100%",
      textAlign: "center",
    },
  },

  "@media (max-width: 480px)": {
    userButton: {
      padding: "0.6rem 1rem",
      fontSize: "0.9rem",
    },
  },

  "@media (max-width: 768px)": {
    logoutButton: {
      width: "100%",
      marginTop: "1.5rem",
    },
  },

  "@media (max-width: 480px)": {
    logoutButton: {
      padding: "0.6rem 1rem",
      fontSize: "0.9rem",
    },
  },

  "@media (max-width: 768px)": {
    container: {
      width: "95%",
      padding: "1rem",
    },
    chatContainer: {
      borderRadius: "15px",
    },
    userMessage: {
      maxWidth: "90%",
    },
    aiMessage: {
      maxWidth: "90%",
    },
    inputContainer: {
      flexDirection: "column",
    },
    sendButton: {
      width: "100%",
    },
    voiceButton: {
      width: "100%",
      justifyContent: "center",
    },
  },
  "@media (max-width: 480px)": {
    scrollingText: {
      fontSize: "1.2rem",
      padding: "0.8rem",
    },
    messageText: {
      fontSize: "0.9rem",
    },
    input: {
      padding: "0.6rem 1rem",
    },
  },
};


export default App;