import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";

import { Web3Utils } from "../../blockchain/web3-util";
import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { TransferRequest } from "../../entities/transfer-request.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { EventLogs } from "../events/event-logs";
import * as RobocockTransfer from "./RobocockTransfer.json";

RobocockTransfer

/*

https://docs.nestjs.com/providers#services
*/
const TOPIC_EVENT_NAME_MAPPING = {
    ["0xabf0bc072b114805cd53651632ff132a40687887fe262720b4b619ef5960bbd8".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"TransferItemCreated",RobocockTransfer),
    ["0x71b241ef2a9feb1d7bd30f917edd4432791c24f6cf84565f2e5ae1b8d1f0a756".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"TransferItemCancelled",RobocockTransfer),
    ["0x3497ca237de701624cef818f13684fd3fbd35ef9b11efe3e5e477cc493832cae".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"TransferItemCompleted",RobocockTransfer)  
}

@Injectable()
export class TransferService extends CovalentEventRetrieverService  {
    async process(item: any, eventName: any, actualData: any, web3, actualResult): Promise<void> {
        await this.em.transaction(async(txnEm: EntityManager)=>{

            await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
            if(eventName.getLogName() === "TransferItemCreated"){
                // const pay = await txnEm.findOne(TransferRequest,{transferRequestId: item.itemId});
                // if(pay){
                //     pay.status = "P"; // index
                //     await txnEm.save(pay);
                // }
            }
            if(eventName.getLogName() === "TransferItemCancelled"){
                console.log("itemcancelled : ",item.itemId )
                const pay = await txnEm.findOne(TransferRequest,{transferRequestId: item.itemId,status:"P"});
                if(pay){
                    pay.status = "X";
                    await txnEm.save(pay);
                }
            }
            if(eventName.getLogName() === "TransferItemCompleted"){
                const pay = await txnEm.findOne(TransferRequest,{transferRequestId: item.itemId,status: "P"});
                if(pay){
                    pay.status = "L";
                    pay.tokenPrice = Web3Utils.fromWei(web3, actualResult.gkenPrice.toString()); 
                    await txnEm.save(pay);
                }
            }
        });
    }
    getContractAddressKey(): SYSPAR {
        return SYSPAR.TRANSFER_CONTRACT;
    }
    getContractPageNumberKey(): SYSPAR {
        return SYSPAR.TRANSFER_CONTRACT_PAGE_NUMBER; // NEW
    }
    getContractPageSizeKey(): SYSPAR {
        return  SYSPAR.TRANSFER_CONTRACT_PAGE_SIZE; // NEW
    }
    getContractStartBlockKey(): SYSPAR {
        return SYSPAR.TRANSFER_CONTRACT_START_BLOCK; //NEW
    }
    getEventNameMapping(topicHash: any) {
        return TOPIC_EVENT_NAME_MAPPING[topicHash];
    }
    getJobName(): string {
        return "TransferService";
    }
    getJobTimeout(): number {
        return 200;
    } 
    
}
