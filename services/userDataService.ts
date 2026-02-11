import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { UploadedDocument, Message } from '../types';

const USERS_COLLECTION = 'users';

// 遞迴清理物件中的 undefined 欄位
const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return null;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => removeUndefined(item)).filter(item => item !== null);
    }

    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                const cleanedValue = removeUndefined(obj[key]);
                if (cleanedValue !== null) {
                    cleaned[key] = cleanedValue;
                }
            }
        }
        return cleaned;
    }

    return obj;
};

// 儲存使用者文件
export const saveUserDocument = async (userId: string, document: UploadedDocument): Promise<void> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId, 'documents', document.id);

        // 深度清理 chatHistory 中的所有 undefined 欄位
        const cleanChatHistory = removeUndefined(document.chatHistory || []);

        // 過濾掉 undefined 的欄位
        const dataToSave: any = {
            id: document.id,
            name: document.name,
            uploadedAt: Timestamp.now(),
            chatHistory: cleanChatHistory,
        };

        // 只加入有值的欄位
        if (document.summary) dataToSave.summary = document.summary;
        if (document.fileUrl) dataToSave.fileUrl = document.fileUrl;
        if (document.pages) dataToSave.pages = removeUndefined(document.pages);
        if (document.fullText) dataToSave.fullText = document.fullText;
        if (document.suggestedQuestions) dataToSave.suggestedQuestions = document.suggestedQuestions;

        await setDoc(docRef, dataToSave);
        console.log('💾 已儲存文件到 Firestore:', document.name);
    } catch (error) {
        console.error('❌ 儲存文件失敗:', error);
        throw error;
    }
};

// 載入使用者所有文件
export const loadUserDocuments = async (userId: string): Promise<UploadedDocument[]> => {
    try {
        const docsRef = collection(db, USERS_COLLECTION, userId, 'documents');
        const q = query(docsRef, orderBy('uploadedAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.id,
                name: data.name,
                pages: data.pages || [],
                fullText: data.fullText || '',
                fileUrl: data.fileUrl || '',
                chatHistory: data.chatHistory || [],
                messages: data.chatHistory || [], // 相容性
                summary: data.summary || '',
                suggestedQuestions: data.suggestedQuestions || []
            };
        });
    } catch (error) {
        console.error('載入文件失敗:', error);
        throw error;
    }
};

// 刪除文件
export const deleteUserDocument = async (userId: string, documentId: string): Promise<void> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId, 'documents', documentId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('刪除文件失敗:', error);
        throw error;
    }
};

// 更新對話記錄
export const updateChatHistory = async (
    userId: string,
    documentId: string,
    messages: Message[]
): Promise<void> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId, 'documents', documentId);

        // 檢查文件是否存在
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await setDoc(docRef, {
                chatHistory: messages
            }, { merge: true });
        }
    } catch (error) {
        console.error('更新對話記錄失敗:', error);
        throw error;
    }
};

// 儲存使用者設定檔
export const saveUserProfile = async (userId: string, profile: {
    email: string;
    displayName: string;
}): Promise<void> => {
    try {
        const profileRef = doc(db, USERS_COLLECTION, userId);
        await setDoc(profileRef, {
            email: profile.email,
            displayName: profile.displayName,
            createdAt: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('儲存使用者設定檔失敗:', error);
        throw error;
    }
};
