const generatedSVG = async (steamData: any) => {
    let result: any = ''

    let gamesCount:number = steamData['recentGames'].length;
    let gamesStatus: string = gamesCount?'Recently Played':'No Recently Played Games';
    result = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="500" height="300" viewBox="0 0 500 300"><defs></defs><g transform="matrix(5 0 0 5 250 150)"><rect style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;"  x="-45" y="-25" rx="0" ry="0" width="90" height="50" /></g><g transform="matrix(0.65 0 0 0.5 97.5 97.21)"><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${steamData['picture']}" x="-55" y="-75" width="110" height="150"></image></g><g transform="matrix(1 0 0 1 150 150)" style=""><text xml:space="preserve" font-family="'Open Sans', sans-serif" font-size="18" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-90" y="5" >${gamesStatus}</tspan></text></g>`
    let matrixDist:number = 360/(gamesCount+1)
    let matrixValue: number = matrixDist
    for(let gameData of steamData['recentGames']) {
        result = result +  `<g transform="matrix(1 0 0 1 ${matrixValue} 200)"><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${gameData['picture']}"  x="-27.5" y="-37.5" width="55" height="75"></image></g>`
        matrixValue = matrixValue + matrixDist;
    }
    result = result + `<g transform="matrix(2 0 0 2 275 90)"><text xml:space="preserve" font-family="'Open Sans', sans-serif" font-size="18" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-59" y="5.65" >${steamData['name']}</tspan></text></g></svg>`
    return result
}

export default {generatedSVG}