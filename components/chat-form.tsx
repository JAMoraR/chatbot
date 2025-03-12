'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSession, signOut } from 'next-auth/react';
import { AppointmentsView } from './views/appointments';
import { VRView } from './views/vr';
import { GamesView } from './views/games';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  weekStart: Date;
  messages: Message[];
}

export function ChatForm() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [activeComponent, setActiveComponent] = useState<'chat' | 'appointments' | 'vr' | 'games'>('chat');

  useEffect(() => {
    fetchSessions();
  }, [session]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      
      // Validate data structure
      if (Array.isArray(data) && data.every(session => 
        session.id && 
        typeof session.title === 'string' && 
        session.weekStart && 
        Array.isArray(session.messages)
      )) {
        setSessions(data);
        if (data.length > 0) {
          setCurrentSession(data[0]);
        }
      } else {
        throw new Error('Invalid sessions data format');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: 'Nuevo Chat',
        weekStart: new Date(),
        messages: []
      };
      setSessions([newSession]);
      setCurrentSession(newSession);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let activeSession = currentSession;
    if (!activeSession) {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: 'Nuevo Chat',
        weekStart: new Date(),
        messages: []
      };
      activeSession = newSession;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
    }

    const newMessage: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    const updatedMessages = [...(activeSession.messages || []), newMessage];
    setCurrentSession(prev => prev ? { ...prev, messages: updatedMessages } : null);
    setInput('');
    setIsLoading(true);

    // Update title if it's a new chat
    if (activeSession.title === 'Nuevo Chat' && activeSession.messages.length === 0) {
      const titleText = input.split(' ').slice(0, 3).join(' ');
      const finalTitle = titleText.length > 30 ? titleText.substring(0, 30) + '...' : titleText;
      handleTitleEdit(finalTitle);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: activeSession.id,
          messages: updatedMessages 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to get response');
      }

      if (data.response && activeSession) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          content: data.response.content,
        };
        const updatedSession: ChatSession = {
          ...activeSession,
          messages: [...updatedMessages, assistantMessage],
        };
        setCurrentSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      }
    } catch (error: any) {
      console.error('Chat Error:', error);
      setCurrentSession((prev: ChatSession | null): ChatSession | null => {
        if (!prev) return null;
        const updatedSession = {
          ...prev,
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Algo falló. Intente más tarde.',
          }],
        };
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession as ChatSession : s));
        return updatedSession as ChatSession;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleEdit = async (newTitle: string) => {
    if (!currentSession) {
      setEditingTitle(false);
      return;
    }

    try {
      const response = await fetch(`/api/chats/${currentSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle,
          messages: currentSession.messages 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update chat title');
      }
  
      const data = await response.json();
      const updatedSession = { ...currentSession, title: data.title };
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
    } catch (error) {
      console.error('Error updating chat title:', error);
    } finally {
      setEditingTitle(false);
    }
  };

  // Add this import at the top
// Moving import to top level

  // Add these functions inside the ChatForm component
  const handleDeleteChat = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chats/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(sessions[1] || null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'appointments':
        return <AppointmentsView />;
      case 'vr':
        return <VRView />;
      case 'games':
        return <GamesView />;
      default:
        return null;
    }
  };

  const handleChatTitleClick = () => {
    setActiveComponent('chat');
  };
  
  const handleMenuClick = (component: 'chat' | 'appointments' | 'vr' | 'games') => {
  setActiveComponent(component);
  setShowMenu(false);
  };

  

  // Update the sidebar section
  return (
    <>
      <div className="flex h-screen" style={{ background: '#212121' }}>
        {/* Sidebar */}
        <div className="w-[260px] border-r border-opacity-20 border-gray-700" style={{ background: '#171717' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 
                className="text-lg font-semibold cursor-pointer" 
                style={{ color: '#ECECEC' }} 
                onClick={handleChatTitleClick}
              >
                Chats
              </h2>
              <button
                onClick={() => {
                  const newSession: ChatSession = {
                    id: crypto.randomUUID(),
                    title: 'Nuevo Chat',
                    weekStart: new Date(),
                    messages: []
                  };
                  setSessions(prev => [newSession, ...prev]);
                  setCurrentSession(newSession);
                  setActiveComponent('chat');
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                style={{ color: '#BDBDBD' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center group"
                >
                  <button
                    onClick={() => setCurrentSession(session)}
                    className={`flex-1 text-left p-3 rounded-lg transition-all duration-200 hover:translate-x-1`}
                    style={{ 
                      background: currentSession?.id === session.id ? 'rgba(48, 48, 48, 0.8)' : 'transparent',
                      color: '#BDBDBD',
                      boxShadow: currentSession?.id === session.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span style={{ color: currentSession?.id === session.id ? '#ECECEC' : '#B4B4B4' }}>{session.title}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteChat(session.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-700/50 rounded-lg transition-all"
                    style={{ color: '#BDBDBD' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-gray-700/50">
            <button
              onClick={() => signOut()}
              className="w-full p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              style={{ color: '#BDBDBD' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col" style={{ background: '#212121' }}>
          {/* Chat Title */}
          {currentSession && (
            <div className="p-3 border-b border-opacity-20 border-gray-700 flex justify-between items-center">
              <div className="max-w-[48rem] mx-auto flex-1">
                {editingTitle ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={() => handleTitleEdit(titleInput)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTitleEdit(titleInput);
                        } else if (e.key === 'Escape') {
                          setEditingTitle(false);
                          setTitleInput(currentSession.title);
                        }
                      }}
                      className="text-lg font-medium bg-transparent border-none focus:outline-none w-full"
                      style={{ color: '#ECECEC' }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <h1
                    className="text-lg font-medium cursor-pointer hover:opacity-80"
                    style={{ color: '#ECECEC' }}
                    onClick={() => {
                      setTitleInput(currentSession.title);
                      setEditingTitle(true);
                    }}
                  >
                    {currentSession.title}
                  </h1>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                  style={{ color: '#BDBDBD' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/>
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#303030] ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => handleMenuClick('chat')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                        style={{ color: '#ECECEC' }}
                        role="menuitem"
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => handleMenuClick('appointments')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                        style={{ color: '#ECECEC' }}
                        role="menuitem"
                      >
                        Agendar Cita
                      </button>
                      <button
                        onClick={() => handleMenuClick('vr')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                        style={{ color: '#ECECEC' }}
                        role="menuitem"
                      >
                        VR
                      </button>
                      <button
                        onClick={() => handleMenuClick('games')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                        style={{ color: '#ECECEC' }}
                        role="menuitem"
                      >
                        Juegos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Area */}
          {activeComponent === 'chat' ? (
            <div className="flex-1 overflow-y-auto">
              {currentSession?.messages && currentSession.messages.length > 0 ? (
                <div className="flex-1 flex flex-col">
                  {currentSession.messages.map((message, index) => (
                    <div 
                      key={index} 
                      className="w-full"
                      style={{ 
                        background: message.role === 'user' ? '#303030' : 'transparent',
                      }}
                    >
                      <div className="max-w-[48rem] mx-auto p-4 md:p-6">
                        <div className="flex gap-4 items-start">
                          <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0">
                            {message.role === 'assistant' ? (
                              <div className="bg-teal-600 w-full h-full flex items-center justify-center rounded-sm text-xs font-medium text-white">
                                AI
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center rounded-sm text-xs font-medium"
                                     style={{ background: '#5C5C5C', color: 'white' }}>
                                U
                              </div>
                            )}
                          </div>
                          <div className="flex-1 leading-6" style={{ color: 'white' }}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1"></div>
              )}
              {isLoading && (
                <div style={{ background: 'transparent' }}>
                  <div className="max-w-[48rem] mx-auto p-4 md:p-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0">
                        <div className="bg-teal-600 w-full h-full flex items-center justify-center rounded-sm text-xs font-medium text-white">
                          AI
                        </div>
                      </div>
                      <div style={{ color: 'white' }} className="flex-1">
                        <div className="animate-pulse">Pensando...</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderActiveComponent()
          )}

          {/* Input Area */}
          <div className="px-4 pb-4">
            <div className="max-w-[48rem] mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col gap-2 p-2 w-full bg-[#303030] rounded-xl shadow-lg border border-gray-700/50">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pregunta lo que quieras"
                    style={{ color: '#ECECEC' }}
                    className="w-full bg-transparent p-2 focus:outline-none text-sm min-h-[20px]"
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-3 px-2">
                    <button
                      type="button"
                      onClick={() => handleMenuClick('appointments')}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-sm"
                      style={{ color: '#BDBDBD' }}
                    >
                      Agendar Cita
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMenuClick('vr')}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-sm"
                      style={{ color: '#BDBDBD' }}
                    >
                      VR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMenuClick('games')}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-sm"
                      style={{ color: '#BDBDBD' }}
                    >
                      Juegos
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatForm;