/* export interface Training {
    id: string,
    name: string,
    training_type: string,
    description: string,
    is_active: boolean,
    trainer_id?: number
} */

export interface TrainingCreated {
    name: string,
    training_type: string,
    description: string,
    is_active: boolean
}

export interface Training {
    id: number;
    day: string;
    title: string;
    description: string;
    exercises: number;
    xp: number;
    status: "available" | "locked" | "complete" | "progress";
}