import React, { useState, useRef, useEffect } from 'react';
import { Box, TextInput, Button, ScrollArea, Text, Paper, Stack } from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { SpeechInput } from './SpeechInput';
import '../stylesheets/conversationdisplay.css';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatResponse {
    content?: string;
    error?: string;
}

const ConversationDisplay: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('INPUT VALUE');
    const [isLoading, setIsLoading] = useState(false);
    const viewport = useRef<HTMLDivElement>(null);
    const fetcher = useFetcher<ChatResponse>();

    const scrollToBottom = () => {
        if (viewport.current) {
            viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.error) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: `Error: ${fetcher.data?.error}`,
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            } else if (fetcher.data.content) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: fetcher.data?.content || '',
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            }
            setIsLoading(false);
            scrollToBottom();
        }
    }, [fetcher.data]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setIsLoading(true);

        const formattedMessages = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        const formData = new FormData();
        formData.append('messages', JSON.stringify([...formattedMessages, { role: 'user', content: text }]));

        fetcher.submit(formData, { method: 'POST', action: '/chat' });
    };

    const handleSpeechTranscript = (text: string) => {
        setInputValue(text);
    };

    return (
        <Box className="conversation-display">
            <Text>test</Text>
            <TextInput
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(inputValue);
                            }
                        }}
                    />

            <Box className="input-container">
                <SpeechInput onTranscript={handleSpeechTranscript} />
                <Box className="text-input-container">
                    <TextInput
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(inputValue);
                            }
                        }}
                    />
                    <Button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        Send CHATE
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ConversationDisplay;
