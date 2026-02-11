import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
    User
} from 'firebase/auth';
import { auth } from './firebase';

// Google Provider
const googleProvider = new GoogleAuthProvider();

// 註冊新使用者
export const registerUser = async (email: string, password: string, displayName: string): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 更新使用者顯示名稱
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }

        return userCredential.user;
    } catch (error: any) {
        console.error('註冊失敗:', error);
        throw new Error(getErrorMessage(error.code));
    }
};

// Email/Password 登入
export const loginUser = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error('登入失敗:', error);
        throw new Error(getErrorMessage(error.code));
    }
};

// Google 登入
export const loginWithGoogle = async (): Promise<User> => {
    try {
        // 設定 Google Provider 參數,強制顯示帳號選擇
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });

        const userCredential = await signInWithPopup(auth, googleProvider);
        return userCredential.user;
    } catch (error: any) {
        console.error('Google 登入失敗:', error);

        // 如果使用者關閉彈窗,不要拋出錯誤
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            throw new Error(''); // 空字串,不顯示錯誤訊息
        }

        throw new Error(getErrorMessage(error.code));
    }
};

// 登出
export const logoutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('登出失敗:', error);
        throw error;
    }
};

// 取得當前使用者
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// 錯誤訊息轉換
const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Email 已被使用';
        case 'auth/invalid-email':
            return 'Email 格式不正確';
        case 'auth/operation-not-allowed':
            return '此登入方式未啟用';
        case 'auth/weak-password':
            return '密碼強度不足(至少 6 個字元)';
        case 'auth/user-disabled':
            return '此帳號已被停用';
        case 'auth/user-not-found':
            return '找不到此使用者';
        case 'auth/wrong-password':
            return '密碼錯誤';
        case 'auth/popup-closed-by-user':
            return '登入視窗已關閉';
        default:
            return '發生錯誤,請稍後再試';
    }
};
