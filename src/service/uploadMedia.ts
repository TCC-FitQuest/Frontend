import api from './api';
import { UploadProfile } from '../models/uploadProfile';

export async function uploadProfileImage(data: any) {
    const res = await api.post(
        `/api/upload/profile`,
        data,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    return res.data;
}
