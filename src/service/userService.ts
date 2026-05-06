import api from './api';
import { UserCreated, UserLogin } from '../models/UserModel';

export async function updateUser(userId: string, data: any) {
    const res = await api.put(`/api/users/${userId}`, data);
    return res.data;
}

export async function getUserAll() {
    const res = await api.get('/api/users/');
    return res.data;
}

export async function getUserRanking(userId: string) {
    const res = await api.get(`/api/users/ranking/${userId}`);
    return res.data;
}