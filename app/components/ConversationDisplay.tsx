import React, { useEffect, useRef, useState } from 'react';
import '../stylesheets/conversationdisplay.css';

// Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

enum MessageOrigin {
  ASSISTANT = "assistant",
  USER = "user",
  SYSTEM = "system"
}

interface Message {
  origin: MessageOrigin;
  content: string;
}

interface ConversationDisplayProps {
  userCode: string;
  questionDescription: string;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ userCode, questionDescription }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isClient, setIsClient] = useState(true);
  
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (!isClient) return;

    console.log('Setting up speech recognition...');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          console.log('Final transcript received:', result[0].transcript);
          setNewMessage((prev) => {
            const newValue = prev + result[0].transcript + ' ';
            console.log('New message value:', newValue);
            // Clear any existing timeout
            if (autoSendTimeoutRef.current) {
              console.log('Clearing existing timeout');
              clearTimeout(autoSendTimeoutRef.current);
            }
            // Set new timeout for auto-send
            console.log('Setting new timeout for auto-send');
            autoSendTimeoutRef.current = setTimeout(() => {
              console.log('Timeout triggered, current message:', newValue);
              // Create a copy of the current messages
              const currentMessages = [...messages];
              // Send the message
              const userMessage = newValue.trim();
              if (userMessage) {
                setNewMessage('');
                setMessages(prev => [...prev, { origin: MessageOrigin.USER, content: userMessage }]);
                setIsLoading(true);

                console.log(JSON.stringify({ 
                  messages: [...currentMessages, { origin: MessageOrigin.USER, content: userMessage }], 
                  userCode: userCode, 
                  questionDescription: questionDescription 
                }));

                fetch('/conversation', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    messages: [...currentMessages, { origin: MessageOrigin.USER, content: userMessage }], 
                    userCode: userCode, 
                    questionDescription: questionDescription 
                  }),
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Failed to get response');
                  }
                  return response.json();
                })
                .then(data => {
                  setMessages(prev => [...prev, { origin: MessageOrigin.ASSISTANT, content: data.response }]);
                  speak(data.response);
                })
                .catch(error => {
                  console.error('Error sending message:', error);
                  setMessages(prev => [...prev, {
                    origin: MessageOrigin.ASSISTANT,
                    content: 'Sorry, I encountered an error. Please try again.'
                  }]);
                })
                .finally(() => {
                  setIsLoading(false);
                });
              }
            }, 1500);
            return newValue;
          });
        } else {
          interimTranscript += result[0].transcript;
        }
      }
    };

    recognition.onend = () => {
      console.log(" got the end", new Date().toISOString())
      console.log('Recognition ended, isRecording:', isRecording);
    };

    // Add event listeners for start and error
    recognition.addEventListener('start', () => {
      console.log('Recognition started');
      setIsRecording(true);
    });

    recognition.addEventListener('error', (event: Event) => {
      console.error('Recognition error:', event);
      setIsRecording(false);
    });

    recognitionRef.current = recognition;

    // Only start recognition if isRecording is true
    if (isRecording) {
      console.log('Starting recognition because isRecording is true');
      recognition.start();
    }

    return () => {
      console.log('Cleanup: stopping recognition');
      recognition.stop();
    };
  }, [isRecording, messages, userCode, questionDescription, newMessage, isClient]);

  const toggleRecording = () => {
    console.log('Toggling recording, current state:', isRecording);
    if (recognitionRef.current) {
      try {
        if (isRecording) {
          recognitionRef.current.stop();
          console.log('Stopping recording');
          setIsRecording(false);
        } else {
          recognitionRef.current.start();
          console.log('Starting recording');
          setIsRecording(true);
        }
        console.log('Recording state toggled to:', !isRecording);
      } catch (error) {
        console.error('Error toggling recording:', error);
      }
    } else {
      console.error('Recognition ref is null');
    }
  };

  const startInterview = () => {
    console.log('Starting interview...');
    setIsInterviewStarted(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        console.log('Interview started, recording state set to:', true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else {
      console.error('Recognition ref is null');
    }
  };

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
        body: JSON.stringify({ 
          messages: [...messages, { origin: MessageOrigin.USER, content: userMessage }], 
          userCode: userCode, 
          questionDescription: questionDescription 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { origin: MessageOrigin.ASSISTANT, content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        origin: MessageOrigin.ASSISTANT,
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="conversation-display">
      {
        <div className="voice-recorder-container">
          <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            {!isInterviewStarted ? (
              <button 
                onClick={startInterview}
                style={{
                  padding: '10px 20px',
                  fontSize: '1.2rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Start Interview
              </button>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '10px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px'
                }}>
                  <label 
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '60px',
                      height: '34px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isRecording}
                      onChange={toggleRecording}
                      style={{
                        opacity: 0,
                        width: 0,
                        height: 0
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: isRecording ? '#4CAF50' : '#ccc',
                      transition: '.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '26px',
                        width: '26px',
                        left: '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%',
                        transform: isRecording ? 'translateX(26px)' : 'translateX(0)'
                      }}></span>
                    </span>
                  </label>
                  <span style={{ 
                    color: isRecording ? '#4CAF50' : '#666',
                    fontWeight: 'bold'
                  }}>
                    {isRecording ? 'Recording' : 'Not Recording'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      <div className="messages-container">
        {messages
          .filter(message => message.origin !== MessageOrigin.SYSTEM)
          .map((message, index) => (
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
          placeholder={isInterviewStarted ? "Type your message..." : "Click 'Start Interview' to begin..."}
          className="message-input"
          disabled={isLoading || !isInterviewStarted}
        />
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || !isInterviewStarted}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ConversationDisplay;
