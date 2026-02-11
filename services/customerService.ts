import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    onSnapshot,
    writeBatch
} from 'firebase/firestore';
import { Customer, Policy, PolicyStatus } from '../types';

const CUSTOMERS_COLLECTION = 'customers';

// 計算保單狀態
export const calculatePolicyStatus = (endDate: Date): PolicyStatus => {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'active';
};

// 轉換 Firestore 資料為 Customer 物件
const firestoreToCustomer = (docId: string, data: any): Customer => {
    return {
        id: docId,
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        policies: (data.policies || []).map((p: any) => ({
            id: p.id,
            policyNumber: p.policyNumber || '',
            policyName: p.policyName || '',
            insuranceCompany: p.insuranceCompany || '',
            coverageType: p.coverageType || '',
            policyType: p.policyType || 'main',
            parentPolicyId: p.parentPolicyId,
            premium: p.premium || 0,
            currency: p.currency || 'TWD',
            paymentFrequency: p.paymentFrequency || 'annual',
            startDate: p.startDate?.toDate() || new Date(),
            endDate: p.endDate?.toDate() || new Date(),
            status: calculatePolicyStatus(p.endDate?.toDate() || new Date()),
            documentUrl: p.documentUrl,
            documentName: p.documentName,
            notes: p.notes || ''
        })),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        notes: data.notes || ''
    };
};

// 轉換 Customer 物件為 Firestore 資料
const customerToFirestore = (customer: Partial<Customer>) => {
    const data: any = {
        updatedAt: Timestamp.now()
    };

    if (customer.name !== undefined) data.name = customer.name;
    if (customer.phone !== undefined) data.phone = customer.phone;
    if (customer.email !== undefined) data.email = customer.email;
    if (customer.notes !== undefined) data.notes = customer.notes;

    if (customer.policies !== undefined) {
        data.policies = customer.policies.map(p => {
            const policy: any = {
                id: p.id,
                policyName: p.policyName,
                policyType: p.policyType,
                premium: p.premium || 0,
                currency: p.currency,
                paymentFrequency: p.paymentFrequency,
                startDate: Timestamp.fromDate(p.startDate),
                endDate: Timestamp.fromDate(p.endDate),
                status: calculatePolicyStatus(p.endDate)
            };

            // 只加入非空值的選填欄位
            if (p.policyNumber) policy.policyNumber = p.policyNumber;
            if (p.insuranceCompany) policy.insuranceCompany = p.insuranceCompany;
            if (p.coverageType) policy.coverageType = p.coverageType;
            if (p.parentPolicyId) policy.parentPolicyId = p.parentPolicyId;
            if (p.documentUrl) policy.documentUrl = p.documentUrl;
            if (p.documentName) policy.documentName = p.documentName;
            if (p.notes) policy.notes = p.notes;

            return policy;
        });
    }

    return data;
};

// 取得所有客戶 (即時監聽)
export const subscribeToCustomers = (callback: (customers: Customer[]) => void) => {
    const q = query(collection(db, CUSTOMERS_COLLECTION), orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const customers = snapshot.docs.map(doc =>
            firestoreToCustomer(doc.id, doc.data())
        );
        callback(customers);
    }, (error) => {
        console.error('Error fetching customers:', error);
        callback([]);
    });
};

// 取得單一客戶
export const getCustomer = async (customerId: string): Promise<Customer | null> => {
    try {
        const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return firestoreToCustomer(docSnap.id, docSnap.data());
        }
        return null;
    } catch (error) {
        console.error('Error getting customer:', error);
        throw error;
    }
};

// 新增客戶
export const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            notes: customer.notes || '',
            policies: (customer.policies || []).map(p => ({
                id: p.id,
                policyNumber: p.policyNumber || '',
                policyName: p.policyName,
                insuranceCompany: p.insuranceCompany || '',
                coverageType: p.coverageType || '',
                policyType: p.policyType,
                parentPolicyId: p.parentPolicyId,
                premium: p.premium || 0,
                currency: p.currency,
                paymentFrequency: p.paymentFrequency,
                startDate: Timestamp.fromDate(p.startDate),
                endDate: Timestamp.fromDate(p.endDate),
                status: calculatePolicyStatus(p.endDate),
                documentUrl: p.documentUrl,
                documentName: p.documentName,
                notes: p.notes || ''
            })),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding customer:', error);
        throw error;
    }
};

// 更新客戶
export const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<void> => {
    try {
        const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
        await updateDoc(docRef, customerToFirestore(updates));
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
};

// 刪除客戶
export const deleteCustomer = async (customerId: string): Promise<void> => {
    try {
        const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
};

// 新增保單到客戶
export const addPolicyToCustomer = async (customerId: string, policy: Omit<Policy, 'id' | 'status'>): Promise<void> => {
    try {
        const customer = await getCustomer(customerId);
        if (!customer) throw new Error('Customer not found');

        const newPolicy: Policy = {
            ...policy,
            id: Date.now().toString(),
            status: calculatePolicyStatus(policy.endDate)
        };

        const updatedPolicies = [...customer.policies, newPolicy];
        await updateCustomer(customerId, { policies: updatedPolicies });
    } catch (error) {
        console.error('Error adding policy:', error);
        throw error;
    }
};

// 更新保單
export const updatePolicy = async (customerId: string, policyId: string, updates: Partial<Policy>): Promise<void> => {
    try {
        const customer = await getCustomer(customerId);
        if (!customer) throw new Error('Customer not found');

        const updatedPolicies = customer.policies.map(p =>
            p.id === policyId
                ? {
                    ...p,
                    ...updates,
                    status: updates.endDate ? calculatePolicyStatus(updates.endDate) : p.status
                }
                : p
        );

        await updateCustomer(customerId, { policies: updatedPolicies });
    } catch (error) {
        console.error('Error updating policy:', error);
        throw error;
    }
};

// 刪除保單
export const deletePolicy = async (customerId: string, policyId: string): Promise<void> => {
    try {
        const customer = await getCustomer(customerId);
        if (!customer) throw new Error('Customer not found');

        const updatedPolicies = customer.policies.filter(p => p.id !== policyId);
        await updateCustomer(customerId, { policies: updatedPolicies });
    } catch (error) {
        console.error('Error deleting policy:', error);
        throw error;
    }
};

// 搜尋客戶 (前端過濾)
export const searchCustomers = (customers: Customer[], keyword: string): Customer[] => {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (!lowerKeyword) return customers;

    return customers.filter(c =>
        c.name.toLowerCase().includes(lowerKeyword) ||
        c.phone.includes(lowerKeyword) ||
        (c.email && c.email.toLowerCase().includes(lowerKeyword))
    );
};
