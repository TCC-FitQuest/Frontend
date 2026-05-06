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