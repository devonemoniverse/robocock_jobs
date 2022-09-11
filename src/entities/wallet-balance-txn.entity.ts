import BigNumber from "bignumber.js";
import { Column, Entity, EntityManager, PrimaryGeneratedColumn } from "typeorm";
import { Core } from "../core/database/core.entity";
import { WalletTxn } from "../jobs/enum/wallet-txn.enum";

 
import { WalletBalance } from "./wallet-balance.entity";

@Entity("wallet_balance_txn" )
export class WalletBalanceTxn extends Core {
  @PrimaryGeneratedColumn("uuid",{name: "WALLET_BALANCE_TXN_ID"})
  walletBalanceTxnId: string;

  @Column("varchar", { name: "WALLET_BALANCE_ID", length: 36 })
  walletBalanceId: string;

  @Column("varchar", { name: "WALLET_ID", length: 36 })
  walletId: string;

  @Column("decimal", {
    name: "BALANCE",
    precision: 28,
    scale: 18,
    default: () => "'0.000000000000000000'",
  })
  balance: string;

  @Column("varchar", { name: "TYPE", length: 100 })
  type: string;

  @Column("decimal", { name: "TOTAL_BALANCE", precision: 28, scale: 18 })
  totalBalance: string;

  @Column("varchar", { name: "REASON", length: 200 })
  reason: string;

  static async create(transactionManager: EntityManager, walletBalance: WalletBalance, amount: string, reason: WalletTxn) {
    const txn = new WalletBalanceTxn();
    txn.balance = walletBalance.balance;
    txn.totalBalance = new BigNumber(txn.balance).plus(amount).toString();
    txn.reason = reason;
    txn.type = walletBalance.type;
    txn.walletBalanceId = walletBalance.walletBalanceId;
    txn.walletId = walletBalance.walletId;
    await transactionManager.save(txn);
  }
}
