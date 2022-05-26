import BigNumber from "bignumber.js";

import * as Robocock from "../nft-job/Robocock.json";
import { EventLogs } from "./event-logs";

export class EventLogsTransfer extends EventLogs {
    constructor(data,  topics, name){
        super(data, topics, name, Robocock);
    }
   
    getParseLog(web3: any) {
        
        const res ={
            from: this.removeLeftZeroes( this.topics[1]),
            to: this.removeLeftZeroes( this.topics[2]),
            tokenId: new BigNumber(new BigNumber( this.topics[3],16).toString()).toString(),
            time: null  
        }
        
        return res
    }
    removeLeftZeroes(data){
        return data.substring(0,2)+data.slice(-40);
    }
}