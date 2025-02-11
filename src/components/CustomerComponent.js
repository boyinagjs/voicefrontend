import React, { useEffect, useState } from "react";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './CustomerComponent.css';

const CustomerComponent = () => {
  const [faqData, setFaqData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    // WebSocket connection setup
    const ws = new WebSocket('wss://voicebackend-1dix.onrender.com');

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const response = await axios.get('https://voicebackend-1dix.onrender.com/getFaqs');
        if (response.data?.response?.[0]) {
          setFaqData(response.data.response[0]);
        }
      } catch (error) {
        console.error("Initial fetch error:", error);
        setConnectionStatus('Connection error - using cached data');
      }
    };

    // WebSocket event handlers
    ws.onopen = () => {
      setConnectionStatus('Connected');
      fetchInitialData();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'FAQ_UPDATE') {
          setFaqData(message.data);
          setConnectionStatus('Connected');
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus('Connection error');
    };

    ws.onclose = () => {
      setConnectionStatus('Disconnected - attempting to reconnect...');
    };

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="customer-component">
      <div className="connection-status">
        Status: {connectionStatus}
      </div>

      <h2 className="title">FAQs</h2>

      <div className="faq-container">
        <h3 className="question-title">Current Question:</h3>
        <div className="faq-box question-box">
          {faqData?.question ? (
            <ReactMarkdown>{faqData.question}</ReactMarkdown>
          ) : (
            <div className="loading-placeholder">
              {connectionStatus.includes('Connected')
                ? "No question available"
                : "Loading question..."}
            </div>
          )}
        </div>
      </div>

      <div className="faq-container">
        <h3 className="answer-title">AI Answer:</h3>
        <div className="faq-box answer-box">
          {faqData?.answer ? (
            <ReactMarkdown>{faqData.answer}</ReactMarkdown>
          ) : (
            <div className="loading-placeholder">
              {connectionStatus.includes('Connected')
                ? "No answer available"
                : "Waiting for response..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerComponent;