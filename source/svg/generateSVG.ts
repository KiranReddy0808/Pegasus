import type {SVGModel} from "../models"

const SVG = (data: SVGModel, color: string) => {
    let itemsCount:number = data['items'].length;
    let height: number = 220 + itemsCount*80;
    let status: string = data.status;
    let result: string = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="1000" height="${height}" viewBox="0 0 1000 ${height}"><defs></defs><g><rect style="fill: ${color};"  x="0" y="0" width="750" height="${height}" /></g><g><image xlink:href="data:image/png;base64,${escapeHtml(data['picture'])}" x="50" y="50" width="100" height="100"></image></g><g><text xml:space="preserve" font-family="'Indie Flower', cursive" font-size="34" ><tspan x="175" y="100" >${escapeHtml(data['name'])}</tspan></text></g><g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="28" ><tspan x="50" y="200" >${escapeHtml(status)}</tspan></text></g><g><text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15"  ><tspan x="180" y="130" >`
    for(let key in data.meta) {
        let val: any = (data.meta as any)[key]
        result += `${escapeHtml(changeCase(key))} : ${escapeHtml(val.toString())} `
    }
    result += `</tspan></text></g>`
    let pictHeight: number = 220
    for(let item of data['items']) {
        let pictureSize = item.pictureSize?item.pictureSize:"50"
        let metaFontSize = item.metaFontSize?item.metaFontSize:"15"
        result +=  `<g><image  xlink:href="data:image/png;base64,${escapeHtml(item['picture'])}"  x="50" y="${pictHeight}" width="${pictureSize}" height="${pictureSize}"></image> <text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" ><tspan x="150" y="${pictHeight + 17.5}" >${escapeHtml(item['name'])}</tspan></text></g><g><text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="${metaFontSize}" ><tspan x="150" y="${pictHeight + 37.5}" >`
        for(let key in item.meta) {
            let val: any = (item.meta as any)[key]
            result += `${escapeHtml(changeCase(key))} : ${escapeHtml(val.toString())} `
        }
        result += `</tspan></text></g>`
        pictHeight = pictHeight + 80;
    }
    result = result + `</svg>`

    return result
}

const OWSVG = (data: any) => {
    let result: string = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="1000" height="750" viewBox="0 0 1000 1000"><defs></defs><g><rect style=" fill: ${data.color};"  x="0" y="0" width="750" height="750" /></g><g>
    
    <image  xlink:href="data:image/png;base64,${escapeHtml(data['picture'])}" x="50" y="50" width="100" height="100"></image>
    <image  xlink:href="data:image/svg+xml;base64,${escapeHtml(data['endorsement'])}" x="175" y="100" width="60" height="60"></image></g><g><text xml:space="preserve" font-family="'Indie Flower', cursive" font-size="34" ><tspan x="175" y="100" >${escapeHtml(data['name'])}</tspan></text></g>
    
    <g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="28" ><tspan x="50" y="200" >Quickplay </tspan></text></g>
    <g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="20" ><tspan x="50" y="230" >won: ${data.quickplay.won} played: ${data.quickplay.played} playtime: ${data.quickplay.time} hr </tspan></text></g>

    <g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="28" ><tspan x="50" y="270" >Competitive </tspan></text></g>
    <g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="20" ><tspan x="50" y="300" >won: ${data.competitive.won} played: ${data.competitive.played} playtime: ${data.competitive.time} hr </tspan></text></g>`
    
    if(data.rank.length > 0) {
        result += `<g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="28" ><tspan x="50" y="370" >Rank </tspan></text></g>`
        let height = 370;
        for(let rank of data.rank) {
            result += `<g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="20" ><tspan x="50" y="${height + 30}" >${rank['type']} : ${rank['rank']}</tspan></text>
            <image  xlink:href="data:image/png;base64,${escapeHtml(rank['image'])}" x="40" y="${height + 50}" width="75" height="75"></image> </g> `;
            height += 120
        }
    }
        
    result += `</svg>`
    return result;
}



function escapeHtml(text : string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function changeCase (text: String) {
    const result = text.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}


export default {SVG, OWSVG}


