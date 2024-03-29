import { Injectable } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { EntityManager, In } from "typeorm";
import { Web3Utils } from "../../blockchain/web3-util";

import { SYSPAR } from "../../common/enum";
import { Status } from "../../core/status.enum";
import { QUERIES } from "../../database/queries";
import { Deposit } from "../../entities/deposit.entity";
import { ExchangeTokenTxn } from "../../entities/exchange-token-txn.entity";
import { WalletBalanceTxn } from "../../entities/wallet-balance-txn.entity";
import { WalletBalance } from "../../entities/wallet-balance.entity";
import { Wallet } from "../../entities/wallet.entity";
import { Withdraw } from "../../entities/withdraw.entity";
import { CovalentEventRetrieverService } from "../covalent-event-retriever.service";
import { AssetCode } from "../enum/asset-code.enum";
import { WalletTxn } from "../enum/wallet-txn.enum";
import { EventLogs } from "../events/event-logs";
import * as RobocockDepositWithdraw from "./RobocockDepositWithdraw.json";

const TOPIC_EVENT_NAME_MAPPING = {
    ["0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"Deposit",RobocockDepositWithdraw),
    ["0x91ee42a3ae048785d7370790775b6bf02c58c5d7bfb5de80f6d7cb27e46a207e".toLowerCase()]:(data, topics)=>new EventLogs(data, topics,"Withdraw",RobocockDepositWithdraw),
}
@Injectable()
export class DepositWithdrawJobService extends CovalentEventRetrieverService  {
   
    getContractAddressKey(): SYSPAR {
       return SYSPAR.DEPOSIT_WITHDRAW_CONTRACT;
    }
    getContractPageNumberKey(): SYSPAR {
        return SYSPAR.DEPOSIT_WITHDRAW_CONTRACT_PAGE_NUMBER;
    }
    getContractPageSizeKey(): SYSPAR {
        return SYSPAR.DEPOSIT_WITHDRAW_CONTRACT_PAGE_SIZE;
    }
    getContractStartBlockKey(): SYSPAR {
        return SYSPAR.DEPOSIT_WITHDRAW_CONTRACT_START_BLOCK;
    }
    getEventNameMapping(topicHash: any) {
        return TOPIC_EVENT_NAME_MAPPING[topicHash];
    }
    getJobName(): string {
        return "DepositWithdrawJobService";
    }
    getJobTimeout(): number {
        return 200;
    }
     
    async process(item: any, eventName: any,actualData:any,web3): Promise<void> {
        await this.em.transaction(async(txnEm: EntityManager)=>{
            await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
            if(eventName.getLogName() === "Deposit"){
                let deposit = await txnEm.findOne(Deposit,{txnHash:  actualData.tx_hash});
                if(!deposit){
                    deposit = new Deposit();
                    deposit.txnHash = actualData.tx_hash;
                    deposit.amount = Web3Utils.fromWei(web3, String(item.amount));
                    deposit.depositor = item.depositor;
                    deposit.timestamp = item.depositTime;
                    await txnEm.save(deposit);
                    const wallet = await txnEm.findOne(Wallet,{walletAddress: deposit.depositor});
                    if(wallet){
                        let gkenBalance = await txnEm.findOne(WalletBalance,{walletId: wallet.walletId, type: AssetCode.GKEN},{lock:{mode:"pessimistic_write"}});
                        if(!gkenBalance){
                            gkenBalance = WalletBalance.createBalance(AssetCode.GKEN, wallet);
                        }  
                        
                        if(gkenBalance){
                            gkenBalance.balance  = new BigNumber(gkenBalance.balance).plus(deposit.amount).toString();
                            this.logger.debug("Increase the gken balance of user "+wallet.walletAddress);
                            gkenBalance.versionNo = gkenBalance.versionNo || 0;
                            await txnEm.save(gkenBalance);
                            await WalletBalanceTxn.create(txnEm, gkenBalance , `${deposit.amount}`, WalletTxn.DEPOSIT_GKEN);
                        }
                    } else {
                        this.logger.warn("Wallet not found given the address of depositor "+deposit.depositor+" and hash "+actualData.tx_hash);
                    }
                }
            }
            if(eventName.getLogName()==="Withdraw"){
                let withdraw = await txnEm.findOne(Withdraw,{txnHash: actualData.tx_hash});
                if(!withdraw){
                    withdraw = await txnEm.findOne(Withdraw,{nonce: item.nonce});
                    console.log("found withdraw given nonce: ",withdraw);
                    if(process.env.NODE_ENV === "development" && !withdraw){
                        this.logger.debug("withdraw nonce not existing in the database, skipping since we are in dev mode");
                        return ;
                    }
                    if(!withdraw){
                        throw Error("withdraw nonce not existing in the database");
                    }

                    if(withdraw.txnHash){
                        return;
                    }
                    withdraw.walletSign = item.walletSig;
                    withdraw.timestamp = item.depositTime;
                    withdraw.txnHash = actualData.tx_hash;
                    withdraw.status = Status.COMPLETED;
                    await txnEm.save(withdraw);
                    this.logger.debug("Done update of withdraw "+withdraw.withdrawId);
                }
            }
        });
    }
}
