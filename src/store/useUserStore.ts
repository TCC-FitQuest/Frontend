import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserType } from '../models/UserModel';

type UserState = {
    user: UserType | null;
    setUser: (user: UserType) => void;
    updateUser: (data: Partial<UserType>) => void;
    clearUser: () => void;
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            updateUser: (data) =>
                set((state) => {
                    if (!state.user) return state;
                    return {
                        user: { ...state.user, ...data },
                    };
                }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);