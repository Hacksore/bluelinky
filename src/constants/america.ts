import { Brand } from "../interfaces/common.interfaces";

export interface AmericaBrandEnvironment {
    constructor: Brand;
    host: string;
    baseUrl: string;
    clientId: string;
    clientSecret: string;
}

const getHyundaiEnvironment = (): AmericaBrandEnvironment => {
    const host = 'prd.eu-ccapi.hyundai.com:8080';
    const baseUrl = `https://${host}`;
    return {
        constructor: 'hyundai',
        host,
        baseUrl,
        clientId: '815c046afaa4471aa578827ad546cc76',
        clientSecret: 'GXZveJJAVTehh/OtakM3EQ==',
    };
};

export const getBrandEnvironment = (brand: Brand): AmericaBrandEnvironment => {
    switch (brand) {
        case 'hyundai':
            return Object.freeze(getHyundaiEnvironment());
        default:
            throw new Error(`Constructor ${brand} is not managed.`);
    }
};
