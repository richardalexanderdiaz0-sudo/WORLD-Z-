import React, { useState, useEffect, useRef } from 'react';
import { getChatsForUser, getMessagesForChat, sendMessage, Chat, Message } from '../services/firebaseService';

// --- SVG ICONS ---
const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const SendIcon = () => (
    <svg className="w-6 h-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);


// --- CHAT SCREEN ---
interface ChatScreenProps {
    chatId: string;
    otherUserName: string;
    currentUser: { id: string };
    onBack: () => void;
}

const ChatScreen = ({ chatId, otherUserName, currentUser, onBack }: ChatScreenProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = getMessagesForChat(chatId, (fetchedMessages) => {
            setMessages(fetchedMessages);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser.id) return;
        await sendMessage(chatId, currentUser.id, newMessage);
        setNewMessage('');
    };

    return (
        <div className="h-full w-full flex flex-col bg-gray-900">
            {/* Header */}
            <header className="flex items-center p-4 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
                    <BackIcon />
                </button>
                <h2 className="text-xl font-bold ml-4">{otherUserName}</h2>
            </header>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full"><p className="text-gray-400">Cargando mensajes...</p></div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full"><p className="text-gray-500">Aún no hay mensajes. ¡Sé el primero!</p></div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-cyan-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-grow bg-gray-800 border border-gray-700 rounded-full py-3 px-5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button type="submit" className="p-3 bg-cyan-500 rounded-full text-white hover:bg-cyan-600 transition disabled:opacity-50" disabled={!newMessage.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- CHAT LIST SCREEN ---
interface ChatsListScreenProps {
    currentUser: { id: string };
    onSelectChat: (chatId: string, otherUserName: string) => void;
}

const ChatsListScreen = ({ currentUser, onSelectChat }: ChatsListScreenProps) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser.id) return;
        const unsubscribe = getChatsForUser(currentUser.id, (fetchedChats) => {
            setChats(fetchedChats);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser.id]);

    const getOtherParticipant = (chat: Chat) => {
        return chat.participantsInfo.find(p => p.userId !== currentUser.id);
    };

    return (
        <div className="flex-grow flex flex-col bg-gray-900">
            <header className="p-4 border-b border-gray-700">
                <h1 className="text-3xl font-bold text-pink-400">Chats</h1>
            </header>
            <div className="flex-grow overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-400">Cargando tus chats...</div>
                ) : chats.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No tienes conversaciones.</p>
                        <p className="text-sm mt-2">Inicia una conversación enviando un mensaje desde una publicación en el feed.</p>
                    </div>
                ) : (
                    <div>
                        {chats.map(chat => {
                            const otherUser = getOtherParticipant(chat);
                            if (!otherUser) return null;
                            const lastMessagePreview = chat.lastMessageSenderId === currentUser.id ? `Tú: ${chat.lastMessage}` : chat.lastMessage;

                            return (
                                <div key={chat.id} onClick={() => onSelectChat(chat.id, otherUser.username)}
                                    className="flex items-center p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition">
                                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0">
                                        {otherUser.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-semibold text-white truncate">{otherUser.username}</p>
                                        <p className="text-sm text-gray-400 truncate">{lastMessagePreview || 'Toca para chatear'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MAIN CHATS PAGE ---
interface ChatsPageProps {
    userData: { id?: string; };
    chatToOpen: { chatId: string; otherUserName: string } | null;
    onChatOpened: () => void;
}

const ChatsPage: React.FC<ChatsPageProps> = ({ userData, chatToOpen, onChatOpened }) => {
    const [activeChat, setActiveChat] = useState<{ chatId: string; otherUserName: string } | null>(null);

    useEffect(() => {
        if (chatToOpen) {
            setActiveChat(chatToOpen);
            onChatOpened();
        }
    }, [chatToOpen, onChatOpened]);

    if (!userData.id) {
        return <div className="flex-grow flex items-center justify-center text-gray-500">Error: Usuario no identificado.</div>;
    }

    const currentUser = { id: userData.id };

    return (
        <div className="flex-grow flex flex-col h-full">
            {activeChat ? (
                <ChatScreen
                    chatId={activeChat.chatId}
                    otherUserName={activeChat.otherUserName}
                    currentUser={currentUser}
                    onBack={() => setActiveChat(null)}
                />
            ) : (
                <ChatsListScreen
                    currentUser={currentUser}
                    onSelectChat={(chatId, otherUserName) => setActiveChat({ chatId, otherUserName })}
                />
            )}
        </div>
    );
};

export default ChatsPage;
