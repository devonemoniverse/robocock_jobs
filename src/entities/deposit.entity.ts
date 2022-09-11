import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Index("U_DEPOSIT_1", ["txnHash"], { unique: true })
@Entity("deposit" )
export class Deposit extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "DEPOSIT_ID" })
  depositId: string;

  @Column("varchar", { name: "TXN_HASH", unique: true, length: 750 })
  txnHash: string;

  @Column("decimal", { name: "AMOUNT", precision: 28, scale: 18 })
  amount: string;

  @Column("bigint", { name: "TIMESTAMP" })
  timestamp: string;

  @Column("varchar", { name: "DEPOSITOR", length: 100 })
  depositor: string;

   
}
