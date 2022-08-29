import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { Core } from "../core/database/core.entity";
 

@Index("U_EXCHANGE_TOKEN_TXN_1", ["nonce"], { unique: true })
@Entity("exchange_token_txn")
export class ExchangeTokenTxn extends Core {
  @PrimaryGeneratedColumn("uuid", {
     
    name: "EXCHANGE_TOKEN_TXN_ID",
    
  })
  exchangeTokenTxnId: string;

  @Column("decimal", { name: "CRYSTAL_AMOUNT", precision: 28, scale: 18 })
  crystalAmount: string;

  @Column("decimal", { name: "EXCHANGE_RATE", precision: 28, scale: 18 })
  exchangeRate: string;

  @Column("decimal", { name: "FEE_RATE", precision: 28, scale: 18 })
  feeRate: string;

  @Column("varchar", { name: "STATUS", length: 30 })
  status: string;

  @Column("varchar", { name: "USER_ID", length: 36 })
  userId: string;

  @Column("varchar", { name: "WALLET_ADDRESS", length: 100 })
  walletAddress: string;

  @Column("mediumtext", { name: "SIGN", nullable: true })
  sign: string | null;

  @Column("bigint", { name: "NONCE", unique: true })
  nonce: string;

  @Column("varchar", { name: "TXN_HASH", nullable: true, length: 200 })
  txnHash: string | null;

  @Column("json", { name: "TXN_DETAILS", nullable: true })
  txnDetails: object | null;

  @Column("varchar", { name: "SIGNED_BY", length: 100 })
  signedBy: string;

   
}
