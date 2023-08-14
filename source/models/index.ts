export interface SVGModel {
    name : string,
    picture: string,
    items: Array<item>,
    status: string,
    meta: Meta
}

export interface Meta {
    status?: string,
    isPSPlus?: string,
    onlineId?: string,
    accountId?: string
}

export interface item {
    name: string,
    picture: string,
    meta: itemMeta,
    pictureSize?: string,
    metaFontSize?:string
}

export interface itemMeta {
    recent?: string,
    total?: string,
    trophies?: string,
    platform?: string,
    lastUpdated?:string,
    progress?:string
}
