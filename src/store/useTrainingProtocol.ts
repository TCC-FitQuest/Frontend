import { create } from 'zustand';

type trainingProtocolState = {
    protocol: any | null;
    setProtocol: (trainingWeek: any) => void;
    clearProtocol: () => void;

    trainingProtocolAll: any | null;
    setTrainingProtocolAll: (training: any) => void;
    clearTrainingProtocolAll: () => void;
    removeTrainingProtocol: (id: number) => void;
    updateTrainingProtocol: (id: number, data: any) => void;

    trainingProtocolUpdate: any | null;
    setTrainingProtocolUpdate: (training: any) => void;
    clearTrainingProtocolUpdate: () => void;
};

export const useTrainingProtocolStore = create<trainingProtocolState>()(
    (set) => ({
        protocol: null,
        setProtocol: (protocol) => set({ protocol }),
        clearProtocol: () => set({ protocol: null }),

        trainingProtocolAll: null,
        setTrainingProtocolAll: (training) => set({ trainingProtocolAll: training }),
        clearTrainingProtocolAll: () => set({ trainingProtocolAll: null }),
        removeTrainingProtocol: (id: number) =>
            set((state) => ({
                trainingProtocolAll: state.trainingProtocolAll.filter((protocol: { id: any; }) => protocol.id !== id),
            })),
        updateTrainingProtocol: (id, data) =>
            set((state) => ({
                trainingProtocolAll: state.trainingProtocolAll.map((protocol: { id: number; }) =>
                    protocol.id === id
                        ? { ...protocol, ...data }
                        : protocol
                ),
            })),

        trainingProtocolUpdate: null,
        setTrainingProtocolUpdate: (training) => set({ trainingProtocolUpdate: training }),
        clearTrainingProtocolUpdate: () => set({ trainingProtocolUpdate: null }),
    }),
);
