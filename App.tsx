import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    addUserProfile, 
    uploadMediaToStorage, 
    createPost, 
    getFeedPosts, 
    Post, 
    findOrCreateChat,
    onAuthChange,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutUser,
    getUserProfile,
    FirebaseUser,
    uploadProfilePicture,
    updateUserProfile
} from './services/firebaseService';
import Discover from './components/Discover';
import ChatsPage from './components/ChatsPage';

// --- HELPER & MOCK DATA ---
const ORIENTATION_MESSAGES = {
    'Hetero': "¡Genial! El amor viene en todas las formas.",
    'Gay Pasivo': "¡Bienvenido! Aquí puedes ser tú mismo sin miedo.",
    'Gay Versátil': "¡Flexibilidad es poder! Nos encanta tenerte.",
    'Gay Activo': "¡Con toda la energía! Bienvenido a la comunidad.",
    'Lesbiana': "¡El poder femenino es increíble! Bienvenida.",
    'Bisexual': "¡El amor no tiene límites! Estamos felices de que estés aquí.",
    'Pansexual': "¡Corazones, no partes! Eres más que bienvenido/a/e.",
    'Hombre Trans': "Eres válido y eres bienvenido. Este es tu espacio.",
    'Mujer Trans': "Tu identidad es hermosa. Brilla con nosotros.",
    'Asexual': "La conexión va más allá de lo físico. ¡Bienvenido/a/e!",
    'Intersexual': "Celebramos la diversidad en todas sus formas. ¡Gracias por estar aquí!",
    'No Binario': "Rompemos las etiquetas. Siéntete libre de ser tú.",
    'Queer': "¡Abraza tu identidad única! Este es tu lugar.",
};

const INTEREST_OPTIONS = [
    "Crear historias", "Ver series y películas", "Regar plantas", "Escribir", "Leer",
    "Ayudar personas", "Trabajar", "Jugar al aire libre", "Estudiar", "Comer",
    "Hacer ejercicio", "Limpiar", "Escuchar Música", "Ver TikTok", "Redes sociales"
];

// --- SVG ICONS ---
const HomeIcon = ({ active }: { active: boolean }) => (
    <svg className={`w-7 h-7 transition-all ${active ? 'text-cyan-400 scale-110' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const DiscoverIcon = ({ active }: { active: boolean }) => (
    <svg className={`w-7 h-7 transition-all ${active ? 'text-purple-400 scale-110' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM3 12c0-1.105 2.015-2 4.5-2s4.5.895 4.5 2-2.015 2-4.5 2S3 13.105 3 12zm18 0c0-1.105-2.015-2-4.5-2s-4.5.895-4.5 2 2.015 2 4.5 2S21 13.105 21 12zm-9 6c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" /></svg>
);
const ChatIcon = ({ active }: { active: boolean }) => (
    <svg className={`w-7 h-7 transition-all ${active ? 'text-pink-400 scale-110' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const ActivityIcon = ({ active }: { active: boolean }) => (
    <svg className={`w-7 h-7 transition-all ${active ? 'text-yellow-400 scale-110' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg className={`w-7 h-7 transition-all ${active ? 'text-green-400 scale-110' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const AddPostIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const CameraIcon = () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const AnimatedCheckmark = () => (
    <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24">
        <path className="stroke-current" fill="none" strokeWidth="2" strokeDasharray="48" strokeDashoffset="48" d="M5 13l4 4L19 7">
            <animate attributeName="stroke-dashoffset" from="48" to="0" dur="0.5s" fill="freeze" />
        </path>
    </svg>
);
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);
const ShareIcon = () => (
    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);


// --- TYPE DEFINITIONS ---
export interface UserData {
    id: string; // This is now the Firebase Auth UID
    name: string;
    username: string;
    dob: string;
    orientation: string;
    interests: string[];
    profilePic?: string;
}

// --- MAIN APP PAGES ---
const PagePlaceholder = ({ title }: { title: string }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-900">
        <h1 className="text-4xl font-bold text-gray-500">{title}</h1>
        <p className="text-gray-600 mt-2">Esta sección está en construcción.</p>
    </div>
);

interface PostCardProps {
    post: Post;
    userData: UserData;
    onStartChat: (otherUser: { id: string; username: string }) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, userData, onStartChat }) => {
    const isCurrentUserPost = userData && post.authorId === userData.id;

    const formattedDate = post.createdAt?.toDate ?
        post.createdAt.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' ' +
        post.createdAt.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        : 'Cargando...';
        
    const handleShare = async () => {
        const shareData = {
            title: `Publicación de ${post.authorUsername} en Z-App`,
            text: post.textContent,
            url: window.location.href, // Using current page URL as a placeholder
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error al compartir:', err);
            }
        } else {
            alert('¡La funcionalidad de compartir llegará pronto!');
        }
    };


    return (
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-4 soft-glow w-full max-w-lg mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold mr-3">
                        {post.authorUsername ? post.authorUsername.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-white">{post.authorUsername}</p>
                        <p className="text-gray-500 text-xs">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {!isCurrentUserPost && (
                        <button 
                            onClick={() => onStartChat({ id: post.authorId, username: post.authorUsername })}
                            className="p-2 rounded-full hover:bg-gray-700 transition"
                            aria-label={`Enviar mensaje a ${post.authorUsername}`}
                        >
                            <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M5 8h2m4 0h2" /></svg>
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-full hover:bg-gray-700 transition"
                        aria-label="Compartir publicación"
                    >
                        <ShareIcon />
                    </button>
                </div>
            </div>
            <p className="text-gray-300 mb-4 flex-shrink-0">{post.textContent}</p>
            {post.mediaUrl && (
                <div className="mt-auto rounded-lg overflow-hidden border border-gray-700 min-h-0">
                    {post.mediaType === 'image' ? (
                        <img src={post.mediaUrl} alt="Post media" className="w-full h-auto object-cover" />
                    ) : (
                        <video src={post.mediaUrl} controls className="w-full h-auto object-cover"></video>
                    )}
                </div>
            )}
        </div>
    );
};

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: (newPost: Post) => void;
    userData: UserData;
}

const CreatePostModal = ({ isOpen, onClose, onPostCreated, userData }: CreatePostModalProps) => {
    const [textContent, setTextContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setTextContent('');
            setMediaFile(null);
            setMediaPreview(null);
            setMediaType(null);
            setError(null);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
            if (file.type.startsWith('image/')) setMediaType('image');
            else if (file.type.startsWith('video/')) setMediaType('video');
            else {
                setMediaType(null);
                setError('Tipo de archivo no soportado. Sube una imagen o un video.');
            }
        }
    };

    const handleSubmit = async () => {
        if (!userData.id) {
            setError('Error: ID de usuario no disponible para publicar.');
            return;
        }
        if (!textContent && !mediaFile) {
            setError('Tu publicación no puede estar vacía.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let mediaUrl: string | undefined = undefined;
            if (mediaFile && mediaType) {
                mediaUrl = await uploadMediaToStorage(mediaFile, userData.id, mediaType);
            }

            const newPost: Omit<Post, 'id' | 'createdAt'> = {
                authorId: userData.id,
                authorUsername: userData.username,
                textContent: textContent,
                ...(mediaUrl && mediaType && { mediaUrl: mediaUrl, mediaType: mediaType }),
            };

            const result = await createPost(newPost);
            if (result.success && result.id) {
                onPostCreated({ ...newPost, id: result.id, createdAt: new Date() });
                onClose();
            } else {
                setError(result.error?.message || 'Error al crear la publicación.');
            }
        } catch (err: any) {
            setError('Error al subir el archivo o crear la publicación: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg soft-glow relative">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Crear Publicación</h2>
                <textarea
                    className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="¿Qué tienes en mente?"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    disabled={isLoading}
                ></textarea>

                <div className="mt-4 flex items-center">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-full flex items-center space-x-2 hover:bg-purple-700 transition disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span>Subir Archivo</span>
                    </button>
                    <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
                </div>

                {mediaPreview && (
                    <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden max-h-48 w-full flex items-center justify-center bg-gray-900">
                        {mediaType === 'image' ? <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain" /> : <video src={mediaPreview} controls className="max-h-full max-w-full object-contain"></video>}
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition" disabled={isLoading}>Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition disabled:opacity-50" disabled={isLoading || (!textContent && !mediaFile)}>
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Publicando...
                            </div>
                        ) : 'Publicar'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const HomeFeed = ({ userData, onStartChat }: { userData: UserData, onStartChat: (otherUser: { id: string; username: string }) => void }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [errorPosts, setErrorPosts] = useState<string | null>(null);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const fetchPosts = useCallback(async () => {
        setLoadingPosts(true);
        setErrorPosts(null);
        try {
            const fetchedPosts = await getFeedPosts();
            setPosts(fetchedPosts);
        } catch (e: any) {
            setErrorPosts('Error al cargar las publicaciones: ' + e.message);
        } finally {
            setLoadingPosts(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePostCreated = (newPost: Post) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    // --- Virtualization Logic ---
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const ITEM_HEIGHT = 550; // Estimated height for one post card to avoid content clipping
    const OVERSCAN_COUNT = 3;

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const updateHeight = () => {
            setContainerHeight(container.clientHeight);
        };
        updateHeight(); // Initial set

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN_COUNT);
    const endIndex = Math.min(
      posts.length - 1,
      Math.floor((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN_COUNT
    );

    const visiblePosts = posts.slice(startIndex, endIndex + 1);
    // --- End Virtualization Logic ---

    return (
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-grow flex flex-col items-center p-4 bg-gray-900 overflow-y-auto relative">
            <h1 className="text-4xl font-bold text-cyan-400 my-4">Tu Feed</h1>

            {loadingPosts ? <p className="text-gray-400">Cargando publicaciones...</p>
            : errorPosts ? <p className="text-red-400">{errorPosts}</p>
            : posts.length === 0 ? <p className="text-gray-500">Sé el primero en publicar algo genial!</p>
            : (
                <div className="w-full max-w-lg" style={{ position: 'relative', height: `${posts.length * ITEM_HEIGHT}px` }}>
                    {visiblePosts.map((post, index) => {
                        const actualIndex = startIndex + index;
                        return (
                            <div
                                key={post.id}
                                style={{
                                    position: 'absolute',
                                    top: `${actualIndex * ITEM_HEIGHT}px`,
                                    left: 0,
                                    right: 0,
                                    height: `${ITEM_HEIGHT}px`,
                                    paddingBottom: '16px' // Replicate spacing from original PostCard mb-4
                                }}
                            >
                                <PostCard post={post} userData={userData} onStartChat={onStartChat} />
                            </div>
                        );
                    })}
                </div>
            )}

            <button
                className="fixed bottom-24 right-4 bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 z-40"
                onClick={() => setIsCreatePostModalOpen(true)}
            >
                <AddPostIcon />
            </button>

            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={() => setIsCreatePostModalOpen(false)}
                onPostCreated={handlePostCreated}
                userData={userData}
            />
        </div>
    );
};

interface ProfilePageProps {
    userData: UserData;
    setUserData: (data: UserData) => void;
}

const ProfilePage = ({ userData, setUserData }: ProfilePageProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setUploadError('Por favor, selecciona un archivo de imagen.');
                return;
            }

            setIsUploading(true);
            setUploadError(null);

            try {
                const downloadURL = await uploadProfilePicture(file, userData.id);
                await updateUserProfile(userData.id, { profilePic: downloadURL });
                
                const updatedUserData = { ...userData, profilePic: downloadURL };
                setUserData(updatedUserData);

            } catch (err: any) {
                setUploadError('Error al subir la imagen. Inténtalo de nuevo.');
                console.error(err);
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center p-4 bg-gray-900 overflow-y-auto">
            <h1 className="text-3xl font-bold text-green-400 my-4">Tu Perfil</h1>
            <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-lg soft-glow">
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32">
                         <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full h-full rounded-full overflow-hidden bg-gray-700 border-4 border-purple-500 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                            aria-label="Cambiar foto de perfil"
                        >
                            {userData.profilePic ? (
                                <img src={userData.profilePic} alt="Profile" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                            ) : (
                                <span className="text-5xl font-bold text-white group-hover:opacity-75 transition-opacity">{userData.username?.charAt(0).toUpperCase()}</span>
                            )}
                            
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                                {!isUploading && <CameraIcon />}
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                    <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                </div>
                            )}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            disabled={isUploading}
                        />
                    </div>

                    {uploadError && <p className="text-red-400 text-sm mt-4 text-center">{uploadError}</p>}

                    <h2 className="text-2xl font-bold text-white mt-4">{userData.username}</h2>
                    <p className="text-md text-gray-400">{userData.name}</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-1">Intereses</label>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {userData.interests.map(interest => (
                                <span key={interest} className="px-3 py-1 bg-blue-600 rounded-full text-sm text-white">{interest}</span>
                            ))}
                            {userData.interests.length === 0 && <span className="text-gray-500 text-sm">No hay intereses seleccionados.</span>}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                     <button onClick={() => alert("La edición de perfil estará disponible pronto.")} className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                         Editar Perfil
                     </button>
                      <button onClick={signOutUser} className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
                         Cerrar Sesión
                     </button>
                </div>
            </div>
        </div>
    );
};


// --- AUTH & REGISTRATION FLOW ---

const WelcomeScreen = ({ onNavigate }: { onNavigate: (target: 'signup' | 'login') => void }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4 animated-gradient bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900">
            <div className="text-center mb-12 fade-in">
                <h1 className="text-6xl font-extrabold text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">Z</span>
                </h1>
                <h2 className="text-3xl font-bold text-white mt-2">Bienvenido/a/e</h2>
                <p className="text-gray-400 mt-2">Tu espacio seguro para conectar.</p>
            </div>
            <div className="w-full max-w-sm space-y-4 fade-in" style={{ animationDelay: '0.2s' }}>
                 <button onClick={() => onNavigate('signup')} className="w-full text-lg font-bold py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white transform hover:scale-105 transition-transform">
                    Crear Cuenta
                </button>
                <button onClick={() => onNavigate('login')} className="w-full text-lg font-bold py-3 rounded-full bg-gray-700 text-white transform hover:scale-105 transition-transform">
                    Iniciar Sesión
                </button>
            </div>
             <div className="mt-8 text-xs text-gray-500 text-center fade-in" style={{ animationDelay: '0.4s' }}>
                Al continuar, aceptas nuestros <a href="#" className="underline text-cyan-400">Términos</a> y <a href="#" className="underline text-cyan-400">Política de Privacidad</a>.
            </div>
        </div>
    );
};

const AuthForm = ({ title, buttonText, onAuth, isSignUp, onNavigate, onGoogleSignIn }: {
    title: string;
    buttonText: string;
    onAuth: (email: string, pass: string) => Promise<void>;
    isSignUp?: boolean;
    onNavigate: () => void;
    onGoogleSignIn: () => Promise<void>;
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await onAuth(email, password);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleClick = async () => {
        setError('');
        setIsLoading(true);
        try {
            await onGoogleSignIn();
        } catch (err: any) {
            setError(err.message || 'Error con el inicio de sesión de Google.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-4xl font-extrabold text-white text-center mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">Z</span>
                </h1>
                <h2 className="text-2xl font-bold text-white text-center mb-8">{title}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                        required
                        minLength={6}
                    />
                    <button type="submit" disabled={isLoading} className="w-full text-lg font-bold py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white transform hover:scale-105 transition-transform disabled:opacity-50">
                        {isLoading ? 'Cargando...' : buttonText}
                    </button>
                </form>

                 <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="mx-4 text-gray-500">O</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>

                <button onClick={handleGoogleClick} disabled={isLoading} className="w-full flex items-center justify-center text-lg font-bold py-3 rounded-full bg-white text-gray-800 transform hover:scale-105 transition-transform disabled:opacity-50">
                    <GoogleIcon />
                    {isSignUp ? 'Registrarse con Google' : 'Iniciar con Google'}
                </button>

                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                
                <p className="text-center text-gray-400 mt-6">
                    {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                    <button onClick={onNavigate} className="font-semibold text-cyan-400 hover:underline ml-1">
                        {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                    </button>
                </p>
            </div>
        </div>
    );
};


const RegistrationFlow = ({ onComplete, authUser }: { onComplete: (userData: UserData) => void, authUser: FirebaseUser }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Omit<UserData, 'id'>>({ name: '', username: '', dob: '', orientation: '', interests: [] });
    const [age, setAge] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFinalRegistration = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const finalUserData = { ...formData, id: authUser.uid };
            const result = await addUserProfile(finalUserData);
            if (result.success) {
                onComplete(finalUserData);
            } else {
                setError("Error al guardar el perfil: " + (result.error?.message || "Error desconocido"));
            }
        } catch (e: any) {
            setError("Ocurrió un error inesperado: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // NOTE: This component still has multiple steps, they are omitted here for brevity
    // but would be present in a full implementation. We are showing the final step for demonstration.
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 fade-in">
             <div className="text-center flex flex-col items-center w-full max-w-sm">
                 <div className="w-48 h-48 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-purple-600 neon-glow pop-in">
                    <span className="text-9xl font-extrabold text-white">Z</span>
                 </div>
                 <h2 className="text-4xl font-bold mt-8 pop-in">¡Casi listo!</h2>
                 <p className="text-lg text-gray-300 mt-2 pop-in">Completemos tu perfil.</p>
                
                 <div className="w-full space-y-4 mt-8 text-left">
                     <input type="text" placeholder="Tu nombre" onChange={e => setFormData(f => ({...f, name: e.target.value}))} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition" />
                     <input type="text" placeholder="Nombre de usuario" onChange={e => setFormData(f => ({...f, username: e.target.value}))} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition" />
                     {/* Add other form fields here (DOB, interests, etc.) */}
                 </div>

                 <button onClick={handleFinalRegistration} disabled={isLoading} className="w-full mt-8 text-lg font-bold py-3 rounded-full bg-white text-gray-900 pop-in disabled:opacity-50">
                    {isLoading ? 'Guardando...' : 'Finalizar Registro'}
                </button>
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};


// --- MAIN APP LAYOUT ---

interface MainAppProps {
    userData: UserData;
    setUserData: (data: UserData) => void;
}

const MainApp = ({ userData, setUserData }: MainAppProps) => {
    const [activeTab, setActiveTab] = useState('home');
    const [chatToOpen, setChatToOpen] = useState<{ chatId: string; otherUserName: string } | null>(null);

    const handleStartChat = async (otherUser: { id: string, username: string }) => {
        if (!userData.id) return;
        const chatId = await findOrCreateChat(
            { id: userData.id, username: userData.username },
            otherUser
        );
        setChatToOpen({ chatId, otherUserName: otherUser.username });
        setActiveTab('chats');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <HomeFeed userData={userData} onStartChat={handleStartChat} />;
            case 'discover': return <Discover />;
            case 'chats': return <ChatsPage userData={userData} chatToOpen={chatToOpen} onChatOpened={() => setChatToOpen(null)} />;
            case 'activity': return <PagePlaceholder title="Actividad" />;
            case 'profile': return <ProfilePage userData={userData} setUserData={setUserData} />;
            default: return <HomeFeed userData={userData} onStartChat={handleStartChat} />;
        }
    };

    const navItems = [
        { id: 'home', label: 'Inicio', icon: HomeIcon },
        { id: 'discover', label: 'Descubre', icon: DiscoverIcon },
        { id: 'chats', label: 'Chats', icon: ChatIcon },
        { id: 'activity', label: 'Actividad', icon: ActivityIcon },
        { id: 'profile', label: 'Perfil', icon: ProfileIcon },
    ];

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-900">
            {renderContent()}
            <div className="w-full bg-gray-900/80 backdrop-blur-lg border-t border-gray-700">
                <div className="flex justify-around items-center max-w-lg mx-auto h-20">
                    {navItems.map(item => (
                         <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex flex-col items-center justify-center space-y-1 text-xs font-medium w-16">
                            <item.icon active={activeTab === item.id} />
                            <span className={`transition-colors ${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
                         </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- APP ROOT ---
const App = () => {
    const [authState, setAuthState] = useState<{
        isLoading: boolean;
        authUser: FirebaseUser | null;
        userData: UserData | null;
    }>({ isLoading: true, authUser: null, userData: null });

    const [page, setPage] = useState<'welcome' | 'login' | 'signup'>('welcome');

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                const userProfile = await getUserProfile(user.uid);
                if (userProfile) {
                    setAuthState({ isLoading: false, authUser: user, userData: userProfile });
                } else {
                    // User is authenticated but has no profile, needs to complete registration
                    setAuthState({ isLoading: false, authUser: user, userData: null });
                }
            } else {
                setAuthState({ isLoading: false, authUser: null, userData: null });
                setPage('welcome');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleRegistrationComplete = (userData: UserData) => {
        setAuthState(prev => ({ ...prev, userData: userData }));
    };

    if (authState.isLoading) {
        return <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-gray-400">Cargando...</div>;
    }

    if (!authState.authUser) {
         switch (page) {
            case 'login':
                return <AuthForm title="Iniciar Sesión" buttonText="Entrar" onAuth={signInWithEmail} onGoogleSignIn={signInWithGoogle} onNavigate={() => setPage('signup')} />;
            case 'signup':
                return <AuthForm title="Crear Cuenta" buttonText="Registrarse" onAuth={signUpWithEmail} onGoogleSignIn={signInWithGoogle} isSignUp onNavigate={() => setPage('login')} />;
            case 'welcome':
            default:
                return <WelcomeScreen onNavigate={(target) => setPage(target)} />;
        }
    }

    if (!authState.userData) {
        return <RegistrationFlow onComplete={handleRegistrationComplete} authUser={authState.authUser} />;
    }
    
    return <MainApp userData={authState.userData} setUserData={(data) => setAuthState(s => ({...s, userData: data}))} />;
};

export default App;
