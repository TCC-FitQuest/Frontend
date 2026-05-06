import axios from './api';

export async function updateExerciseSet(setId: number, data: any) {
    const res = await axios.put(`/api/exercise/${setId}`, data);
    return res.data;
}
