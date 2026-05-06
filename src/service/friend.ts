// services/friend.ts
import api from './api';

export const getFriendsByUserId = async (userId: number) => {
    const res = await api.get(`api/friend/`,
        {
            params: {
                current_user_id: userId,
            },
        });
    return res.data;
};

export const sendFriendRequest = async (
    friend_name_or_id: string
) => {
    return api.post(
        `/api/friend/request`,
        null,
        {
            params: {
                friend_name_or_id,
            },
        }
    );
};

export const searchUsers = async (
    friend_name: string
) => {

    return api.get('/api/friend/search', {
        params: { friend_name: friend_name },
    });
};

export const acceptFriendRequest = async (requestId: number, current_user_id: number) => {
    return api.post(`api/friend/accept/${requestId}`, null, {
        params: { current_user_id },
    });
};

export const removeFriend = async (userId: number, current_user_id: number) => {
    return api.delete(`api/friend/${userId}`, {
        params: { current_user_id },
    });
};

export async function getReceivedFriendRequests(userId: number) {
    const { data } = await api.get('/api/friend/requests/received', {
        params: { current_user_id: userId },
    });
    return data;
}

export async function getSentFriendRequests(userId: number) {
    const { data } = await api.get('/api/friend/requests/sent', {
        params: { current_user_id: userId },
    });
    return data;
}
