export interface TrainingHistory {
    id: number,
    user_id: number,
    training_id: number,
    training_name: string,
    training_protocol: string,
    started_at: string,
    finished_at: string,
    duration_minutes: string,
    intensity: string,
    status: string,
    xp_earned: number,
    comment: string,
    coach_comment: string
}

export interface TrainingHistoryCreated {
    user_id: number,
    training_id?: number,
    training_name: string,
    description: string,
    type_training: string,
    training_protocol: string,
    started_at: string,
    finished_at: string,
    duration_minutes: string,
    intensity: string,
    status: string,
    xp_earned: number,
    comment: string,
    coach_comment: string
}

export interface TrainingHistoryUpdated {
    finished_at?: string,
    duration_minutes?: string,
    intensity?: string,
    status?: string,
    xp_earned?: number,
    comment?: string,
    coach_comment?: string
}