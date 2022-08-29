import { Injectable } from "@nestjs/common";
import { EntityManager, In } from "typeorm";

import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { BreedRequest } from "../../entities/breed-request.entity";
import { ExchangeTokenTxn } from "../../entities/exchange-token-txn.entity";
import { PaymentRequest } from "../../entities/payment-request.entity";
import { Robocock } from "../../entities/robocock.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { EventLogs } from "../events/event-logs";
import { BreedingHelperService } from "../helper/breeding-helper.service";
import * as RobocockCrystalExchange from "./RobocockCrystalExchange.json";

 
const TOPIC_EVENT_NAME_MAPPING = {
    ["0x6262060dd38cdae3cd4ec955f836ed23104f498b2e387399407c605377d9c0e5".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"ExchangeToken",RobocockCrystalExchange),
}
@Injectable()
export class ConversionJobService extends CovalentEventRetrieverService  {
   
    getContractAddressKey(): SYSPAR {
       return SYSPAR.REWARD_CONTRACT;
    }
    getContractPageNumberKey(): SYSPAR {
        return SYSPAR.REWARD_CONTRACT_PAGE_NUMBER;
    }
    getContractPageSizeKey(): SYSPAR {
        return SYSPAR.REWARD_CONTRACT_PAGE_SIZE;
    }
    getContractStartBlockKey(): SYSPAR {
        return SYSPAR.REWARD_CONTRACT_START_BLOCK;
    }
    getEventNameMapping(topicHash: any) {
        return TOPIC_EVENT_NAME_MAPPING[topicHash];
    }
    getJobName(): string {
        return "ConversionJobService";
    }
    getJobTimeout(): number {
        return 200;
    }
    private async _getPendingOrForSending(nonce,  txnManager: EntityManager) {
      
        return await txnManager.findOne(ExchangeTokenTxn, {
            where: {
                nonce,
                status: In([
                    "P",
                    "F"
                ])
            }
        });
    }
    async process(item: any, eventName: any,actualData:any): Promise<void> {
        await this.em.transaction(async(txnEm: EntityManager)=>{
           
            if(eventName.getLogName() === "ExchangeToken"){
                    await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
                    // existing txnHash
                    const exchange = await this._getPendingOrForSending(item.nonce, txnEm);
                    if(!exchange){
                        return;
                    }
                    const exchangeTxn = await txnEm.findOne(ExchangeTokenTxn,{txnHash: actualData.tx_hash});
                    if(exchangeTxn){
                        return ;
                    }
                    exchange.txnHash = actualData.tx_hash;
                    exchange.txnDetails = {
                        item
                    }
                    exchange.status = "L" // completed
                    await txnEm.save(exchange);    
                    return exchange;
               
            }
             
        });
    }
}
