import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("cock_factory_req")
export class CockFactoryReq extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "COCK_FACTORY_REQ_ID" })
  cockFactoryReqId: string;

  @Column("varchar", { name: "ADDRESS", length: 64 })
  address: string;

  @Column("varchar", { name: "SIGN", length: 300 })
  sign: string;

  @Column("varchar", { name: "TXN_HASH", length: 200 })
  txnHash: string;
}
