import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Core } from "../core/database/core.entity";
import { AssetCode } from "../jobs/enum/asset-code.enum";

 
import { Wallet } from "./wallet.entity";

@Entity("wallet_balance" )
export class WalletBalance extends Core {
   
  @PrimaryGeneratedColumn("uuid",{name: "WALLET_BALANCE_ID"})
  walletBalanceId: string;

  @Column("varchar", { name: "USER_ID", length: 36 })
  userId: string;

  @Column("varchar", { name: "WALLET_ID", length: 36 })
  walletId: string;

  @Column("decimal", {
    name: "BALANCE",
    precision: 28,
    scale: 18,
    default: () => "'0.000000000000000000'",
  })
  balance: string;

  @Column("decimal", {
    name: "FROZEN_BALANCE",
    precision: 28,
    scale: 18,
    default: () => "'0.000000000000000000'",
  })
  frozenBalance: string;

  @Column("varchar", { name: "TYPE", length: 100 })
  type: string;

  @Column("decimal", {
    name: "CONVERTIBLE_BALANCE",
    precision: 28,
    scale: 18,
    default: () => "'0.000000000000000000'",
  })
  convertibleBalance: string;

  static createBalance(type: AssetCode, wallet: Wallet): WalletBalance {
    const walletBalance = new WalletBalance();
    walletBalance.balance = "0";
    walletBalance.type = type;
    walletBalance.walletId = wallet.walletId;
    walletBalance.userId = wallet.userId;
    return walletBalance;
  }
}
