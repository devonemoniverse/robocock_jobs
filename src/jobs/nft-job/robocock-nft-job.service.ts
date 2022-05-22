import { Injectable } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { EntityManager } from "typeorm";

import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { ClassStat } from "../../entities/class-stat.entity";
import { Part } from "../../entities/part.entity";
import { RobocockPartStat } from "../../entities/robocock-part-stat.entity";
import { RobocockStat } from "../../entities/robocock-stat.entity";
import { Robocock } from "../../entities/robocock.entity";
import { SysPar } from "../../entities/sys-par.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { RobocockPart } from "../dto/robocock-part";
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
                    r = Robocock.create(cockInfo, item);
                    if(r.isOG()){
                        r.setDataForOGNft(cockInfo);
                    } else {
                        r.setDataForBreedNft(cockInfo);
                    }
                    await txnEm.save(r);

                    if(r.isOG()){
                        // create robocock part stat
                        await this.createRobocockStatAndMainStatForOG(txnEm, r);
                    } else {
                        const baseStat = await SysPar.getValue(txnEm, SYSPAR.BASE_STAT);
                        const parts = await txnEm.find(Part, { order: { partId: "ASC" } });
                        
                        const offSpringGenes = r.getClassGenes();
                        
                        const sumStats = {};
                        // for each part there are possibilities different dominant class
                        for (const part of parts) {
                            
                            const partId = parseInt(part.partId);
                            const offSprintClasses = offSpringGenes.substring(partId*7,7*(partId+1)); // get the string part
                            const offSpringPart = new RobocockPart(offSprintClasses);

                            // get the dominant class and use this to get the stats
                            const classStats = await txnEm.find(ClassStat, {
                                where: { classId: offSpringPart.dominant },
                                order: {
                                    statOrder: "ASC"
                                }
                            });
                            
                            for (const classStat of classStats) {
                                const robocockPartStat = new RobocockPartStat();
                                robocockPartStat.partCode = part.code;
                                robocockPartStat.partId = part.partId;

                                robocockPartStat.class = offSpringPart.dominantClass; // use the dominant class
                                robocockPartStat.classId = offSpringPart.dominant.toString(); // use the dominant class

                                robocockPartStat.nftId = r.robocockId;

                                robocockPartStat.stat = baseStat;
                                robocockPartStat.statCap = classStat.statCap;
                                robocockPartStat.statCode = classStat.statCode;
                                if(sumStats[robocockPartStat.statCode]){
                                    sumStats[robocockPartStat.statCode] = {statCap:0,stat:0};
                                }
                                sumStats[robocockPartStat.statCode].statCap+=parseFloat(robocockPartStat.statCap); 
                                sumStats[robocockPartStat.statCode].stat+=parseFloat(robocockPartStat.stat); 
                                await txnEm.save(robocockPartStat);
                            }
                        }
                        
                        // create robocock main stat
                        for(const key of Object.keys(sumStats)){
                            const robocockStat = new RobocockStat();
                            robocockStat.class = r.class;
                            robocockStat.classId = r.classId;

                            robocockStat.robocockId = r.robocockId;
                            robocockStat.stat = sumStats[key].stat;
                            robocockStat.statCap = sumStats[key].statCap;
                            robocockStat.statCode = key;

                            await txnEm.save(robocockStat);    
                        }
                    }
                }
                if(r.owner.toLowerCase() !== item.to.toLowerCase()){
                    r.owner = item.to;
                    await txnEm.save(r);
                }
            }
        });
    }
   
    

    private async createRobocockStatAndMainStatForOG(txnEm: EntityManager, r: Robocock) {
        const baseStat = await SysPar.getValue(txnEm, SYSPAR.BASE_STAT);
        const classStats = await txnEm.find(ClassStat, {
            where: { classId: r.classId },
            order: {
                statOrder: "ASC"
            }
        });
        const parts = await txnEm.find(Part, { order: { partId: "ASC" } });
        for (const part of parts) {
            for (const classStat of classStats) {
                const robocockPartStat = new RobocockPartStat();
                robocockPartStat.partCode = part.code;
                robocockPartStat.partId = part.partId;

                robocockPartStat.class = r.class;
                robocockPartStat.classId = r.classId;

                robocockPartStat.nftId = r.robocockId;

                robocockPartStat.stat = baseStat;
                robocockPartStat.statCap = classStat.statCap;
                robocockPartStat.statCode = classStat.statCode;
                await txnEm.save(robocockPartStat);
            }
        }

        // create robocock main stat
        for (const classStat of classStats) {

            const robocockStat = new RobocockStat();
            robocockStat.class = r.class;
            robocockStat.classId = r.classId;

            robocockStat.robocockId = r.robocockId;
            robocockStat.stat = new BigNumber(baseStat).multipliedBy(parts.length).toFixed();
            robocockStat.statCap = new BigNumber(classStat.statCap).multipliedBy(parts.length).toFixed();
            robocockStat.statCode = classStat.statCode;

            await txnEm.save(robocockStat);
        }
    }
}
