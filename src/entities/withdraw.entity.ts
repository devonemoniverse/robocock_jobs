import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Index("U_WITHDRAW_1", ["txnHash"], { unique: true })
@Index("U_WITHDRAW_2", ["nonce"], { unique: true })
@Entity("withdraw")
export class Withdraw extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "WITHDRAW_ID" })
  withdrawId: string;

  @Column("varchar", {
    name: "TXN_HASH",
    nullable: true,
    unique: true,
    length: 750,
  })
  txnHash: string | null;

  @Column("decimal", { name: "AMOUNT", precision: 28, scale: 18 })
  amount: string;

  @Column("bigint", { name: "TIMESTAMP", nullable: true })
  timestamp: string | null;

  @Column("varchar", { name: "USER", length: 100 })
  user: string;

  @Column("mediumtext", { name: "SIGN" })
  sign: string;

  @Column("varchar", { name: "SIGNED_BY", length: 100 })
  signedBy: string;

  @Column("mediumtext", { name: "WALLET_SIGN", nullable: true })
  walletSign: string | null;

  @Column("bigint", { name: "NONCE", unique: true })
  nonce: string;

  @Column("varchar", { name: "STATUS", length: 30 })
  status: string;

   
}
