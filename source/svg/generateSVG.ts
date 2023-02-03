interface SteamData {
    name : string,
    picture: any,
    url: string,
    recentGames: Array<RecentGame>
}

interface RecentGame {
    name: string,
    picture: string,
    playTimeTwoWeeks: number,
    playTimeForever: number
}

const generatedSVG = async (steamData: SteamData, color: string) => {
    let result: any = ''
    let gamesCount:number = steamData['recentGames'].length;
    let height: number = 220 + gamesCount*80;
    let gamesStatus: string = gamesCount?'Recently Played':'No Recently Played Games';
    result = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="500" height="${height}" viewBox="0 0 500 ${height}"><defs></defs><g><rect style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: ${color}; fill-rule: nonzero; opacity: 1;"  x="0" y="0" width="500" height="${height}" /></g><g><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${steamData['picture']}" x="50" y="50" width="100" height="100"></image></g><g><text xml:space="preserve" font-family="'Indie Flower', cursive" font-size="34" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="175" y="100" >${steamData['name']}</tspan></text></g><g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="28" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="50" y="200" >${gamesStatus}</tspan></text></g>`
    let pictHeight: number = 220
    for(let gameData of steamData['recentGames']) {
        result = result +  `<g><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${gameData['picture']}"  x="50" y="${pictHeight}" width="50" height="50"></image> <text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="150" y="${pictHeight + 17.5}" >${gameData['name']}</tspan></text><text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="150" y="${pictHeight + 37.5}" >Recent: ${Math.round((gameData.playTimeTwoWeeks*5)/3)/100} hr Total: ${Math.round((gameData.playTimeForever*5)/3)/100} hr</tspan></text></g>`
        pictHeight = pictHeight + 80;
    }
    result = result + `</svg>`
    return result
}

export default {generatedSVG}