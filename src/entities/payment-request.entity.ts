import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("payment_request")
export class PaymentRequest extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "PAYMENT_REQUEST_ID" })
  paymentRequestId: string;

  @Column("varchar", { name: "STATUS", length: 1 })
  status: string;

  @Column("varchar", { name: "TXN_HASH", length: 100 })
  txnHash: string;

  @Column("decimal", { name: "TOKEN_AMOUNT", precision: 28, scale: 18 })
  tokenAmount: string;

   

  @Column("varchar", { name: "ADDRESS", length: 64 })
  address: string;

  @Column("varchar", { name: "SIGN", length: 300 })
  sign: string;
}
