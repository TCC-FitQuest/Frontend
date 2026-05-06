import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ModeState = {
    activeMode: 'ATHLETE' | 'PERSONAL';
    setToggleMode: (mode: 'ATHLETE' | 'PERSONAL') => void;
};

export const useModeStore = create<ModeState>()(
    persist(
        (set) => ({
            activeMode: 'ATHLETE',
            setToggleMode: (mode) => set({ activeMode: mode }),

        }),
        {
            name: 'mode-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);