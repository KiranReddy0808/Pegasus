/** source/controllers/posts.ts */
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';

let steamKey:any = process.env.STEAM_KEY;


// getting Steam Summary
const steamSummary = async (req: Request, res: Response, next: NextFunction) => {

    let steamId: string = req.params.id;
    console.log(process.env.STEAM_KEY)
    let result: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
    let steamSummaryPayload: any = result.data;
    return res.status(200).json({
        data: steamSummaryPayload
    });
};

// get Steam Recently played
const steamRecentlyPlayed = async (req: Request, res: Response, next: NextFunction) => {

    let steamId: string = req.params.id;
    let result: AxiosResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&format=json`);
    let steamRecentlyPlayedPayload: any = result.data;
    return res.status(200).json({
        data :steamRecentlyPlayedPayload
    });
}

const dailyCatto = async (req: Request, res: Response, next: NextFunction) => {

    let result: AxiosResponse = await axios.get(`https://api.thecatapi.com/v1/images/search`);
    let catto: any = result.data[0].url;
    let resultImage: AxiosResponse = await axios.get(catto);
    //res.append('Content-Type', 'image/png');
    return res.status(200).json(catto);
}




export default { steamSummary, steamRecentlyPlayed, dailyCatto};