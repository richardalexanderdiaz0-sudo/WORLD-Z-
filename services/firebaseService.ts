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
    increment,
    runTransaction,
    arrayUnion,
    arrayRemove,
    deleteDoc
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
    followers?: string[];
    following?: string[];
}

export const addUserProfile = async (userData: UserData) => {
  try {
    // Use the Firebase Auth UID as the document ID
    await setDoc(doc(db, "users", userData.id), {
      ...userData,
      createdAt: serverTimestamp(),
      followers: [],
      following: [],
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
    isHateSpeech?: boolean;
    likedBy?: string[];
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
            likedBy: [],
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
        })) as Post[];
    } catch (e) {
        console.error("Error fetching posts:", e);
        return [];
    }
};

export const getPostById = async (postId: string): Promise<Post | null> => {
    try {
        const postRef = doc(db, "posts", postId);
        const docSnap = await getDoc(postRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Post;
        }
        return null;
    } catch (e) {
        console.error("Error fetching post by ID:", e);
        return null;
    }
};


export const addCommentToPost = async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>, postAuthorId: string, postTextContent: string): Promise<{ success: boolean; id?: string; error?: any; newComment?: Comment }> => {
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

        if (commentData.authorId !== postAuthorId) {
             const notificationsCol = collection(db, "notifications");
             await addDoc(notificationsCol, {
                recipientId: postAuthorId,
                actorId: commentData.authorId,
                actorUsername: commentData.authorUsername,
                type: 'comment',
                postId: postId,
                commentText: commentData.textContent.substring(0, 100),
                createdAt: serverTimestamp(),
                read: false
             } as Omit<Notification, 'id'>);
        }

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


// --- INTERACTIONS & NOTIFICATIONS ---

export interface Notification {
    id?: string;
    recipientId: string;
    actorId: string;
    actorUsername: string;
    type: 'like' | 'comment' | 'follow' | 'chat_request_accepted';
    postId?: string;
    postContentPreview?: string;
    commentText?: string;
    createdAt: any;
    read: boolean;
}

export const toggleLikePost = async (postId: string, postAuthorId: string, userId: string, username: string, textContent: string) => {
    const postRef = doc(db, "posts", postId);
    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) throw "La publicación no existe.";

            const postData = postDoc.data() as Post;
            const likedBy = postData.likedBy || [];
            
            if (likedBy.includes(userId)) {
                transaction.update(postRef, { likedBy: arrayRemove(userId), likes: increment(-1) });
            } else {
                transaction.update(postRef, { likedBy: arrayUnion(userId), likes: increment(1) });
                if (userId !== postAuthorId) {
                    const notificationsCol = collection(db, "notifications");
                    const notificationDoc = {
                        recipientId: postAuthorId,
                        actorId: userId,
                        actorUsername: username,
                        type: 'like',
                        postId: postId,
                        postContentPreview: textContent.substring(0, 50),
                        createdAt: serverTimestamp(),
                        read: false,
                    };
                    transaction.set(doc(notificationsCol), notificationDoc);
                }
            }
        });
        return { success: true };
    } catch (e: any) {
        console.error("Error toggling like:", e);
        return { success: false, error: e.toString() };
    }
};

export const toggleFollowUser = async (currentUserId: string, currentUserUsername: string, targetUserId: string) => {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    try {
        let isNowFollowing = false;
        await runTransaction(db, async (transaction) => {
            const currentUserDoc = await transaction.get(currentUserRef);
            if (!currentUserDoc.exists()) throw "Current user document does not exist!";
            
            const following = currentUserDoc.data().following || [];
            
            if (following.includes(targetUserId)) {
                // Unfollow
                transaction.update(currentUserRef, { following: arrayRemove(targetUserId) });
                transaction.update(targetUserRef, { followers: arrayRemove(currentUserId) });
                isNowFollowing = false;
            } else {
                // Follow
                transaction.update(currentUserRef, { following: arrayUnion(targetUserId) });
                transaction.update(targetUserRef, { followers: arrayUnion(currentUserId) });
                
                // Create notification
                const notificationsCol = collection(db, "notifications");
                const notificationDoc: Omit<Notification, 'id'> = {
                    recipientId: targetUserId,
                    actorId: currentUserId,
                    actorUsername: currentUserUsername,
                    type: 'follow',
                    createdAt: serverTimestamp(),
                    read: false,
                };
                transaction.set(doc(notificationsCol), notificationDoc);
                isNowFollowing = true;
            }
        });
        return { success: true, isNowFollowing };
    } catch (e) {
        console.error("Error toggling follow:", e);
        return { success: false, error: e };
    }
};

export const getNotificationsForUser = (userId: string, callback: (notifications: Notification[]) => void) => {
    // Querying without orderBy avoids the need for a composite index.
    // We will sort and limit on the client side to prevent Firestore errors.
    const q = query(collection(db, 'notifications'), where('recipientId', '==', userId));
    return onSnapshot(q, (querySnapshot) => {
        const notifications = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Notification[];
        
        // Sort by creation date descending on the client
        notifications.sort((a, b) => {
            const timeA = a.createdAt?.toDate()?.getTime() || 0;
            const timeB = b.createdAt?.toDate()?.getTime() || 0;
            return timeB - timeA;
        });

        // Return the 30 most recent notifications
        callback(notifications.slice(0, 30));
    }, (error) => {
        console.error("Error fetching notifications:", error);
    });
};

export const markNotificationAsRead = async (notificationId: string) => {
    try {
        const notifRef = doc(db, 'notifications', notificationId);
        await updateDoc(notifRef, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
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

export interface ChatRequest {
    id: string; // senderId_recipientId
    senderId: string;
    senderUsername: string;
    recipientId: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: any;
}

export const sendChatRequest = async (sender: {id: string, username: string}, recipientId: string, message: string): Promise<{success: boolean, error?: any}> => {
    const requestId = `${sender.id}_${recipientId}`;
    const requestRef = doc(db, 'chatRequests', requestId);
    
    try {
        await setDoc(requestRef, {
            senderId: sender.id,
            senderUsername: sender.username,
            recipientId: recipientId,
            message: message,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch(e) {
        console.error("Error sending chat request:", e);
        return { success: false, error: e };
    }
};

export const getChatRequestsForUser = (userId: string, callback: (requests: ChatRequest[]) => void) => {
    const q = query(collection(db, 'chatRequests'), where('recipientId', '==', userId), where('status', '==', 'pending'));

    return onSnapshot(q, (querySnapshot) => {
        const requests = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ChatRequest[];
        requests.sort((a, b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0));
        callback(requests);
    }, (error) => {
         console.error("Error fetching chat requests:", error);
    });
};

export const respondToChatRequest = async (request: ChatRequest, recipient: {id: string, username: string}, response: 'accepted' | 'declined'): Promise<{success: boolean, chatId?: string, error?: any}> => {
    const requestRef = doc(db, 'chatRequests', request.id);
    const sender = { id: request.senderId, username: request.senderUsername };
    try {
        if (response === 'accepted') {
            const chatId = await findOrCreateChat(recipient, sender);
            
            await addDoc(collection(db, "notifications"), {
                recipientId: sender.id,
                actorId: recipient.id,
                actorUsername: recipient.username,
                type: 'chat_request_accepted',
                createdAt: serverTimestamp(),
                read: false,
            } as Omit<Notification, 'id'>);
            
            await deleteDoc(requestRef);

            return { success: true, chatId };
        } else { // declined
            await deleteDoc(requestRef);
            return { success: true };
        }
    } catch (e) {
        console.error("Error responding to chat request:", e);
        return { success: false, error: e };
    }
};


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