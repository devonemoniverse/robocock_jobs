import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

import { Core } from "../core/database/core.entity";

@Index("U_ROBOCOCK_STAT_1", ["robocockId", "statCode"], { unique: true })
@Entity("robocock_stat")
export class RobocockStat extends Core {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ROBOCOCK_STAT_ID" })
  robocockStatId: string;

  @Column("bigint", { name: "ROBOCOCK_ID" })
  robocockId: string;

  @Column("varchar", { name: "CLASS", length: 200 })
  class: string;

  @Column("bigint", { name: "CLASS_ID" })
  classId: string;

  @Column("varchar", { name: "STAT_CODE", length: 300 })
  statCode: string;

  @Column("decimal", { name: "STAT", precision: 28, scale: 18 })
  stat: string;

  @Column("decimal", { name: "STAT_CAP", precision: 28, scale: 18 })
  statCap: string;
}
