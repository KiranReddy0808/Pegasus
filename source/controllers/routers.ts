/** source/controllers/posts.ts */
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';



// getting Steam Summary
const steamSummary = async (req: Request, res: Response, next: NextFunction) => {

    let steamKey:any = process.env.STEAM_KEY;
    let steamId: string = req.params.id;
    let result: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
    console.log(result)
    let steamSummaryPayload: any = result.data;
    return res.status(200).json({
        data: steamSummaryPayload
    });
};

// get Steam Recently played
const steamRecentlyPlayed = async (req: Request, res: Response, next: NextFunction) => {

    let steamKey:any = process.env.STEAM_KEY;
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
    let catStream: any = await await axios.get(catto, {responseType: 'arraybuffer'})
    let catImage: any = Buffer.from(catStream.data)
    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': catImage.length
      });
    res.end(catImage); 
}

const steamSummarySvg = async (req: Request, res: Response, next: NextFunction) => {

    //let steamId: string = req.params.id;
    //let result: AxiosResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&format=json`);
    //let steamRecentlyPlayedPayload: any = result.data;
    res.setHeader('content-type', 'image/svg+xml')
    res.status(200).send('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" height="100" width="100"> <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />Sorry, your browser does not support inline SVG. </svg>')

}




export default { steamSummary, steamRecentlyPlayed, dailyCatto, steamSummarySvg};