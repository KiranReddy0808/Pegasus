import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
import generateSVG from '../svg/generateSVG';
import { exchangeCodeForAccessToken, exchangeNpssoForCode, getUserTitles, makeUniversalSearch, getProfileFromAccountId} from "psn-api";
import type { SVGModel} from "../models"

class dataSVG {
    name: string
    picture: string
    items: Array<any>
    status: string
    meta: object

    constructor(name: string, picture: string) {
        this.name = name
        this.picture = picture
        this.items = []
        this.status = ''
        this.meta = {}
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

const steamSummarySvg = async (req: Request, res: Response, next: NextFunction) => {
    let states: Array<string> = ['Offline', 'Online', 'Busy','Away','Snooze','Looking to trade', 'Looking to play']
    try {
        let steamKey:any = process.env.STEAM_KEY;
        let steamId: string = escape(req.params.id);
        let color:string = req.query.color?((typeof req.query.color == 'string')?escape(req.query.color):'white'): 'white';
        let [summaryResult, recentlyPlayedResult] = await Promise.all([fetchPlayerSummary(steamKey, steamId), fetchGameSummary(steamKey, steamId)])
        if(summaryResult.data.response.players.length == 0) {
            return res.status(404).json("Steam User Not Found.");
        }
        let profilePicture = Buffer.from(await (await axios.get(summaryResult.data.response.players[0].avatarfull, {responseType: 'arraybuffer'})).data).toString('base64');
        let statusNumber: number = summaryResult.data.response.players[0].personastate
        let data: SVGModel = new dataSVG(summaryResult.data.response.players[0].personaname, profilePicture)
        data.meta = {status: states[statusNumber]?states[statusNumber]:states[0] }

        let recentGames: any = recentlyPlayedResult.data.response.games
        data.status = recentGames?'Recently Played':'No Recently Played Games'
        if(recentGames) {
            await Promise.all(recentGames.map(async (recentGame: any) => {
                    let gameImage: any =  Buffer.from (await (await axios.get(`http://media.steampowered.com/steamcommunity/public/images/apps/${recentGame.appid}/${recentGame.img_icon_url}.jpg`, {responseType: 'arraybuffer'})).data).toString('base64');
                    data['items'].push({name: recentGame.name, picture: gameImage, meta: {recent : `${Math.round((recentGame.playtime_2weeks*5)/3)/100} hr`, total: `${Math.round((recentGame.playtime_forever*5)/3)/100} hr`  }})
            }))
        }
        
        let svg: any = generateSVG.SVG(data, color);
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(`${svg}`)
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

    return {profile: { name: accData.onlineId, isPSPlus: accData.isPsPlus, picture: accData.avatarUrl } ,trophy: trophyTitlesResponse}
}

const psnMeData = async (psnId: string) => {
    let npssoID: any = process.env.NPSSO
    
    const accessCode = await exchangeNpssoForCode(npssoID);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    const accData: any = await getProfileFromAccountId(authorization, psnId)
    const trophyTitlesResponse: any = await getUserTitles(
        { accessToken: authorization.accessToken },
        psnId
    );
    return {profile: { name: accData.onlineId, isPSPlus: accData.isPlus, picture: accData.personalDetail.profilePictures[0].url}, trophy: trophyTitlesResponse}
}

const psnSummarySVG = async (req: Request, res: Response, next: Function) => {
    try {
        let psnId: string = req.params.id;
        let psOwnerId: any = process.env.PS_OWNER_ID
        let color: string = req.query.color?((typeof req.query.color == 'string')?escape(req.query.color):'white'): 'white';
        let psData: any = (psnId == "me")?await psnMeData(psOwnerId):(await psnData(psnId))
        let profilePicture = Buffer.from(await (await axios.get(psData.profile.picture, {responseType: 'arraybuffer'})).data).toString('base64');
        let data = new dataSVG (psData.profile.name,profilePicture)
        data.meta = {plus: psData.profile.isPSPlus}
        data.status = psData.trophy.trophyTitles?'Played Games':'Game Data is Private';
        if(psData.trophy.trophyTitles) {
            const gamesData = (psData.trophy.trophyTitles.length>10)?psData.trophy.trophyTitles.slice(0,10):psData.trophy.trophyTitles
            await Promise.all(gamesData.map(async (gameData: any) => {
                let gameImage: any =  Buffer.from (await (await axios.get(gameData.trophyTitleIconUrl, {responseType: 'arraybuffer'})).data).toString('base64');
                let trophiesData = `Bronze: ${gameData.earnedTrophies.bronze}/${gameData.definedTrophies.bronze} Silver: ${gameData.earnedTrophies.silver}/${gameData.definedTrophies.silver} Gold: ${gameData.earnedTrophies.gold}/${gameData.definedTrophies.gold} Platinum: ${gameData.earnedTrophies.platinum}/${gameData.definedTrophies.platinum}`
                data['items'].push({name: gameData.trophyTitleName, picture: gameImage, metaFontSize: "10", meta: {trophies: trophiesData, platform: gameData.trophyTitlePlatform}})
            }))
        }
        let svg: any = generateSVG.SVG(data, color);
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(`${svg}`)
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


const anilistMangaSVG = async (req: Request, res: Response, next: Function) => {
    let anilistUserId: string = escape(req.params.id);
    let color: string = req.query.color?((typeof req.query.color == 'string')?escape(req.query.color):'white'): 'white';
    try {
        let aniData = await retriveAnilist(anilistUserId, 'MANGA', color, ["Recently Read","No Recently Read Manga"])
        let svg = aniData.svg
        res.setHeader('x-ratelimit-limit', aniData.rateLimitHeaders['x-ratelimit-limit'])
        res.setHeader('x-ratelimit-remaining', aniData.rateLimitHeaders['x-ratelimit-remaining'])
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(`${svg}`)
    }
    catch(err: any) {
        console.log(err)
        if(err.response) {
            let message: string = ''
            for(const errItem of err.response.data.errors) {
                message+= errItem.message + ','
            }
            return res.status(err.response.status).json(message)
        }
        else {
            return res.status(500).json('Unable to handle request')
        }
        
    }
}

const anilistAnimeSVG = async (req: Request, res: Response, next: Function) => {
    let anilistUserId: string = req.params.id;
    let color: string = req.query.color?((typeof req.query.color == 'string')?escape(req.query.color):'white'): 'white';
    try {
        let aniData = await retriveAnilist(anilistUserId, 'ANIME', color, ["Recently Watched", "No recently watched Anime"])
        let svg = aniData.svg
        res.setHeader('x-ratelimit-limit', aniData.rateLimitHeaders['x-ratelimit-limit'])
        res.setHeader('x-ratelimit-remaining', aniData.rateLimitHeaders['x-ratelimit-remaining'])
        res.setHeader('content-type', 'image/svg+xml')
        res.status(200).send(`${svg}`)
    }
    catch(err: any) {
        console.log(err)
        if(err.response) {
            let message: string = ''
            for(const errItem of err.response.data.errors) {
                message+= errItem.message
            }
            return res.status(err.response.status).json(message)
        }
        else {
            return res.status(500).json('Unable to handle request')
        }
        
    }
}

const retriveAnilist = async (id : string, type: string, color: string, status: Array<string>) => {
    let userName: string = id;
    var query = `
    query ($name: String, $type: MediaType) {
        User(name: $name) {
            name
            avatar {
              medium
            }
          }
        MediaListCollection(userName: $name, type: $type) {
          lists {
            name
            isSplitCompletedList
            entries {
              progress
              updatedAt
              media {
                title {
                  english
                  userPreferred
                }
                isAdult
                coverImage {
                  extraLarge
                  large
                  medium
                  color
                }
              }
            }
          }
        }
    }`;
    let variables = {
        name: userName,
        type: type
    }


    let url = 'https://graphql.anilist.co'

    let axiosRes = await axios.post(url, JSON.stringify({query: query,variables: variables}), {headers: {'Content-Type': 'application/json','Accept': 'application/json'} })
    let userImage = Buffer.from (await (await axios.get(axiosRes.data.data.User.avatar.medium, {responseType: 'arraybuffer'})).data).toString('base64');
    let aniData: SVGModel = new dataSVG(axiosRes.data.data.User.name,userImage)
    let lists: any = axiosRes.data.data.MediaListCollection.lists
    let allItems: any = []
    for(const list of lists) {
        for(const item of list.entries) {
            if(item.progress > 0 && new Date().getTime() - item.updatedAt*1000 < 12096e5) {
                allItems = allItems.concat(item)
            }
        }                    
    }
    aniData.status = (allItems.length >0)?status[0]:status[1]
    await Promise.all(allItems.map(async (item: any) => {
            let itemImage: any =  Buffer.from (await (await axios.get(item.media.coverImage.medium, {responseType: 'arraybuffer'})).data).toString('base64');
            aniData['items'].push({name: item.media.title.userPreferred, picture: itemImage, pictureSize: '70', meta: { progress: item.progress, lastUpdated: new Date(item.updatedAt*1000).toLocaleString()}})
    }))
    let svg: any = generateSVG.SVG(aniData, color);

    return {svg: svg, rateLimitHeaders: {'x-ratelimit-limit' : axiosRes.headers['x-ratelimit-limit'],'x-ratelimit-remaining': axiosRes.headers['x-ratelimit-remaining']  }}
}





export default { dailyCatto, steamSummarySvg, dailyDoggo, psnSummarySVG, moonPhaseSVG, anilistMangaSVG, anilistAnimeSVG};