import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// 上傳保單檔案 (支援進度追蹤)
export const uploadPolicyDocument = async (
    customerId: string,
    policyId: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ url: string; name: string }> => {
    try {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, `policies/${customerId}/${policyId}/${fileName}`);

        // 使用 uploadBytesResumable 支援進度追蹤
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // 計算上傳進度
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    // 上傳完成,取得下載 URL
                    try {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve({
                            url,
                            name: file.name
                        });
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error uploading policy document:', error);
        throw error;
    }
};

// 刪除保單檔案
export const deletePolicyDocument = async (documentUrl: string): Promise<void> => {
    try {
        const storageRef = ref(storage, documentUrl);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting policy document:', error);
        throw error;
    }
};
