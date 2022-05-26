import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";

import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { CockFactoryReq } from "../../entities/cock-factory-req.entity";
import { CockFactory } from "../../entities/cock-factory.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { EventLogsTransfer } from "../events/event-logs-transfer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
const TOPIC_EVENT_NAME_MAPPING = {
    ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef".toLowerCase()]:(data, topics)=>new EventLogsTransfer(data, topics,"Transfer") 
}

@Injectable()
export class CockFactoryNFTJobService extends CovalentEventRetrieverService {
    
    getContractAddressKey(): SYSPAR {
       return SYSPAR.PROXY_COCK_FACTORY_NFT;
    }
    getContractPageNumberKey(): SYSPAR {
        return SYSPAR.COCK_FACTORY_NFT_PAGE_NUMBER;
    }
    getContractPageSizeKey(): SYSPAR {
        return  SYSPAR.COCK_FACTORY_NFT_PAGE_SIZE;
    }
    getContractStartBlockKey(): SYSPAR {
        return SYSPAR.COCK_FACTORY_NFT_CONTRACT_START_BLOCK;
    }
    
    getEventNameMapping(topicHash: any) {
        return TOPIC_EVENT_NAME_MAPPING[topicHash];
    }
   
    getJobName(): string {
        return "CockFactoryNFTJobService";
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
                let r = await txnEm.findOne(CockFactory,{
                    cockFactoryId: item.tokenId
                });
                if(!r){
                    r = new CockFactory();
                    r.cockFactoryId = item.tokenId;
                    r.owner = item.to;
                    await txnEm.save(r);
                    const req= await txnEm.findOne(CockFactoryReq,{address:item.to});
                    if(req){
                        req.txnHash = actualData.tx_hash;
                        await txnEm.save(req);
                    }
                }
                if(r.owner.toLowerCase() !== item.to.toLowerCase()){
                    r.owner = item.to;
                    await txnEm.save(r);
                }
            }
        });
    }
    
}
