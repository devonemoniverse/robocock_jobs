import { Inject, Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { InjectEntityManager } from "@nestjs/typeorm";
import BigNumber from "bignumber.js";
import { EntityManager } from "typeorm";
import { Logger } from "winston";

import { BlockchainService } from "../blockchain/blockchain.service";
import { SYSPAR } from "../common/enum";
import { QUERIES } from "../database/queries";
import { SysPar } from "../entities/sys-par.entity";
import { AbstractService } from "./abstract.service";
import { COVALENT_MAX_BLOCK, CovalentUtil } from "./covalent-util";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require("web3");
/*

https://docs.nestjs.com/providers#services
*/

@Injectable()
export abstract class CovalentEventRetrieverService extends AbstractService {
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        @InjectEntityManager()
        protected readonly em: EntityManager,
        @Inject("winston")
        private readonly logger: Logger,
        protected readonly blockChainService: BlockchainService
        ){
        super(schedulerRegistry, logger);
        logger.info(this.getJobName()+" has been initialized");
    }

    abstract process(item: any, eventName, actualData): Promise<void>
    abstract getContractAddressKey(): SYSPAR;
    abstract getContractPageNumberKey(): SYSPAR;
    abstract getContractPageSizeKey(): SYSPAR;
    abstract getContractStartBlockKey(): SYSPAR;
    
    async runJob(): Promise<void> {
        
        const contractAddress = await SysPar.getValue(this.em,  this.getContractAddressKey()); 
        const chainId = await SysPar.getValue(this.em,  SYSPAR.RPC_CHAIN_ID);
        const rpcURL = await SysPar.getValue(this.em,  SYSPAR.RPC_URL);   
 
        const pageNumber  = await SysPar.getValue(this.em, this.getContractPageNumberKey());
        const pageSize = await SysPar.getValue(this.em, this.getContractPageSizeKey());
        const startBlock = await SysPar.getValue(this.em, this.getContractStartBlockKey());
        let endBlock = 1000000;
        const apiKey = "ckey_d8c9f6fe1fe440a290c8b6e0809";        
        const WEB3_PROVIDER = new Web3.providers.HttpProvider(rpcURL);
        const web3 = new Web3(WEB3_PROVIDER);
        const latestBlock = await CovalentUtil.getLatestBlock(chainId, apiKey);  
        endBlock = latestBlock;
         
        const apiURL = `https://api.covalenthq.com/v1/${chainId}/events/address/${contractAddress}/?page-number=${pageNumber}&page-size=${pageSize}&key=${apiKey}&starting-block=${startBlock}&ending-block=${endBlock}`;
        console.log("apiURL: ",apiURL);
        let err = null;
        const response = await axios.get(apiURL).catch(error=>{
            err = error.response.data;
        });    
        if(!response){
            if(err && err.error_message.includes("Block-height ranges greater than 1000000 not currently supported ")){
                const value = (new BigNumber(endBlock).minus(startBlock)).toString();
                console.log("diff ",value);
                await this.em.transaction(async(txnEm: EntityManager)=>{
                    await this.updateStartBlockAndResetPageNumber(endBlock, startBlock, txnEm);
                });
            }
            this.logger.warn("no response from url "+apiURL);
            return;
        }
        
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
                await this.process(item, eventName, data);
            }
            
            if(result.length > 0){
                await this.em.transaction(async(txnEm: EntityManager)=>{
                    if(new BigNumber(result.length).eq(pageSize)){
                        await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
                        const syspar = await txnEm.findOne(SysPar,{code: this.getContractPageNumberKey()});
                        syspar.value = new BigNumber(pageNumber).plus(1).toString();
                        await txnEm.save(syspar);
                    }

                    await this.updateStartBlockAndResetPageNumber(endBlock, startBlock, txnEm);
                });
            }
             
        } else {
            this.logger.info("response; "+JSON.stringify(response.data));
        }
    }  
    private async updateStartBlockAndResetPageNumber(endBlock: number, startBlock: string, txnEm: EntityManager) {
        if ((new BigNumber(endBlock).minus(startBlock)).isGreaterThanOrEqualTo(COVALENT_MAX_BLOCK)) {
            await txnEm.query(QUERIES.SET_SESSION_USER, [-1]);
            const startBlockSysPar = await txnEm.findOne(SysPar, { code: this.getContractStartBlockKey() });
            startBlockSysPar.value = new BigNumber(startBlock).plus(COVALENT_MAX_BLOCK).toString();
            await txnEm.save(startBlockSysPar);

            await txnEm.query(QUERIES.SET_SESSION_USER, [-1]);
            const tradingPostPageNumber = await txnEm.findOne(SysPar, { code: this.getContractPageNumberKey() });
            tradingPostPageNumber.value = "0";
            await txnEm.save(tradingPostPageNumber);
            this.logger.debug("resetting to 0 the page number and increasing the start block to " + COVALENT_MAX_BLOCK);
        }
    }
}
