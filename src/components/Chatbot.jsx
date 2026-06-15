import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../config/api';
import './Chatbot.css';

const INITIAL_MESSAGE = { type: 'bot', text: "Hi! I'm your shopping assistant. Ask me about phones, recommend products under budget, or help you find the best deals!" };

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const resetChat = () => {
        setMessages([INITIAL_MESSAGE]);
        setInput('');
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const response = await apiClient.post('/api/chatbot/chat', {
                message: userMessage
            });

            let { answer } = response.data;
            answer = answer.replace(/\[VIEW_PRODUCT:\d+\]/g, "");
            answer = answer.replace(/<[^>]*>?/gm, "");
            setMessages(prev => [...prev, { type: 'bot', text: answer }]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: "Sorry, I'm having trouble answering right now. Please try again!" 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestedQuestions = [
        'Best phones under 20000',
        'Samsung phones under 30000',
        'Best camera phones',
        'OnePlus phones under 50000'
    ];

    return createPortal(
        <div className="chatbot-wrapper" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 999999, pointerEvents: 'none' }}>
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} style={{ pointerEvents: 'auto' }}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="chatbot-container" style={{ pointerEvents: 'auto' }}>
                    <div className="chatbot-header">
                        <h3>🛒 Shop Assistant</h3>
                        <div className="chatbot-header-actions">
                            <button className="chatbot-reset" onClick={resetChat} title="Reset chat">↺</button>
                            <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
                        </div>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                <span className="message-text">{msg.text}</span>
                            </div>
                        ))}

                        {loading && (
                            <div className="message bot">
                                <span className="message-text typing">Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {!messages.some(m => m.type === 'user') && (
                        <div className="suggested-questions">
                            {suggestedQuestions.map((q, i) => (
                                <button 
                                    key={i} 
                                    className="suggested-btn"
                                    onClick={() => {
                                        setInput(q);
                                        setMessages(prev => [...prev, { type: 'user', text: q }]);
                                        apiClient.post('/api/chatbot/chat', { message: q })
                                            .then(response => {
                                                let answer = response.data.answer;
                                                answer = answer.replace(/\[VIEW_PRODUCT:\d+\]/g, "");
                                                answer = answer.replace(/<[^>]*>?/gm, "");
                                                setMessages(prev => [...prev, { type: 'bot', text: answer }]);
                                            })
                                            .catch(error => {
                                                console.error('Chat error:', error);
                                                setMessages(prev => [...prev, { 
                                                    type: 'bot', 
                                                    text: "Sorry, I'm having trouble answering right now. Please try again!" 
                                                }]);
                                            });
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about products..."
                            disabled={loading}
                        />
                        <button onClick={sendMessage} disabled={loading || !input.trim()}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};

export default Chatbot;