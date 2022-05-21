import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("robocock_part_stat")
export class RobocockPartStat extends Core  {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ROBOCOCK_PART_STAT" })
  robocockPartStat: string;

  @Column("varchar", { name: "STAT_CODE", length: 300 })
  statCode: string;

  @Column("decimal", { name: "STAT_CAP", precision: 28, scale: 18 })
  statCap: string;

  @Column("decimal", {
    name: "STAT",
    precision: 28,
    scale: 18,
    default: () => "'8.000000000000000000'",
  })
  stat: string;

  @Column("bigint", { name: "NFT_ID" })
  nftId: string;

  @Column("bigint", { name: "PART_ID" })
  partId: string;

  @Column("varchar", { name: "PART_CODE", length: 300 })
  partCode: string;

  @Column("bigint", { name: "CLASS_ID" })
  classId: string;

  @Column("varchar", { name: "CLASS", length: 300 })
  class: string;

  
}
