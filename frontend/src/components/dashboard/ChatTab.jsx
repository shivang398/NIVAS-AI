import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, User as UserIcon, X } from 'lucide-react';

const ChatTab = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await axios.get('/chat');
      if (res.data.success) {
        setChats(res.data.data);
        if (res.data.data.length > 0) handleSelectChat(res.data.data[0].offerId);
      }
    } catch (err) {
      console.error("Failed fetching chats", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (offerId) => {
    try {
      const res = await axios.get(`/chat/${offerId}`);
      if (res.data.success) {
        setActiveChat(res.data.data);
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    try {
      const res = await axios.post(`/chat/${activeChat.offerId}`, { text: input });
      if (res.data.success) {
        setMessages([...messages, res.data.data]);
        setInput('');
      }
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  const handleUpdateOffer = async (newStatus, newPrice = undefined) => {
    try {
      const res = await axios.patch(`/offers/${activeChat.offerId}`, { status: newStatus, price: newPrice });
      if (res.data.success) {
        setActiveChat(prev => ({
          ...prev,
          offer: {
            ...prev.offer,
            status: newStatus || prev.offer.status,
            price: newPrice !== undefined ? newPrice : prev.offer.price
          }
        }));
        if (newStatus) alert(`Offer marked as ${newStatus}`);
      }
    } catch (err) {
      alert("Failed to update offer. You may be unauthorized.");
    }
  };

  const promptNewPrice = () => {
    const p = prompt("Enter your new rent proposal:", activeChat.offer?.price);
    if(p && !isNaN(Number(p))) {
      handleUpdateOffer(undefined, Number(p));
    }
  };

  if (loading) return <div className="text-secondary p-4">Loading active negotiations...</div>;

  return (
    <div className="chat-tab glass-card" style={{ display: 'flex', height: '600px', overflow: 'hidden' }}>
      <div className="chat-sidebar" style={{ width: '250px', borderRight: '1px solid var(--border-glass)', overflowY: 'auto' }}>
        <h3 style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)' }}>Negotiations</h3>
        {chats.length === 0 && <p className="text-secondary text-sm" style={{ padding: '1rem' }}>No active chats.</p>}
        {chats.map(c => (
          <div 
            key={c.id} 
            onClick={() => handleSelectChat(c.offerId)}
            style={{ 
              padding: '1rem', 
              cursor: 'pointer', 
              background: activeChat?.id === c.id ? 'var(--bg-glass-hover)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <p className="font-medium">Offer #{c.offerId.substring(0, 6)}</p>
          </div>
        ))}
      </div>

      <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeChat ? (
          <>
            <div className="chat-header" style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>Chat for Offer: {activeChat.offer?.property?.title || 'Unknown Property'}</h4>
                <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem'}}>
                  Current Proposal: <strong className="text-secondary text-gradient">₹{activeChat.offer?.price}</strong> | Status: <span className={`status-badge ${activeChat.offer?.status?.toLowerCase()}`}>{activeChat.offer?.status}</span>
                </p>
              </div>
              
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                {activeChat.offer?.status === 'PENDING' && (
                  <>
                    <button onClick={promptNewPrice} className="btn-secondary small" style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}>Propose Price</button>
                    {(user?.role === 'owner' || user?.role === 'OWNER') && (
                      <>
                        <button onClick={() => handleUpdateOffer('ACCEPTED')} className="btn-primary small" style={{background: '#4ade80', color: '#000', padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: 'none'}}>Accept</button>
                        <button onClick={() => handleUpdateOffer('REJECTED')} className="btn-secondary small" style={{borderColor: '#f87171', color: '#f87171', padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}>Reject</button>
                      </>
                    )}
                  </>
                )}
                <button onClick={() => setActiveChat(null)} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '0.5rem', padding: '0.25rem'}} title="Close Chat">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 && <p className="text-secondary text-center">Start the conversation...</p>}
              {messages.map(m => {
                const isMe = m.senderId === user.id;
                return (
                  <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', background: isMe ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: isMe ? 0 : '12px', borderBottomLeftRadius: !isMe ? 0 : '12px' }}>
                    <p style={{ fontSize: '0.95rem' }}>{m.text}</p>
                    <span style={{ fontSize: '0.7rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Type a message..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }} disabled={!input.trim()}>
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select a chat to view messages.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTab;
