import { Column, Entity } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("part")
export class Part extends Core {
  @Column("bigint", { primary: true, name: "PART_ID" })
  partId: string;

  @Column("varchar", { name: "CODE", length: 300 })
  code: string;

}
