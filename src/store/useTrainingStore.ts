import { create } from 'zustand';
import { TrainingHistory } from '../models/TrainingHistory';

type trainingState = {
    trainingProtocol: any | null;
    setTrainingProtocol: (trainingProtocol: any) => void;
    clearTrainingProtocol: () => void;
    addTrainingProtocol: (newTraining: any) => void;
    updateTrainingProtocolById: (id: any, updatedData: any) => void;

    selectedTraining: any | null;
    setSelectedTraining: (selectedTraining: any) => void;
    clearSelectedTraining: () => void;

    trainingFriend: any | null;
    setTrainingFriend: (trainingWeek: any) => void;
    clearTrainingFriend: () => void;

    trainingProtocolHistoryStrength: TrainingHistory[]
    setTrainingProtocolHistoryStrength: (trainingProtocolHistoryStrength: TrainingHistory[]) => void;
    clearTrainingProtocolHistoryStrength: () => void;

    trainingProtocolHistoryAerobic: TrainingHistory[]
    setTrainingProtocolHistoryAerobic: (trainingProtocolHistoryAerobic: TrainingHistory[]) => void;
    clearTrainingProtocolHistoryAerobic: () => void;

    trainingExercise: any;
    setTrainingExercise: (trainingExercise: any) => void;
    clearTrainingExercise: () => void;
};

export const useTrainingStore = create<trainingState>()(
    (set) => ({
        trainingProtocol: [],
        setTrainingProtocol: (trainingProtocol) => set({ trainingProtocol }),
        clearTrainingProtocol: () => set({ trainingProtocol: [] }),
        addTrainingProtocol: (newTraining) =>
            set((state) => ({
                trainingProtocol: [...state.trainingProtocol, newTraining],
            })),
        updateTrainingProtocolById: (id, updatedData) =>
            set((state) => ({
                trainingProtocol: state.trainingProtocol.map((item?: any) =>
                    item.id === id
                        ? { ...item, ...updatedData }
                        : item
                ),
            })),

        selectedTraining: null,
        setSelectedTraining: (selectedTraining) => set({ selectedTraining }),
        clearSelectedTraining: () => set({ selectedTraining: null }),

        trainingFriend: null,
        setTrainingFriend: (trainingFriend) => set({ trainingFriend }),
        clearTrainingFriend: () => set({ trainingFriend: null }),

        trainingProtocolHistoryStrength: [],
        setTrainingProtocolHistoryStrength: (trainingProtocolHistoryStrength) => set({ trainingProtocolHistoryStrength }),
        clearTrainingProtocolHistoryStrength: () => set({ trainingProtocolHistoryStrength: [] }),

        trainingProtocolHistoryAerobic: [],
        setTrainingProtocolHistoryAerobic: (trainingProtocolHistoryAerobic) => set({ trainingProtocolHistoryAerobic }),
        clearTrainingProtocolHistoryAerobic: () => set({ trainingProtocolHistoryAerobic: [] }),

        trainingExercise: [],
        setTrainingExercise: (trainingExercise) =>
            set((state) => ({
                trainingExercise:
                    typeof trainingExercise === "function"
                        ? trainingExercise(state.trainingExercise)
                        : trainingExercise
            })),

        clearTrainingExercise: () => set({ trainingExercise: [] }),
    }),
);
