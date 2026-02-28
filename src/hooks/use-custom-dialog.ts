import { useState, useCallback } from 'react';

interface DialogOptions {
    title: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
}

export const useCustomDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<DialogOptions>({
        title: '',
        description: '',
        type: 'info'
    });

    const showDialog = useCallback((opts: DialogOptions) => {
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        options,
        showDialog,
        closeDialog
    };
};
