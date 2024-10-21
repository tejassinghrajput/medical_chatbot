import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Bot, Plus, History, ArrowLeft } from 'lucide-react';
import ChatBot from './components/ChatBot';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatSession {
  id: number;
  messages: Message[];
}

function App() {
  const [input, setInput] = useState('');
  const [currentSession, setCurrentSession] = useState<ChatSession>({ id: Date.now(), messages: [] });
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [currentSession.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setCurrentSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    setInput('');
    setIsTyping(true);

    const result = await ChatBot.getMedicalAdvice(input);
    setIsTyping(false);

    const botMessage: Message = { id: Date.now() + 1, text: result, sender: 'bot' };
    setCurrentSession(prev => ({
      ...prev,
      messages: [...prev.messages, botMessage]
    }));
  };

  const startNewChat = () => {
    if (currentSession.messages.length > 0) {
      setChatHistory(prev => [...prev, currentSession]);
    }
    setCurrentSession({ id: Date.now(), messages: [] });
  };

  const loadChatSession = (session: ChatSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-3xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">Medical Chat Bot</h1>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewChat}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
            >
              <Plus size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 transition-colors"
            >
              <History size={24} />
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-4 h-96 overflow-y-auto bg-gray-50 rounded-lg p-4"
            >
              <h2 className="text-xl font-semibold mb-4 text-indigo-600">Chat History</h2>
              {chatHistory.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-3 rounded-lg shadow mb-2 cursor-pointer hover:bg-indigo-50 transition-colors"
                  onClick={() => loadChatSession(session)}
                >
                  <p className="font-medium text-gray-800">Chat {new Date(session.id).toLocaleString()}</p>
                  <p className="text-sm text-gray-500 truncate">{session.messages[0]?.text}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="mb-4 h-96 overflow-y-auto bg-gray-50 rounded-lg p-4"
            >
              <AnimatePresence>
                {currentSession.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex items-start ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`rounded-full p-2 ${message.sender === 'user' ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                        {message.sender === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-gray-700" />}
                      </div>
                      <div className={`max-w-xs mx-2 p-3 rounded-lg ${message.sender === 'user' ? 'bg-indigo-100 text-indigo-900' : 'bg-white text-gray-800'} shadow`}>
                        {message.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-gray-200 p-3 rounded-lg shadow">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center border-2 border-indigo-200 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition-all duration-300">
            <MessageCircle className="text-indigo-400 ml-3" size={20} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your medical concern..."
              className="flex-grow p-3 outline-none"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-500 text-white p-3 hover:bg-indigo-600 transition-colors"
            >
              <Send size={20} />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default App;
