// src/store/useTimerStore.ts
import { create } from 'zustand';

interface TimerState {
    timer: string;             // Texto formatado "MM:SS"
    remainingSeconds: number;  // Útil se quiser esconder o componente quando chegar a 0
    intervalId: ReturnType<typeof setInterval> | null;
    startTimer: (seconds: number) => void;
    stopTimer: () => void;
    resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    timer: "00:00",
    remainingSeconds: 0,
    intervalId: null,

    startTimer: (seconds: number) => {
        const currentInterval = get().intervalId;
        if (currentInterval) clearInterval(currentInterval);

        // Calcula a exata hora no futuro que o temporizador deve zerar
        const endTime = Date.now() + seconds * 1000;

        // Função auxiliar para formatar os segundos em "MM:SS"
        const formatTime = (secs: number) => {
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        };

        // Atualiza a UI imediatamente para não ter "delay" de 1 segundo
        set({
            timer: formatTime(seconds),
            remainingSeconds: seconds
        });

        const interval = setInterval(() => {
            const now = Date.now();
            // Math.max garante que não teremos números negativos caso passe de zero
            const timeLeft = Math.max(0, Math.round((endTime - now) / 1000));

            if (timeLeft === 0) {
                clearInterval(interval);
                set({ timer: "00:00", remainingSeconds: 0, intervalId: null });
                return;
            }

            set({
                timer: formatTime(timeLeft),
                remainingSeconds: timeLeft
            });
        }, 1000);

        set({ intervalId: interval });
    },

    stopTimer: () => {
        const currentInterval = get().intervalId;
        if (currentInterval) clearInterval(currentInterval);
        set({ intervalId: null });
    },

    resetTimer: () => {
        const currentInterval = get().intervalId;
        if (currentInterval) clearInterval(currentInterval);
        set({ timer: "00:00", remainingSeconds: 0, intervalId: null });
    }
}));