
import api from './api'

export async function saveProtocol({
    protocolId,
    protocol,
    workouts,
    userId,

}: any) {
    let currentProtocolId = protocolId

    if (protocolId) {
        await api.put(`/api/training_protocol/${protocolId}`, protocol)
    } else {
        const res = await api.post('/api/training_protocol/', protocol)
        currentProtocolId = res.data.id

        await api.post('/api/user_protocol/', {
            user_id: userId,
            training_id: currentProtocolId,
        })
    }

    for (const workout of workouts) {
        const workoutPayload = {
            day: 'string',
            title: workout.name,
            exercises: 0,
            xp: 0,
            status: 'string',
            type: 'string',
            training_id: currentProtocolId,
        }

        const workoutId =
            typeof workout.id === 'number'
                ? workout.id
                : (await api.post('/api/training/', workoutPayload)).data.id

        if (typeof workout.id === 'number') {
            await api.put(`/api/training/${workout.id}`, workoutPayload)
        }

        for (const exercise of workout.exercises) {
            const exercisePayload = {
                name: exercise.name,
                training_id: workoutId,
                video_url: exercise.media.url,
                status: 'string',
            }

            const exerciseId =
                typeof exercise.id === 'number'
                    ? exercise.id
                    : (await api.post('/api/exercise/', exercisePayload)).data.id

            if (typeof exercise.id === 'number') {
                await api.put(`/api/exercise/${exercise.id}`, exercisePayload)
            }

            for (let i = 0; i < exercise.sets.length; i++) {
                const set = exercise.sets[i]

                const setPayload = {
                    set_number: i + 1,
                    reps: set.reps,
                    rest: set.rest,
                    details: 'string',
                    completed: false,
                }

                if (set.id) {
                    await api.put(`/api/exercise/sets/${set.id}`, setPayload)
                } else {
                    await api.post(`/api/exercise/${exerciseId}/sets`, setPayload)
                }
            }
        }
    }

    return currentProtocolId
}

export async function deleteProtocols(protocolId: number) {
    const res = await api.delete(`/api/training_protocol/${protocolId}`)
    return res.data
}

export async function getUsersProtocols(protocolId: number) {
    const res = await api.get(`/api/user_protocol/training/${protocolId}`)
    return res.data
}   