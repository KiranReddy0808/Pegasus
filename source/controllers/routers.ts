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
    playTimeTwoWeeks: number,
    playTimeForever: number
}



const steamSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = req.params.id;
        let result: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
        let steamSummaryPayload: any = result.data;
        if(result.data.response.players.length == 0) {
            return res.status(404).json('Player not found. Check if the status of the profile is public.')
        }
        return res.status(200).json({
            data: steamSummaryPayload
        });
    }
    catch(err) {
        const error = new Error('Unable to Handle Request.');
        return res.status(500).json(error.message);
    }
    
};

const steamRecentlyPlayed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = req.params.id;
        let profileResult: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
        if(profileResult.data.response.players.length == 0) {
            return res.status(404).json('Player not found. Check if the status of the profile is public.')
        }
        let result: AxiosResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&format=json`);
        let steamRecentlyPlayedPayload: any = result.data;
        return res.status(200).json({
            data :steamRecentlyPlayedPayload
        });
    }
    catch(err) {
        const error = new Error('Unable to Handle Request.');
        console.log(err)
        return res.status(500).json(error.message);
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
        const error = new Error('Unable to Handle Request.');
        return res.status(500).json(error.message);
    }

        
}

const dailyDoggo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let result: AxiosResponse = await axios.get(`https://api.thedogapi.com/v1/images/search`);
        let doggo: any = result.data[0].url;
        let dogStream: any = await axios.get(doggo, {responseType: 'arraybuffer'})
        let dogImage: any = Buffer.from(dogStream.data)
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': dogImage.length
        });
        res.end(dogImage); 
    }
    catch(err) {
        const error = new Error('Unable to Handle Request.');
        return res.status(500).json(error.message);
    }

        
}

const steamSummarySvg = async (req: Request, res: Response, next: NextFunction) => {

    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = req.params.id;
        let color:string = req.query.color?((typeof req.query.color == 'string')?req.query.color:'white'): 'white';
        let summaryResult: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
        if(summaryResult.data.response.players.length == 0) {
            return res.status(404).json("Steam User Not Found.");
        }
        let recentlyPlayedResult: AxiosResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&format=json`);
        let steamData: SteamData = {name : '', picture: '', url: '', recentGames: []  };
        steamData['name'] = summaryResult.data.response.players[0].personaname;
        steamData['picture'] = Buffer.from(await (await axios.get(summaryResult.data.response.players[0].avatar, {responseType: 'arraybuffer'})).data).toString('base64');
        steamData['url'] = summaryResult.data.response.players[0].profileurl;
        if(recentlyPlayedResult.data.response.games) {
            for(let recentGame of recentlyPlayedResult.data.response.games) {
                let gameImage: any =  Buffer.from (await (await axios.get(`http://media.steampowered.com/steamcommunity/public/images/apps/${recentGame.appid}/${recentGame.img_icon_url}.jpg`, {responseType: 'arraybuffer'})).data).toString('base64');
                steamData['recentGames'].push({name: recentGame.name, picture: gameImage, playTimeTwoWeeks: recentGame.playtime_2weeks, playTimeForever: recentGame.playtime_forever })
            }
        }
        
        let svg: any = await generateSVG.generatedSVG(steamData, color);
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(svg)
    }
    catch(err) {
        const error = new Error('Unable to Handle Request.');
        console.log(err)
        return res.status(500).json(error.message);
    }
}




export default { steamSummary, steamRecentlyPlayed, dailyCatto, steamSummarySvg, dailyDoggo};