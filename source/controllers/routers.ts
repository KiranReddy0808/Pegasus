/** source/controllers/posts.ts */
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
import generateSVG from '../svg/generateSVG';

interface SteamData {
    name : string,
    picture: any,
    url: string,
    recentGames: Array<RecentGame>
}

interface RecentGame {
    name: string,
    picture: string,
    playTimeTwoWeeks: number
}



// getting Steam Summary
const steamSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = req.params.id;
        let result: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
        console.log(result)
        let steamSummaryPayload: any = result.data;
        return res.status(200).json({
            data: steamSummaryPayload
        });
    }
    catch(err) {
        const error = new Error('Server Unavilable.');
        return res.status(500).json({
            message: error.message
        });
    }
    
};

// get Steam Recently played
const steamRecentlyPlayed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = req.params.id;
        let result: AxiosResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&format=json`);
        let steamRecentlyPlayedPayload: any = result.data;
        return res.status(200).json({
            data :steamRecentlyPlayedPayload
        });
    }
    catch(err) {
        const error = new Error('Server Unavilable.');
        return res.status(500).json({
            message: error.message
        });
    }

}

const dailyCatto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let result: AxiosResponse = await axios.get(`https://api.thecatapi.com/v1/images/search`);
        let catto: any = result.data[0].url;
        let catStream: any = await axios.get(catto, {responseType: 'arraybuffer'})
        let catImage: any = Buffer.from(catStream.data)
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': catImage.length
        });
        res.end(catImage); 
    }
    catch(err) {
        const error = new Error('Server Unavilable.');
        return res.status(500).json({
            message: error.message
        });
    }

        
}

const steamSummarySvg = async (req: Request, res: Response, next: NextFunction) => {

    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = req.params.id;
        let summaryResult: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
        let recentlyPlayedResult: AxiosResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&format=json`);
        
        let steamData: SteamData = {name : '', picture: '', url: '', recentGames: []  };
        steamData['name'] = summaryResult.data.response.players[0].personaname;
        steamData['picture'] = Buffer.from(await (await axios.get(summaryResult.data.response.players[0].avatar, {responseType: 'arraybuffer'})).data).toString('base64');
        steamData['url'] = summaryResult.data.response.players[0].profileurl;
        
        for(let recentGame of recentlyPlayedResult.data.response.games) {
            let gameImage: any =  Buffer.from (await (await axios.get(`http://media.steampowered.com/steamcommunity/public/images/apps/${recentGame.appid}/${recentGame.img_icon_url}.jpg`, {responseType: 'arraybuffer'})).data).toString('base64');
            steamData['recentGames'].push({name: recentGame.name, picture: gameImage, playTimeTwoWeeks: recentGame.playtime_2weeks })
        }
        let steamRecentlyPlayedPayload: any = recentlyPlayedResult.data;
        let recentlyPlayedPayload: any = summaryResult.data
        let svg: any = await generateSVG.generatedSVG(recentlyPlayedPayload, steamRecentlyPlayedPayload);
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" height="100" width="100"> <image xlink:href ="data:image/png;base64,${steamData['picture']}"/><image xlink:href ="data:image/png;base64,${steamData['recentGames'][0]['picture']}"/><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />Sorry, your browser does not support inline SVG. </svg>`)
    }
    catch(err) {
        const error = new Error('Server Unavilable.');
        return res.status(500).json({
            message: error.message
        });
    }
}




export default { steamSummary, steamRecentlyPlayed, dailyCatto, steamSummarySvg};