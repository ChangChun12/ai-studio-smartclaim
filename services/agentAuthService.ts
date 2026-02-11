import { auth, signInWithEmail } from '../services/firebase';

// 專員 Email 域名檢查
const AGENT_EMAIL_DOMAIN = '@smartclaim.com';

// 檢查是否為專員帳號
export const isAgentEmail = (email: string): boolean => {
    return email.endsWith(AGENT_EMAIL_DOMAIN);
};

// 專員登入
export const agentLogin = async (email: string, password: string) => {
    try {
        // 驗證 email 格式
        if (!isAgentEmail(email)) {
            throw new Error('非專員帳號,請使用 @smartclaim.com 結尾的 email');
        }

        const user = await signInWithEmail(email, password);

        // 設定 session flag
        sessionStorage.setItem('isAgent', 'true');

        return user;
    } catch (error: any) {
        console.error('Agent login failed:', error);

        // 友善的錯誤訊息
        if (error.code === 'auth/user-not-found') {
            throw new Error('專員帳號不存在');
        } else if (error.code === 'auth/wrong-password') {
            throw new Error('密碼錯誤');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Email 格式不正確');
        } else if (error.message) {
            throw error;
        } else {
            throw new Error('登入失敗,請稍後再試');
        }
    }
};

// 專員登出
export const agentLogout = () => {
    sessionStorage.removeItem('isAgent');
};

// 檢查是否為專員模式
export const isAgentMode = (): boolean => {
    const user = auth.currentUser;
    const isAgentFlag = sessionStorage.getItem('isAgent') === 'true';

    return !!(user && isAgentFlag && isAgentEmail(user.email || ''));
};

// 取得當前專員資訊
export const getCurrentAgent = () => {
    const user = auth.currentUser;
    if (user && isAgentMode()) {
        return {
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
            uid: user.uid
        };
    }
    return null;
};
