import type {SteamData, PsnData} from "../models"
import fs from "fs";
import axios from "axios";
import sharp from 'sharp';

const generatedSVG = async (steamData: SteamData, color: string) => {
    let result: any = ''
    let gamesCount:number = steamData['recentGames'].length;
    let height: number = 220 + gamesCount*80;
    let gamesStatus: string = gamesCount?'Recently Played':'No Recently Played Games';
    result = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="750" height="${height}" viewBox="0 0 750 ${height}"><defs></defs><g><rect style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: ${color}; fill-rule: nonzero; opacity: 1;"  x="0" y="0" width="750" height="${height}" /></g><g><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${steamData['picture']}" x="50" y="50" width="100" height="100"></image></g><g><text xml:space="preserve" font-family="'Indie Flower', cursive" font-size="34" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="175" y="100" >${escapeHtml(steamData['name'])}</tspan></text>
    <text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="180" y="130" >${escapeHtml(steamData['status'])}</tspan></text></g><g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="28" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="50" y="200" >${escapeHtml(gamesStatus)}</tspan></text></g>`
    let pictHeight: number = 220
    for(let gameData of steamData['recentGames']) {
        result = result +  `<g><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${escapeHtml(gameData['picture'])}"  x="50" y="${pictHeight}" width="50" height="50"></image> <text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="150" y="${pictHeight + 17.5}" >${escapeHtml(gameData['name'])}</tspan></text><text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="150" y="${pictHeight + 37.5}" >Recent: ${Math.round((gameData.playTimeTwoWeeks*5)/3)/100} hr Total: ${Math.round((gameData.playTimeForever*5)/3)/100} hr</tspan></text></g>`
        pictHeight = pictHeight + 80;
    }
    result = result + `</svg>`

    return result
}

const generatedPSNSVG = async (psnData: PsnData, color: string) => {
    let result: any = ''
    let gamesCount:number = psnData['games'].length;
    let height: number = 220 + gamesCount*80;
    let gamesStatus: string = gamesCount?'Played Games':'Game Data is Private';
    let profileImageBuffer = Buffer.from(await (await axios.get(psnData.picture, {responseType: 'arraybuffer'})).data)
    let profileImage = (await sharp(profileImageBuffer).webp({quality: 50}).toBuffer()).toString('base64')
    result = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="700" height="${height}" viewBox="0 0 700 ${height}"><defs></defs><g><rect style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: ${color}; fill-rule: nonzero; opacity: 1;"  x="0" y="0" width="700" height="${height}" /></g><g><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${profileImage}" x="50" y="50" width="100" height="100"></image></g><g><text xml:space="preserve" font-family="'Indie Flower', cursive" font-size="34" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="175" y="100" >${escapeHtml(psnData['onlineId'])}</tspan></text>
    <text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="180" y="130" >PS Plus: ${psnData['isPSPlus']}</tspan></text></g><g><text xml:space="preserve" font-family="'Amatic SC', cursive" font-size="28" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="50" y="200" >${escapeHtml(gamesStatus)}</tspan></text></g>`
    let pictHeight: number = 220
    for(let gameData of psnData['games']) {
        let gameImageBuffer = Buffer.from(await (await axios.get(gameData.picture, {responseType: 'arraybuffer'})).data)
        let gameImage = (await sharp(gameImageBuffer).webp({quality: 50}).toBuffer()).toString('base64')
        result = result +  `<g><image style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"  xlink:href="data:image/png;base64,${gameImage}"  x="50" y="${pictHeight}" width="50" height="50"></image> <text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="15" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="150" y="${pictHeight + 17.5}" >${escapeHtml(gameData['name'])}</tspan></text><text xml:space="preserve" font-family="'Lucida Console', Monaco, monospace" font-size="10" font-style="normal" font-weight="normal" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="150" y="${pictHeight + 37.5}" >Bronze: ${gameData.earnedTrophies.bronze}/${gameData.definedTrophies.bronze} Silver: ${gameData.earnedTrophies.silver}/${gameData.definedTrophies.silver} Gold: ${gameData.earnedTrophies.gold}/${gameData.definedTrophies.gold} Platinum: ${gameData.earnedTrophies.platinum}/${gameData.definedTrophies.platinum}</tspan></text></g>`
        pictHeight = pictHeight + 80;
    }
    result = result + `</svg>`

    return result
}


function escapeHtml(text : string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

export default {generatedSVG, generatedPSNSVG}