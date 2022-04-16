export const COVALENT_MAX_BLOCK = 1000000;
export class CovalentUtil {
    static async getLatestBlock(chainId, apiKey){
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const axios = require('axios');

        const config = {
            method: 'get',
            url: `https://api.covalenthq.com/v1/${chainId}/block_v2/latest/?key=${apiKey}`,
            headers: { }
        };
        const resp = await axios(config);
        const data  = resp.data;
        if(!data.error){
            console.log("returning latest block from covalent");
            return data.data.items[0].height;
        }
        throw new Error("unable to get the latest block from covalent");
    }
}