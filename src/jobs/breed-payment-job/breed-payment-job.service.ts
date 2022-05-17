import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";

import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { BreedRequest } from "../../entities/breed-request.entity";
import { PaymentRequest } from "../../entities/payment-request.entity";
import { Robocock } from "../../entities/robocock.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { EventLogs } from "../events/event-logs";
import * as RobocockBreed from "./RobocockBreed.json";

/*
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
https://docs.nestjs.com/providers#services
*/
const TOPIC_EVENT_NAME_MAPPING = {
    ["0x7cf6180e26cfdff6fdb643269e29592637d0245b23bb692f5040376196525003".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"PayBreedingFee",RobocockBreed),
    ["0x6e53cc42abadcd760448bd797fb612b195af79d0be48b910f5701e5ae152dc17".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"RobocockBreed",RobocockBreed),
}
@Injectable()
export class BreedPaymentJobService extends CovalentEventRetrieverService  {
   
    getContractAddressKey(): SYSPAR {
       return SYSPAR.BREEDING_CONTRACT;
    }
    getContractPageNumberKey(): SYSPAR {
        return SYSPAR.BREEDING_PAGE_NUMBER;
    }
    getContractPageSizeKey(): SYSPAR {
        return SYSPAR.BREEDING_PAGE_SIZE;
    }
    getContractStartBlockKey(): SYSPAR {
        return SYSPAR.BREEDING_START_BLOCK;
    }
    getEventNameMapping(topicHash: any) {
        return TOPIC_EVENT_NAME_MAPPING[topicHash];
    }
    getJobName(): string {
        return "BreedPaymentJobService";
    }
    getJobTimeout(): number {
        return 1000;
    }
    
    async process(item: any, eventName: any,actualData:any): Promise<void> {
        await this.em.transaction(async(txnEm: EntityManager)=>{
            await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
            if(eventName.getLogName() === "PayBreedingFee"){
                const pay = await txnEm.findOne(PaymentRequest,{paymentRequestId: item.reqId});
                if(pay){
                    pay.status = "L";
                    pay.txnHash = actualData.tx_hash;
                    await txnEm.save(pay);
                }
            }
            if(eventName.getLogName() === "RobocockBreed") {
                const id = item.offSpringId;
                let r = await txnEm.findOne(Robocock,{
                    robocockId: id
                });
                const cockInfo = await this.blockChainService.getRobocockInfo(id);
                if(!r){
                    r = Robocock.create(cockInfo, item);
                    r.setDataForBreedNft(cockInfo);
                    await txnEm.save(r);
                } 

                const breed = await txnEm.findOne(BreedRequest,{breedRequestId: item.nonce });
                if(breed){
                    breed.status = "L";
                    breed.txnHash = actualData.tx_hash;
                    await txnEm.save(breed);

                    // set the parent id
                    r.parentRobocockId = breed.robocockId 
                    r.parentRobohenId = breed.robohenId;

                    r.headerUrl = breed.headerUrl;
                    r.imageUrl = breed.imageUrl;
                    await txnEm.save(r);
                }
            }
        });
    }
}
