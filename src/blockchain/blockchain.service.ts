import BigNumber from 'bignumber.js';
import { EntityManager } from 'typeorm';
import { Logger } from 'winston';

import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';

import { SYSPAR } from '../common/enum';
import { SysPar } from '../entities/sys-par.entity';
import * as Robocock from './Robocock.json';
import { Web3Pool } from './web3-pool';
import {
  IWeb3,
  Web3Utils,
} from './web3-util';

/*

https://docs.nestjs.com/providers#services
*/
export class RawShardTxn {
    shardPrice: any;
    shardQty: any;
    blockNumber: any;
    timeStamp: any;
    gasUsed: any;

}
@Injectable()
export class BlockchainService {
   
    
  
 
    constructor(
        @InjectEntityManager()
        private entityManagerOmniLegends: EntityManager,
        
        @Inject("winston")
        private readonly logger: Logger,
        private readonly web3Pool: Web3Pool
        ){
        
        
    }

    /**
     * @note
     * you should release the web3 after using it
     * @returns web3 
     */
    async getWeb3() {
        const rpcUrl = await SysPar.getValue(this.entityManagerOmniLegends, SYSPAR.RPC_URL);
        const web3 = await this.web3Pool.getWeb3(rpcUrl);
        return web3
    }

    async getNFTContractAddress(){
        const contractAddress = await SysPar.getValue(this.entityManagerOmniLegends, SYSPAR.NFT_CONTRACT_ADDRESS);  
        return contractAddress;
    }
    
    
    async hasCardPack(walletAddress: string, episode: number){
        return await this._performWeb3Txn(async (web3)=>{
            const nftAddress = await this.getNFTContractAddress();
            let cardPackBalance = 0;
            try{
                const contractObj = await Web3Utils.loadAndGetContract(Robocock, nftAddress, web3);
                if(episode === 1){
                    cardPackBalance = await contractObj.userCardPackCount(walletAddress).call();
                } else {
                    cardPackBalance = await contractObj.userCardPackCountForEpisode(walletAddress, episode).call()
                }
                this.logger.info("[BlockchainService].hasCardPack - total card pack ("+cardPackBalance+ ") given address "+walletAddress);
            }finally{
                this.web3Pool.release(web3);
            }
            return new BigNumber(cardPackBalance).isGreaterThan(0);
        });
    }

    async summonLegend(buyerAddress: string, episode: number) {
        return await this._performWeb3Txn(async (web3)=>{
            const nftAddress = await this.getNFTContractAddress();            
            try{
                web3.eth.accounts.wallet.add(process.env.SUMMONER_PRIVATE_KEY);
                
                const contractObj = await Web3Utils.loadAndGetContract(Robocock, nftAddress, web3);
                // NOTE need to pass the episode number
                const currentEpisodeTotalCards = await contractObj.getCurrentEpisodeTotalCards(episode).call();
                this.logger.info("currentEpisodeTotalCards: "+currentEpisodeTotalCards);
                const rand = Math.floor(Math.random() * (parseInt(currentEpisodeTotalCards) - 1 + 1)) + 1;
                const gasPrice = await Web3Utils.getGasPrice(web3);
                this.logger.info("gas price: "+gasPrice);
                
                const gasEstimate = await contractObj.summonLegend(buyerAddress, rand, episode).estimateGas({ from: process.env.SUMMONER_ADDRESS });
                this.logger.info("gas estimate: "+gasEstimate);
                const txn = await contractObj.summonLegend(buyerAddress, rand, episode)
                    .send({
                        from: process.env.SUMMONER_ADDRESS,
                        gasPrice: gasPrice,
                        gas: gasEstimate 
                    });

                this.logger.info("transaction result: "+JSON.stringify(txn));
                if(txn.status === true){
                    return txn;
                }
            }finally{
                web3.eth.accounts.wallet.clear();                
            }
            return null;
        })
    }

    async levelUpLegend(walletAddress: string, cardId: string) {
        return await this._performWeb3Txn(async (web3)=>{
            const nftAddress = await this.getNFTContractAddress();            
            try{
                web3.eth.accounts.wallet.add(process.env.SUMMONER_PRIVATE_KEY);
                const contractObj = await Web3Utils.loadAndGetContract(Robocock, nftAddress, web3);
                const gasPrice = await Web3Utils.getGasPrice(web3);
                this.logger.info("gas price: "+gasPrice);
                
                const gasEstimate = await contractObj.levelUpLegend(walletAddress, cardId).estimateGas({ from: process.env.SUMMONER_ADDRESS });
                this.logger.info("gas estimate: "+gasEstimate);
                const txn = await contractObj.levelUpLegend(walletAddress, cardId)
                    .send({
                        from: process.env.SUMMONER_ADDRESS,
                        gasPrice: gasPrice,
                        gas: gasEstimate 
                    });

                this.logger.info("transaction result: "+JSON.stringify(txn));
                if(txn.status === true){
                    return txn;
                }
            }finally{
                web3.eth.accounts.wallet.clear();                
            }
            return null;
        })
    }
   

    async getNftBalanceOf(address: string) {
        return this._performWeb3Txn(async (web3)=>{
            const nftAddress = await this.getNFTContractAddress();  
            const contractObj = await Web3Utils.loadAndGetContract(Robocock, nftAddress, web3);
            const nftBalance = await contractObj.balanceOf(address).call();
            return nftBalance;
        });
    }
    async getNFTTokenIdOfOwnerByIndex(address: string, index: number) {
        return this._performWeb3Txn(async (web3)=>{
            const nftAddress = await this.getNFTContractAddress();  
            const contractObj = await Web3Utils.loadAndGetContract(Robocock, nftAddress, web3);
            const tokenId = await contractObj.tokenOfOwnerByIndex(address, index).call();
            return tokenId;
        });
    }
    async getRobocockInfo(tokenId: void) {
        return this._performWeb3Txn(async (web3)=>{
            const dt = new Date();
            const nftAddress = await this.getNFTContractAddress();  
            const contractObj = await Web3Utils.loadAndGetContract(Robocock, nftAddress, web3);
            const dt1 = new Date();
            this.logger.debug("time spent in retrieving robocock info "+(dt1.getTime()-dt.getTime())+" ms");
            const legendInfo = await contractObj.getRobocockInfo(tokenId).call();
            return legendInfo;;
        });
    }
    
    private async _performWeb3Txn(func: (web3: IWeb3)=>Promise<any>){
        let result = null;
        let err = null;
        const web3 = await this.getWeb3();
        try{
            result = await func(web3).catch(error=>{
                err = error;
            });
        }finally{
            this.web3Pool.release(web3);
        }
        
        if(err){
            throw err;
        }

        return result;
    }
}
