import { Inject, Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { InjectEntityManager } from "@nestjs/typeorm";
import BigNumber from "bignumber.js";
import { EntityManager } from "typeorm";
import { Logger } from "winston";

import { BlockchainService } from "../../blockchain/blockchain.service";
import { SYSPAR } from "../../common/enum";
import { QUERIES } from "../../database/queries";
import { Robocock } from "../../entities/robocock.entity";
import { SysPar } from "../../entities/sys-par.entity";
import { AbstractService } from "../abstract.service";
import { COVALENT_MAX_BLOCK, CovalentUtil } from "../covalent-util";
import { EventLogsTransfer } from "../events/event-logs-transfer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
const TOPIC_EVENT_NAME_MAPPING = {
    ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef".toLowerCase()]:(data, topics)=>new EventLogsTransfer(data, topics,"Transfer") 
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require("web3");
@Injectable()
export class RobocockNftJobService extends AbstractService {
    getEventNameMapping(topicHash: any) {
        return TOPIC_EVENT_NAME_MAPPING[topicHash];
    }
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        @InjectEntityManager()
        private readonly em: EntityManager,
        @Inject("winston")
        private readonly logger: Logger,
        private readonly blockChainService: BlockchainService
        ){
        super(schedulerRegistry, logger);
        logger.info(this.getJobName()+" has been initialized");
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
    async runJob(): Promise<void> {
        
        const contractAddress = await SysPar.getValue(this.em,  SYSPAR.NFT_CONTRACT_ADDRESS); 
        const chainId = await SysPar.getValue(this.em,  SYSPAR.RPC_CHAIN_ID);
        const rpcURL = await SysPar.getValue(this.em,  SYSPAR.RPC_URL);   
 
        const pageNumber  = await SysPar.getValue(this.em, SYSPAR.NFT_PAGE_NUMBER);
        const pageSize = await SysPar.getValue(this.em, SYSPAR.NFT_PAGE_SIZE);
        const startBlock = await SysPar.getValue(this.em, SYSPAR.NFT_CONTRACT_START_BLOCK);
        let endBlock = 1000000;
        const apiKey = "ckey_d8c9f6fe1fe440a290c8b6e0809";        
        const WEB3_PROVIDER = new Web3.providers.HttpProvider(rpcURL);
        const web3 = new Web3(WEB3_PROVIDER);
        const latestBlock = await CovalentUtil.getLatestBlock(chainId, apiKey);  
        endBlock = latestBlock;
        const apiURL = `https://api.covalenthq.com/v1/${chainId}/events/address/${contractAddress}/?page-number=${pageNumber}&page-size=${pageSize}&key=${apiKey}&starting-block=${startBlock}&ending-block=${endBlock}`;
        console.log("apiURL: ",apiURL);
        const response = await axios.get(apiURL);    
        
        if (response.status==200 && response.data.data.items){    
            const result = response.data.data.items;
            this.logger.debug("found "+result.length+" for page number "+pageNumber+" and page size "+pageSize);
 
            for(const data of result){
                const eventName = this.getEventName(data, web3);
                if(!eventName){
                    continue;
                }
                const resultVal: any = eventName.getParseLog(web3);
                
                const item = resultVal.item || resultVal || {};
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
                            await txnEm.save(r);
                        } 
                    }
                    
                });
            }
            
            if(result.length > 0){
                await this.em.transaction(async(txnEm: EntityManager)=>{
                    if(new BigNumber(result.length).eq(pageSize)){
                        await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
                        const syspar = await txnEm.findOne(SysPar,{code: SYSPAR.NFT_PAGE_NUMBER});
                        syspar.value = new BigNumber(pageNumber).plus(1).toString();
                        await txnEm.save(syspar);
                    }

                    if((new BigNumber(endBlock).minus(startBlock)).isGreaterThanOrEqualTo(COVALENT_MAX_BLOCK)){
                        await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
                        const startBlockSysPar = await txnEm.findOne(SysPar,{code: SYSPAR.NFT_CONTRACT_START_BLOCK});
                        startBlockSysPar.value = new BigNumber(startBlock).plus(COVALENT_MAX_BLOCK).toString();
                        await txnEm.save(startBlockSysPar);

                        await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
                        const tradingPostPageNumber = await txnEm.findOne(SysPar,{code: SYSPAR.NFT_PAGE_NUMBER});
                        tradingPostPageNumber.value = "0";
                        await txnEm.save(tradingPostPageNumber);
                        this.logger.debug("resetting to 0 the page number and increasing the start block to "+COVALENT_MAX_BLOCK);
                    }
                });
            }
             
        } else {
            this.logger.info("response; "+JSON.stringify(response.data));
        }
    }  
    
}
