import { Request, Response, NextFunction } from 'express';

var packageJson = require('../../package.json')

const health = async (req: Request, res: Response, next: NextFunction) => {

    let healthResponse: string = 'up';
    return res.status(200).json(healthResponse);
};

const version = async (req: Request, res: Response, next: NextFunction) => {

    let versionResponse: string = packageJson.version;
    return res.status(200).json(versionResponse);
};


export default {health, version};