import api from './api';
import { UserCreated, UserLogin } from '../models/UserModel';

export async function singupAPI(data: UserCreated): Promise<any> {
    const response = await api.post<any>('/api/auth/', data);
    return response.data;
}

export async function loginAPI(data: UserLogin): Promise<any> {
    const response = await api.post<any>('/api/auth/login', {
        email: data.email,
        password: data.password
    });

    console.log(response.data);
    return response.data;
}

export async function emailConfirmation(data: any) {
    const response = await api.put<any>(`/api/auth/emailVerification?email=${data.email}&code=${data.code}`);
    return response.data;
}

export async function sendEmailVerification(email: string) {
    const response = await api.post<any>(`/api/auth/resend-email-verification?email=${email}`);
    return response.data;
}

export async function sendEmailResetPasswordRequest(data: {
    email: string;
}) {
    const res = await api.post('/api/auth/send-email-reset-password', data);
    return res.data;
}

export async function resetPassword(data: any) {
    const res = await api.post('/api/auth/reset-password', data);
    return res.data;
}

export async function changePassword(data: any) {
    const res = await api.post('/api/users/change-password', data);
    return res.data;
}
