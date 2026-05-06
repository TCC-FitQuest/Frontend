import api from './api';

export async function getGlobalRanking(
    userId: number,
    type: "global" | "friends" | "community" = "global",
    communityId?: number
) {
    const res = await api.get(`/api/users/ranking/${userId}/type/${type}`, {
        params: {
            community_id: type === "community" ? communityId : undefined
        }
    });

    return res.data;
}

export async function getFriendsRanking(userId: number) {
    const res = await api.get(`/api/users/ranking/${userId}`);
    return res.data;
}

export async function getSeasonRanking(userId: number) {
    const res = await api.get(`/api/users/season/${userId}`);
    return res.data;
}