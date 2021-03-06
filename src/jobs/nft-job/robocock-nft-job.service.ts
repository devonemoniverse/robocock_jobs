import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";

import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { Robocock } from "../../entities/robocock.entity";
import { WhitelistedContract } from "../../entities/whitelisted-contract.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { EventLogsTransfer } from "../events/event-logs-transfer";
import { BreedingHelperService } from "../helper/breeding-helper.service";

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
        return 200;
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
                    r = Robocock.create(cockInfo, item);
                    if(r.isOG()){
                        r.setDataForOGNft(cockInfo);
                    } else {
                        r.setDataForBreedNft(cockInfo);
                    }
                    await txnEm.save(r);

                    if(r.isOG()){
                        // create robocock part stat
                        await BreedingHelperService.createRobocockStatAndMainStatForOG(txnEm, r);
                    } else {
                        await BreedingHelperService.createRobocockStatAndMainStatForNormal(txnEm, r);
                    }
                }
                
                if(r.owner.toLowerCase() !== item.to.toLowerCase()){

                    const isWhitelistedReceiver = await txnEm.findOne(WhitelistedContract,{contractAddress: item.to.toLowerCase()});
                    if(!isWhitelistedReceiver){
                        r.owner = item.to;
                        await txnEm.save(r);
                    }
                    
                }
            }
        });
    }
   
    

  
  
}
