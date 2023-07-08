import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
import generateSVG from '../svg/generateSVG';
import { exchangeCodeForAccessToken, exchangeNpssoForCode, getUserTitles, makeUniversalSearch, getProfileFromAccountId} from "psn-api";
import type {SteamData, PsnData} from "../models"


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
        let [profileResult, gameResult] = await Promise.all([fetchPlayerSummary(steamKey, steamId), fetchGameSummary(steamKey, steamId) ])
        if(profileResult.data.response.players.length == 0) {
            return res.status(404).json('Player not found. Check if the status of the profile is public.')
        }
        let steamRecentlyPlayedPayload: any = gameResult.data;
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

const fetchPlayerSummary = async (steamKey: string, steamId: string) => {
    let profileResult: AxiosResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`);
    return profileResult
}

const fetchGameSummary = async (steamKey: string, steamId: string) => {
    let gameResult: AxiosResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamId}&format=json`);
    return gameResult
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
    let states: Array<string> = ['Offline', 'Online', 'Busy','Away','Snooze','Looking to trade', 'Looking to play']
    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = req.params.id;
        let color:string = req.query.color?((typeof req.query.color == 'string')?req.query.color:'white'): 'white';
        let [summaryResult, recentlyPlayedResult] = await Promise.all([fetchPlayerSummary(steamKey, steamId), fetchGameSummary(steamKey, steamId)])
        if(summaryResult.data.response.players.length == 0) {
            return res.status(404).json("Steam User Not Found.");
        }
        let profilePicture = Buffer.from(await (await axios.get(summaryResult.data.response.players[0].avatar, {responseType: 'arraybuffer'})).data).toString('base64');
        let statusNumber: number = summaryResult.data.response.players[0].personastate
        let steamData: SteamData = {name : summaryResult.data.response.players[0].personaname, picture: profilePicture, url: summaryResult.data.response.players[0].profileurl, recentGames: [], status: states[statusNumber]?states[statusNumber]:states[0]};
        let recentGames: any = recentlyPlayedResult.data.response.games
        if(recentGames) {
            await Promise.all(recentGames.map(async (recentGame: any) => {
                    let gameImage: any =  Buffer.from (await (await axios.get(`http://media.steampowered.com/steamcommunity/public/images/apps/${recentGame.appid}/${recentGame.img_icon_url}.jpg`, {responseType: 'arraybuffer'})).data).toString('base64');
                    steamData['recentGames'].push({name: recentGame.name, picture: gameImage, playTimeTwoWeeks: recentGame.playtime_2weeks, playTimeForever: recentGame.playtime_forever })
            }))
        }
        
        let svg: any = generateSVG.generatedSVG(steamData, color);
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(svg)
    }
    catch(err) {
        const error = new Error('Unable to Handle Request.');
        console.log(err)
        return res.status(500).json(error.message);
    }
}

const psnData = async (psnId: string) => {
    let npssoID: any = process.env.NPSSO
    const accessCode = await exchangeNpssoForCode(npssoID);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    const allAccountsSearchResults = await makeUniversalSearch(
        authorization,
        psnId,
        "SocialAllAccounts"
    );

    if(allAccountsSearchResults.domainResponses[0].results.length == 0) {
        throw new Error('No User Found.')
    }

    const accData: any = allAccountsSearchResults.domainResponses[0].results[0].socialMetadata
    const trophyTitlesResponse: any = await getUserTitles(
        { accessToken: authorization.accessToken },
        accData.accountId
    );
    let psnUserData: PsnData = {name: accData.verifiedUserName?accData.verifiedUserName:'',onlineId: accData.onlineId, isPSPlus: accData.isPsPlus, accountId: accData.accountId, picture: accData.avatarUrl, games: [] }
    if(trophyTitlesResponse.trophyTitles) {
        const gamesData = (trophyTitlesResponse.trophyTitles.length>10)?trophyTitlesResponse.trophyTitles.slice(0,10):trophyTitlesResponse.trophyTitles
        for(const gameData of gamesData) {
            psnUserData.games.push({name: gameData.trophyTitleName, picture: gameData.trophyTitleIconUrl, earnedTrophies: gameData.earnedTrophies, definedTrophies: gameData.definedTrophies, platform: gameData.trophyTitlePlatform  })
        }
    }
    
    return psnUserData
}

const psnMeData = async () => {
    let npssoID: any = process.env.NPSSO
    let psOwnerId: any = process.env.PS_OWNER_ID
    const accessCode = await exchangeNpssoForCode(npssoID);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    const accData: any = await getProfileFromAccountId(authorization, psOwnerId)
    const trophyTitlesResponse: any = await getUserTitles(
        { accessToken: authorization.accessToken },
        psOwnerId
    );
    let psnUserData: PsnData = {name: accData.personalDetail?(accData.personalDetail.firstName + ' '+ accData.personalDetail.lastName): '', onlineId: accData.onlineId, isPSPlus: accData.isPlus, accountId: psOwnerId, picture: accData.personalDetail?accData.personalDetail.profilePictures[0].url:'', games: [] }
    if(trophyTitlesResponse.trophyTitles) {
        const gamesData = (trophyTitlesResponse.trophyTitles.length>10)?trophyTitlesResponse.trophyTitles.slice(0,10):trophyTitlesResponse.trophyTitles
        for(const gameData of gamesData) {
            psnUserData.games.push({name: gameData.trophyTitleName, picture: gameData.trophyTitleIconUrl, earnedTrophies: gameData.earnedTrophies, definedTrophies: gameData.definedTrophies, platform: gameData.trophyTitlePlatform  })
        }
    }
    return psnUserData


}

const psnSummary = async (req: Request, res: Response, next: Function) => {
    try {
        let psnId: string = req.params.id;
        const psnUserData =(psnId == "me")?await psnMeData(): await psnData(psnId)
        res.status(200).json({
            data : {psnUserData}
        });
    }
    catch(err) {

        console.log(err)

        if(err instanceof Error && err.message.includes("No User Found")) {
            return res.status(404).json(err.message)
        }
        else {
            const error = new Error('Unable to Handle Request.');
            return res.status(500).json(error.message);
        }
    }
    
}

const psnSummarySVG = async (req: Request, res: Response, next: Function) => {
    try {
        let psnId: string = req.params.id;
        let color: string = req.query.color?((typeof req.query.color == 'string')?req.query.color:'white'): 'white';
        let psnUserData = (psnId == "me")?await psnMeData():(await psnData(psnId))
        let svg: any = await generateSVG.generatedPSNSVG(psnUserData, color);
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(svg)
    }
    catch(err) {

        console.log(err)

        if(err instanceof Error && err.message.includes("No User Found")) {
            return res.status(404).json(err.message)
        }
        else {
            const error = new Error('Unable to Handle Request.');
            return res.status(500).json(error.message);
        }
    }
    
}

const moonPhaseSVG = async (req: Request, res: Response, next: Function) => {
    try {
        let appId: any = process.env.ASTRO_APP_ID;
        let appSecret: any = process.env.ASTRO_APP_SECRET;
        let latitude: number = req.query.lat?((typeof req.query.lat == 'string' && !!parseInt(req.query.lat))?parseInt(req.query.lat):17.387140):17.387140
        let longitude: number = req.query.long?((typeof req.query.long == 'string' && !!parseInt(req.query.long))?parseInt(req.query.long):78.491684):78.491684
        let currDate: any = (new Date()).toISOString().split('T')[0];
        let date: any = req.query.date?((typeof req.query.date == 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(req.query.date))?req.query.date: currDate):currDate
        let dataForm: object = {
            "format": "png",
            "style": {
                "moonStyle": "default",
                "backgroundStyle": "stars",
                "backgroundColor": "red",
                "headingColor": "white",
                "textColor": "red"
            },
            "observer": {
                "latitude": latitude,
                "longitude": longitude,
                "date": date
            },
            "view": {
                "type": "portrait-simple",
                "orientation": "south-up"
            }
        }
        let moonPhase: AxiosResponse = await axios({
                method: "post",
                url: "https://api.astronomyapi.com/api/v2/studio/moon-phase",
                data: dataForm,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    Authorization : `Basic ${btoa(
                        `${appId}:${appSecret}`
                      )}`
                }
            })

        let resultSVG: AxiosResponse = await axios.get(moonPhase.data.data.imageUrl, {responseType: 'arraybuffer'});
        let moonImage: any = Buffer.from(resultSVG.data)
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': moonImage.length
        });
        res.end(moonImage);
        }
        catch(err) {
            console.log(err)
            return res.status(500).json('Unable to handle request.')
        }
    
}




export default { steamSummary, steamRecentlyPlayed, dailyCatto, steamSummarySvg, dailyDoggo, psnSummary, psnSummarySVG, moonPhaseSVG};