import { create } from 'zustand';

type trainingHistoryState = {
    trainingHistory: any | null;
    setTrainingHistory: (training: any) => void;
    clearTrainingHistory: () => void;


};

export const useTrainingHistoryStore = create<trainingHistoryState>()(
    (set) => ({
        trainingHistory: null,
        setTrainingHistory: (training) => set({ trainingHistory: training }),
        clearTrainingHistory: () => set({ trainingHistory: null }),
    }),
);
