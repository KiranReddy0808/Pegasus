export interface SteamData {
    name : string,
    picture: any,
    url: string,
    status: string,
    recentGames: Array<RecentGame>
}

export interface RecentGame {
    name: string,
    picture: string,
    playTimeTwoWeeks: number,
    playTimeForever: number
}