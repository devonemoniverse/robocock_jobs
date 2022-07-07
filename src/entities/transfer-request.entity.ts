import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("transfer_request")
export class TransferRequest extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "TRANSFER_REQUEST_ID" })
  transferRequestId: string;

  @Column("varchar", { name: "OWNER", length: 64 })
  owner: string;

  @Column("varchar", { name: "RECEIVER_ADDRESS", length: 64 })
  receiverAddress: string;

  @Column("bigint", { name: "ROBOCOCK_ID" })
  robocockId: string;

  @Column("decimal", { name: "USD_PRICE", precision: 28, scale: 18 })
  usdPrice: string;

  @Column("decimal", {
    name: "TOKEN_PRICE",
    nullable: true,
    precision: 28,
    scale: 18,
  })
  tokenPrice: string | null;

  @Column("varchar", { name: "STATUS", length: 1 })
  status: string;

  @Column("bigint", { name: "NONCE" })
  nonce: string;

  @Column("varchar", { name: "SIGN", length: 300 })
  sign: string;
}
