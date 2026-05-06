import { TrainingHistoryCreated, TrainingHistoryUpdated } from '../models/TrainingHistory';
import api from './api';

export async function createdTrainingHistory(data: TrainingHistoryCreated) {
    const res = await api.post(`/api/training_history/`, data);
    return res.data;
}

export async function updateTrainingHistory(trainingHistoryId: number, data: TrainingHistoryUpdated) {
    const res = await api.put(`/api/training_history/${trainingHistoryId}`, data);
    return res.data;
}

export async function getTrainingHistoryWeek(userId: string, training_type: string) {
    const res = await api.get(`/api/training_history/user/${userId}/type/${training_type}/current-week`);
    return res.data;
}

export async function getTrainingHistoryByUserId(userId: string) {
    const res = await api.get(`/api/training_history/user/${userId}`);
    return res.data;
}

export async function getLastExercisesStats(exerciseIds: number[]) {
    try {
        const response = await api.post('api/exercise_set_history/last-stats', {
            exercise_ids: exerciseIds
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar histórico das séries:", error);
        return [];
    }
}

// Salva todas as séries realizadas de uma vez só
export async function saveBulkExerciseSets(setsData: any[]) {
    try {
        const response = await api.post('api/exercise_set_history/bulk', setsData);
        return response.data;
    } catch (error) {
        console.error("Erro ao salvar séries em bulk:", error);
        throw error;
    }
}

export async function getUserProgression(userId: number) {
    try {
        const response = await api.get(`api/exercise_set_history/user/${userId}/progression`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar progressão do usuário:", error);
        return [];
    }
}