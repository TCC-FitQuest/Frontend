import { useState } from 'react';

type UseFormHandler<T extends Record<string, any>> = {
    form: T;
    errors: Partial<Record<keyof T, string>>;
    setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof T, string>>>>;
    setForm: React.Dispatch<React.SetStateAction<T>>;
    handleInputChange: (key: keyof T, value: string | object[]) => void;
};

export function useFormHandler<T extends Record<string, any>>(initialValues: T): UseFormHandler<T> {
    const [form, setForm] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const handleInputChange = (key: keyof T, value: string | object[]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
    };

    return { form, setForm, errors, setErrors, handleInputChange };
}
