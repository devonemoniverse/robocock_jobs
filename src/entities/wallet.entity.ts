import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { Core } from "../core/database/core.entity";

 

@Index("U_WALLET_1", ["userId", "walletAddress"], { unique: true })
@Entity("wallet" )
export class Wallet extends Core {
  @PrimaryGeneratedColumn("uuid",{name: "WALLET_ID"})
  walletId: string;

  @Column("varchar", { name: "USER_ID", length: 36 })
  userId: string;

  @Column("varchar", { name: "WALLET_ADDRESS", nullable: true, length: 100 })
  walletAddress: string | null;

  @Column("longtext", { name: "NONCE" })
  nonce: string;

}
