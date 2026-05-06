export interface UserType {
    id: string,
    username: string,
    email: string,
    password?: string,
    avatar: string,
    avatar_seed: string | null,
    bio: string,
    access_token: string,
    level: number,
    xp: number,
    season_points: number,
    badges_count: number,
    created_at: Date,
    updated_at: Date
    active_protocol_id?: number | null,
}

/* export interface UserCreated {
    username: string,
    email: string,
    password: string,
} */


export interface UserLogin {
    email: string;
    password: string;
}

export type UserRole = 'user' | 'trainer';

export interface UserCreated {
    username: string;
    email: string;
    password: string;
    type: UserRole;
    avatar?: string;
    bio?: string;
    active_protocol_id?: number | null;
}

export interface LoginPayload {
    email: string;
    password: string;
}
