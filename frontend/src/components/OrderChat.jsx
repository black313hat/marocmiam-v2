import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { Send, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function OrderChat({ orderId, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    try {
      const res = await API.get(`/orders/${orderId}/chat/`);
      setMessages(res.data);
    } catch { }
    setLoading(false);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await API.post(`/orders/${orderId}/chat/`, { message: newMessage });
      setNewMessage('');
      await loadMessages();
    } catch { }
    setSending(false);
  }

  const QUICK_REPLIES = [
    'Je suis en route 🛵',
    'Je serai là dans 5 min ⏱️',
    'Où êtes-vous exactement? 📍',
    'Merci! ☺️',
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
        style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', height: '70vh', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FFF3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={18} color="#FF6B00" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>Chat livraison</p>
              <p style={{ fontSize: '11px', color: '#AAA' }}>Commande #{orderId}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#888" />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#AAA', fontSize: '13px', marginTop: '40px' }}>Chargement...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>Aucun message</p>
              <p style={{ fontSize: '12px', color: '#AAA' }}>Envoyez un message à votre livreur</p>
            </div>
          ) : messages.map((msg, i) => {
            const isMe = msg.sender === user?.username;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? 'linear-gradient(135deg, #FF6B00, #FF9A3C)' : '#F5F5F5',
                  color: isMe ? '#fff' : '#111',
                }}>
                  {!isMe && <p style={{ fontSize: '10px', fontWeight: '700', color: '#FF6B00', marginBottom: '4px' }}>{msg.sender}</p>}
                  <p style={{ fontSize: '13px', fontWeight: '500', lineHeight: 1.4 }}>{msg.message}</p>
                  <p style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {QUICK_REPLIES.map(r => (
            <button key={r} onClick={() => setNewMessage(r)} style={{
              padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
              background: '#F5F5F5', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              color: '#666', fontFamily: 'inherit', flexShrink: 0,
            }}>
              {r}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: '8px' }}>
          <input
            placeholder="Envoyer un message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            style={{ flex: 1, padding: '11px 14px', borderRadius: '22px', border: '1.5px solid #E8E8E8', fontSize: '14px', background: '#F8F8F8', outline: 'none', fontFamily: 'inherit' }}
          />
          <button onClick={sendMessage} disabled={sending || !newMessage.trim()} style={{
            width: '44px', height: '44px', borderRadius: '50%', border: 'none',
            background: newMessage.trim() ? 'linear-gradient(135deg, #FF6B00, #FF9A3C)' : '#F0F0F0',
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: newMessage.trim() ? '0 4px 12px rgba(255,107,0,0.3)' : 'none',
          }}>
            <Send size={16} color={newMessage.trim() ? '#fff' : '#BBB'} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
