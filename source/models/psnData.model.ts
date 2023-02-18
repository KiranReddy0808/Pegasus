export interface PsnData {
    name : string,
    accountId: string,
    onlineId: string,
    isPSPlus: boolean,
    picture: string,
    games: Array<PSGames>
}

export interface PSGames {
    name : string,
    picture: string,
    earnedTrophies: Trophies,
    definedTrophies: Trophies,
    platform: string
}

export interface Trophies {
    bronze: number,
    silver: number,
    gold: number,
    platinum: number
}