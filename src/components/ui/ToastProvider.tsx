import React, { createContext, useState, useContext, useCallback } from 'react';
import GameToast from './GameToast';

interface Toast {
    visible: boolean;
    message: string;
    type: 'success' | 'error';
}

const ToastContext = createContext({});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<Toast>({ visible: false, message: '', type: 'success' });

    const showToast = useCallback((message: any, type: 'success' | 'error' = 'success') => {
        setToast({ visible: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <GameToast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);