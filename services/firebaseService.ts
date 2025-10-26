import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    getDocs, 
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    where,
    limit,
    increment
} from 'firebase/firestore';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Re-export FirebaseUser for use in components
export type { FirebaseUser };

const firebaseConfig = {
  apiKey: "AIzaSyCwjeLijCB4-HfFbJjHrpfocJ5mn39pat0",
  authDomain: "nexusapp-c0a21.firebaseapp.com",
  databaseURL: "https://nexusapp-c0a21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nexusapp-c0a21",
  storageBucket: "nexusapp-c0a21.appspot.com",
  messagingSenderId: "487113661451",
  appId: "1:487113661451:web:1774402530bfd189c6fb0e",
  measurementId: "G-TQ7GDCG5QX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// --- AUTHENTICATION FUNCTIONS ---

const formatAuthError = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está registrado.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
             return 'Correo electrónico o contraseña incorrectos.';
        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres.';
        default:
            return 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
    }
};

export const signUpWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(formatAuthError(error.code));
    }
};

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(formatAuthError(error.code));
    }
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error: any) {
        throw new Error(formatAuthError(error.code));
    }
};

export const signOutUser = (): Promise<void> => {
    return signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};


// --- USER PROFILE FUNCTIONS ---
export interface UserData {
    id: string; // Firebase Auth UID
    name: string;
    username: string;
    dob: string;
    orientation: string;
    interests: string[];
    profilePic?: string;
}

export const addUserProfile = async (userData: UserData) => {
  try {
    // Use the Firebase Auth UID as the document ID
    await setDoc(doc(db, "users", userData.id), {
      ...userData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: userData.id };
  } catch (e: any) {
    console.error("Error adding user profile: ", e);
    return { success: false, error: e };
  }
};

export const getUserProfile = async (uid: string): Promise<UserData | null> => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as UserData;
        } else {
            console.log("No such user profile!");
            return null;
        }
    } catch (e) {
        console.error("Error fetching user profile:", e);
        return null;
    }
};

export const uploadProfilePicture = (file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error("Error uploading profile picture:", error);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

export const updateUserProfile = async (userId: string, data: Partial<UserData>): Promise<{success: boolean, error?: any}> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, data);
        return { success: true };
    } catch(e) {
        console.error("Error updating user profile: ", e);
        return { success: false, error: e };
    }
}


// --- POSTS FUNCTIONS ---
export const uploadMediaToStorage = async (file: File, userId: string, mediaType: 'image' | 'video'): Promise<string> => {
    const storageRef = ref(storage, `${mediaType}s/${userId}/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error("Error uploading media:", error);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

export interface Post {
    id?: string;
    authorId: string;
    authorUsername: string;
    textContent: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: any;
    likes?: number;
    commentCount?: number;
}

export interface Comment {
    id?: string;
    authorId: string;
    authorUsername: string;
    textContent: string;
    createdAt: any;
}

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt'> & { createdAt?: any }) => {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
            ...postData,
            createdAt: serverTimestamp(),
            likes: 0,
            commentCount: 0,
        });
        return { success: true, id: docRef.id };
    } catch (e: any) {
        console.error("Error creating post: ", e);
        return { success: false, error: e };
    }
};

export const getFeedPosts = async (): Promise<Post[]> => {
    try {
        const postsCol = collection(db, "posts");
        const postsQuery = query(postsCol, orderBy("createdAt", "desc"), limit(50));
        const postSnapshot = await getDocs(postsQuery);
        return postSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            likes: doc.data().likes || Math.floor(Math.random() * 200),
            commentCount: doc.data().commentCount || Math.floor(Math.random() * 50),
        })) as Post[];
    } catch (e) {
        console.error("Error fetching posts:", e);
        return [];
    }
};

export const addCommentToPost = async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: any; newComment?: Comment }> => {
    try {
        const postRef = doc(db, "posts", postId);
        const commentsCol = collection(postRef, "comments");

        const newCommentPayload = {
            ...commentData,
            createdAt: serverTimestamp(),
        };
        
        const docRef = await addDoc(commentsCol, newCommentPayload);

        await updateDoc(postRef, {
            commentCount: increment(1)
        });

        const createdComment: Comment = {
             ...commentData,
             id: docRef.id,
             createdAt: new Date(),
        };

        return { success: true, id: docRef.id, newComment: createdComment };
    } catch (e: any) {
        console.error("Error adding comment: ", e);
        return { success: false, error: e };
    }
};

export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
    try {
        const commentsCol = collection(db, "posts", postId, "comments");
        const q = query(commentsCol, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Comment[];
    } catch (e) {
        console.error("Error fetching comments:", e);
        return [];
    }
};


// --- CHAT FUNCTIONS ---

export interface Message {
    id?: string;
    senderId: string;
    text: string;
    timestamp: any; // Firebase Timestamp
}

export interface Chat {
    id: string;
    participants: string[];
    participantsInfo: { userId: string, username: string }[];
    lastMessage?: string;
    lastMessageSenderId?: string;
    lastMessageTimestamp?: any;
}

export const findOrCreateChat = async (currentUser: {id: string, username: string}, otherUser: {id: string, username: string}): Promise<string> => {
    const participants = [currentUser.id, otherUser.id];
    const chatId = participants.sort().join('_');
    
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        await setDoc(chatRef, {
            participants: participants,
            participantsInfo: [
                { userId: currentUser.id, username: currentUser.username },
                { userId: otherUser.id, username: otherUser.username }
            ],
            createdAt: serverTimestamp(),
            lastMessageTimestamp: serverTimestamp(),
        });
    }
    return chatId;
};

export const getChatsForUser = (userId: string, callback: (chats: Chat[]) => void) => {
    // Removed orderBy from query to avoid composite index requirement.
    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
    
    return onSnapshot(chatsQuery, (querySnapshot) => {
        const chats = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Chat[];
        
        // Sort on the client side
        chats.sort((a, b) => {
            const timeA = a.lastMessageTimestamp?.toDate()?.getTime() || 0;
            const timeB = b.lastMessageTimestamp?.toDate()?.getTime() || 0;
            return timeB - timeA;
        });

        callback(chats);
    });
};

export const getMessagesForChat = (chatId: string, callback: (messages: Message[]) => void) => {
    const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));

    return onSnapshot(messagesQuery, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Message[];
        callback(messages);
    });
};

export const sendMessage = async (chatId: string, senderId: string, text: string) => {
    if (!text.trim()) return;

    const messagesCol = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesCol, {
        senderId,
        text,
        timestamp: serverTimestamp(),
    });

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageSenderId: senderId,
        lastMessageTimestamp: serverTimestamp(),
    });
};