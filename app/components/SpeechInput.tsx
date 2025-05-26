import { useState, useEffect, useRef } from 'react';
import { Button, Text, Group } from '@mantine/core';
import { IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';

interface SpeechInputProps {
    onTranscript: (text: string) => void;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export function SpeechInput({ onTranscript }: SpeechInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = finalTranscriptRef.current;

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                finalTranscriptRef.current = finalTranscript;
                const fullTranscript = finalTranscript + interimTranscript;
                setTranscript(fullTranscript);
                onTranscript(fullTranscript);
            };

            recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    // Restart recognition if no speech is detected
                    recognitionRef.current?.start();
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    // Restart recognition if we're still supposed to be listening
                    recognitionRef.current?.start();
                }
            };
        } else {
            setIsSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onTranscript, isListening]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            console.error('Speech recognition not supported');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            finalTranscriptRef.current = ''; // Reset the final transcript
        } else {
            finalTranscriptRef.current = ''; // Reset the final transcript
            setTranscript(''); // Clear the current transcript
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    if (!isSupported) {
        return (
            <div className="speech-input-container">
                <Text size="sm" c="dimmed">Speech recognition is not supported in your browser.</Text>
            </div>
        );
    }

    return (
        <div className="speech-input-container">
            <Group align="center" gap="xs">
                <Button
                    onClick={toggleListening}
                    className={isListening ? 'recording' : ''}
                    leftSection={isListening ? <IconMicrophoneOff size={16} /> : <IconMicrophone size={16} />}
                >
                    {isListening ? 'Stop Recording' : 'Click to Speak'}
                </Button>
                {!isListening && !transcript && (
                    <Text size="sm" className="status">
                        Click the microphone button to start speaking
                    </Text>
                )}
                {isListening && (
                    <Text size="sm" c="blue" className="status">
                        Listening... Speak now
                    </Text>
                )}
            </Group>
            {transcript && (
                <div className="transcript">
                    <Text size="sm">{transcript}</Text>
                </div>
            )}
        </div>
    );
} 