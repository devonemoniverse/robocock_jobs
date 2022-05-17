import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Core } from '../core/database/core.entity';

@Entity("breed_request" )
export class BreedRequest extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "BREED_REQUEST_ID" })
  breedRequestId: string;

  @Column("varchar", { name: "GENES", length: 50 })
  genes: string;

  @Column("bigint", { name: "ROBOCOCK_ID" })
  robocockId: string;

  @Column("bigint", { name: "ROBOHEN_ID" })
  robohenId: string;

   

  @Column("varchar", { name: "ADDRESS", length: 64 })
  address: string;

  @Column("varchar", { name: "STATUS", length: 1 })
  status: string;

  @Column("varchar", { name: "TXN_HASH", length: 100 })
  txnHash: string;

  @Column("bigint", { name: "PAYMENT_REQUEST_ID" })
  paymentRequestId: string;

  @Column("timestamp", { name: "HATCH_DATE" })
  hatchDate: Date;

  @Column("varchar", { name: "CLASS", length: 200 })
  class: string;

  @Column("varchar", { name: "TYPE", length: 200 })
  type: string;

  @Column("bigint", { name: "TIER" })
  tier: string;

  @Column("decimal", { name: "TYPE_RAND", precision: 28, scale: 18 })
  typeRand: string;

  @Column("bigint", { name: "CLASS_ID" })
  classId: string;

  @Column("bigint", { name: "GENERATION" })
  generation: string;

  @Column("varchar", { name: "SIGN", length: 300 })
  sign: string;

  @Column("varchar", { name: "IMAGE_URL", nullable: true, length: 300 })
  imageUrl: string | null;

  @Column("varchar", { name: "HEADER_URL", nullable: true, length: 300 })
  headerUrl: string | null;
}
