import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("class_stat" )
export class ClassStat extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "CLASS_STAT_ID" })
  classStatId: string;

  @Column("varchar", { name: "STAT_CODE", length: 300 })
  statCode: string;

  @Column("varchar", { name: "CLASS", length: 300 })
  class: string;

  @Column("bigint", { name: "CLASS_ID" })
  classId: string;

  @Column("decimal", { name: "STAT_CAP", precision: 28, scale: 18 })
  statCap: string;

  @Column("bigint", { name: "STAT_ORDER" })
  statOrder: string;
}
