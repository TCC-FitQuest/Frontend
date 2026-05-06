import { create } from "zustand";

type FriendsState = {
    friendsReceived: any[];
    setFriendsReceived: (friends: any[]) => void;
    removeFriendReceived: (id: number) => void;

    friendsSent: any[];
    setFriendsSent: (friends: any[]) => void;
    removeFriendSent: (id: number) => void;
};

export const useFriendsStore = create<FriendsState>()(
    (set) => ({
        friendsReceived: [],
        setFriendsReceived: (friends) => set({ friendsReceived: friends }),
        removeFriendReceived: (id) =>
            set((state) => ({
                friendsReceived: state.friendsReceived.filter((friend) => friend.id !== id),
            })),

        friendsSent: [],
        setFriendsSent: (friends) => set({ friendsSent: friends }),
        removeFriendSent: (id) =>
            set((state) => ({
                friendsSent: state.friendsSent.filter((friend) => friend.id !== id),
            })),
    }),
);