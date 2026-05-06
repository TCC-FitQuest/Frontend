import api from './api';

export async function getTrainingByType(training_type: string): Promise<any> {
    const response = await api.get<any>(`/api/training_protocol/Type/${training_type}`);
    return response.data;
}

export async function getTrainingById(training_protocol_id: number): Promise<any> {
    const response = await api.get<any>(`/api/training_protocol/${training_protocol_id}`);
    return response.data;
}

export async function getTrainingByUserId(user_id: number): Promise<any> {
    const response = await api.get<any>(`/api/training_protocol/users/${user_id}`);
    return response.data;
}

export async function getTrainingWeekByTrainingId(training_id: number): Promise<any> {
    const response = await api.get<any>(`/api/training/training/${training_id}`);
    return response.data;
}

export async function getTrainingExerciseWeekById(week_id: number): Promise<any> {
    const response = await api.get<any>(`/api/exercise/week/${week_id}`);
    return response.data;
}

export async function updateTraining(training_id: number, data: any) {
    const res = await api.put(`/api/training_week/${training_id}`, data);
    return res.data;
}


export async function createdHistory(data: any) {
    const res = await api.post(`/api/workout_history/`, data);
    return res.data;
}

export async function getUserHistory(user_id: number): Promise<any> {
    const response = await api.get<any>(`/api/workout_history/user/${user_id}`);
    return response.data;
}