import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";

import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { Robocock } from "../../entities/robocock.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { EventLogsTransfer } from "../events/event-logs-transfer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
const TOPIC_EVENT_NAME_MAPPING = {
    ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef".toLowerCase()]:(data, topics)=>new EventLogsTransfer(data, topics,"Transfer") 
}

const TIER_ULTRA = "4";
@Injectable()
export class RobocockNftJobService extends CovalentEventRetrieverService {
    
    getContractAddressKey(): SYSPAR {
       return SYSPAR.NFT_CONTRACT_ADDRESS;
    }
    getContractPageNumberKey(): SYSPAR {
        return SYSPAR.NFT_PAGE_NUMBER;
    }
    getContractPageSizeKey(): SYSPAR {
        return  SYSPAR.NFT_PAGE_SIZE;
    }
    getContractStartBlockKey(): SYSPAR {
        return SYSPAR.NFT_CONTRACT_START_BLOCK;
    }
    
    getEventNameMapping(topicHash: any) {
        return TOPIC_EVENT_NAME_MAPPING[topicHash];
    }
   
    getJobName(): string {
        return "RobocockNftJobService";
    }
    
    getJobTimeout(): number {
        return 1000;
    }
     
    hasTokenId(item: any) {
        try{
            const res = parseInt(item.tokenId);
            return res>=0;
        }catch(err){
            return false;
        }
    }
    
    async process(item, eventName, actualData): Promise<void> {
        await this.em.transaction(async(txnEm: EntityManager)=>{
            await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
            if(eventName.getLogName() === "Transfer"){
                let r = await txnEm.findOne(Robocock,{
                    robocockId: item.tokenId
                });
                if(!r){
                    const cockInfo = await this.blockChainService.getRobocockInfo(item.tokenId);
                    r = new Robocock();
                    r.attributes = {
                        genes: cockInfo.genes,
                        summonDate: cockInfo.summonDate
                    };
                    r.class = cockInfo.className;
                    r.type = cockInfo.rtype;
                    r.robocockId = cockInfo.tokenId;
                    r.owner = item.to;
                    r.generation = cockInfo.generation;
                    if(r.isOG()){
                        r.tier = TIER_ULTRA;
                    }
                    
                    // OG Robohen 27 breeding count
                    // OG Robocock 9 Breeding Count
                    if(r.isOG()){
                        if(r.isRoboHEN()){
                            r.breedCount = "27";
                        }else {
                            r.breedCount = "9";
                        }
                    } else {
                        // Regular Robohen 9 Breeding count
                        // Regular Robocock 3 Breeding Count
                        if(r.isRoboHEN()){
                            r.breedCount = "9";
                        }else {
                            r.breedCount = "3";
                        }
                    }
                    await txnEm.save(r);
                }
                if(r.owner.toLowerCase() !== item.to.toLowerCase()){
                    r.owner = item.to;
                    await txnEm.save(r);
                }
            }
        });
    }
    
}
