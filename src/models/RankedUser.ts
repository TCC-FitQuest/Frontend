export interface RankedUser {
    id: number
    name: string
    xp: number
    level: number
    avatar?: string | null
    position: number
    isCurrentUser: boolean
}