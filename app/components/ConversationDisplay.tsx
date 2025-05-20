import React, { useState } from 'react';
import '../stylesheets/conversationdisplay.css';

enum MessageOrigin {
  INTERVIEWER = "interviewer",
  USER = "user"
}

interface Message {
  origin: MessageOrigin;
  content: string;
}

const ConversationDisplay: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setMessages(prev => [...prev, { origin: MessageOrigin.USER, content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { origin: MessageOrigin.INTERVIEWER, content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        origin: MessageOrigin.INTERVIEWER, 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="conversation-display">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.origin}`}
          >
            <div className="message-origin">{message.origin}</div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ConversationDisplay;
