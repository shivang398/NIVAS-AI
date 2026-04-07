import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, User as UserIcon, X, MessageSquare } from 'lucide-react';

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
    <div className="chat-tab glass-card animate-fade-in" style={{ display: 'flex', height: '650px', overflow: 'hidden', padding: 0, border: '1px solid var(--border-glass)' }}>
      {/* Sidebar: Active Conversations */}
      <div className="chat-sidebar" style={{ 
        width: '320px', 
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Negotiations</h3>
          <p className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Active property discussions</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
              <MessageSquare size={32} style={{ margin: '0 auto 1rem' }} />
              <p className="text-sm">No active negotiations.</p>
            </div>
          )}
          {chats.map(c => (
            <div 
              key={c.id} 
              onClick={() => handleSelectChat(c.offerId)}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer', 
                background: activeChat?.offerId === c.offerId ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                borderLeft: activeChat?.offerId === c.offerId ? '4px solid var(--accent-primary)' : '4px solid transparent',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
              onMouseEnter={(e) => !activeChat || activeChat.offerId !== c.offerId ? e.currentTarget.style.background = 'rgba(255,255,255,0.02)' : null}
              onMouseLeave={(e) => !activeChat || activeChat.offerId !== c.offerId ? e.currentTarget.style.background = 'transparent' : null}
            >
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', 
                background: 'var(--accent-gradient)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'white'
              }}>
                {c.offer?.property?.title?.charAt(0) || '#'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {c.offer?.property?.title || `Offer #${c.offerId.substring(0, 6)}`}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                   <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Ref: {c.offerId.substring(0, 6)}</span>
                   <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>₹{c.offer?.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
        {activeChat ? (
          <>
            <div className="chat-header" style={{ 
              padding: '1.25rem 1.5rem', 
              borderBottom: '1px solid rgba(255,255,255,0.05)', 
              background: 'rgba(0,0,0,0.2)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{activeChat.offer?.property?.title || 'Unknown Property'}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
                    <span className={`status-badge ${activeChat.offer?.status?.toLowerCase()}`} style={{ 
                      fontSize: '0.7rem', padding: '0.25rem 0.6rem', letterSpacing: '0.05em' 
                    }}>
                      {activeChat.offer?.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.2 }}>|</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>₹{activeChat.offer?.price}/mo</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {activeChat.offer?.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
                    <button onClick={promptNewPrice} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '10px' }}>Negotiate Price</button>
                    {(user?.role === 'owner' || user?.role === 'OWNER') && (
                      <>
                        <button onClick={() => handleUpdateOffer('ACCEPTED')} className="btn-primary" style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '0.5rem 1.25rem', fontSize: '0.8rem', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '10px' }}>Accept Offer</button>
                        <button onClick={() => handleUpdateOffer('REJECTED')} className="btn-secondary" style={{ borderColor: 'rgba(248, 113, 113, 0.3)', color: '#f87171', padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '10px' }}>Reject</button>
                      </>
                    )}
                  </div>
                )}
                <button onClick={() => setActiveChat(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.6rem', borderRadius: '10px' }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="chat-messages" style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.25rem',
              backgroundImage: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.03) 0%, transparent 100%)'
            }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
                  <p>Initialize communication for this proposal.</p>
                </div>
              )}
              {messages.map(m => {
                const isMe = m.senderId === user.id;
                return (
                  <div key={m.id} style={{ 
                    alignSelf: isMe ? 'flex-end' : 'flex-start', 
                    maxWidth: '80%', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    gap: '0.35rem'
                  }}>
                    <div style={{ 
                      background: isMe ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)', 
                      padding: '0.85rem 1.25rem', 
                      borderRadius: '18px', 
                      borderBottomRightRadius: isMe ? 2 : '18px',
                      borderBottomLeftRadius: !isMe ? 2 : '18px',
                      boxShadow: isMe ? '0 4px 15px rgba(99, 102, 241, 0.2)' : 'none',
                      color: 'white',
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>
                      {m.text}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Submit your proposal or message..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
                style={{ flex: 1, margin: 0, borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button type="submit" className="btn-primary" style={{ width: '48px', height: '48px', padding: 0, borderRadius: '12px' }} disabled={!input.trim()}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', opacity: 0.5 }}>
            <MessageSquare size={64} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
            <p style={{ fontSize: '1.1rem' }}>Select a negotiation to view communication logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTab;
