import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import './AIAssistant.css';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am Nivas. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/ai/chat', { prompt: userMsg });
      if (res.data.success && res.data.data?.result) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.data.result }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I could not process your request. Please try again.' }]);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      const errorMsg = err.response?.data?.message || 'Error connecting to AI service. Please check if the server is running.';
      setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-widget-container">
      {isOpen && (
        <div className="ai-chat-window glass-card animate-fade-in">
          <div className="ai-header">
            <div className="ai-title">
              <Sparkles size={20} style={{ color: '#818cf8' }} />
              <span>Nivas Assistant</span>
            </div>
            <button className="icon-btn" onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
          
          <div className="ai-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`ai-message ${m.sender}`}>
                <p>{m.text}</p>
              </div>
            ))}
            {loading && (
              <div className="ai-message ai">
                <p className="typing-indicator">Thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="ai-input-form">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask anything..." 
              className="ai-input"
              autoFocus
            />
            <button type="submit" className="ai-send-btn" disabled={!input.trim() || loading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="ai-floating-btn shadow-glow" onClick={() => setIsOpen(true)}>
          <Bot size={28} />
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
