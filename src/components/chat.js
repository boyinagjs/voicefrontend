// src/Chat.js
import React, { useState } from 'react';
import axios from 'axios';
import './chat.css'; // Import the CSS file for styling

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const newMessages = [
        ...messages,
        { role: "user", content: input },
    ];

    try {
        const apiKey = "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";
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4o-mini", // or 'gpt-4' if you have access
        messages: newMessages,
      }, {
        headers: {
            Authorization: `Bearer ${apiKey}`, // Replace with your OpenAI API key
          'Content-Type': 'application/json',
        },
      });

      const botMessage = { text: response.data.choices[0].message.content, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching data from OpenAI:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <strong>{msg.sender === 'user' ? 'You' : 'ChatGPT'}:</strong> {msg.text}
          </div>
        ))}
        {loading && <div className="loading">ChatGPT is typing...</div>}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message ChatGPT"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;