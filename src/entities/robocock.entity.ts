import { Column, Entity } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("robocock")
export class Robocock extends Core {
  @Column("bigint", { primary: true, name: "ROBOCOCK_ID" })
  robocockId: string;

  @Column("varchar", { name: "TYPE", length: 200 })
  type: string;

  @Column("varchar", { name: "CLASS", length: 200 })
  class: string;

  @Column("bigint", { name: "GENERATION" })
  generation: string;

  @Column("json", { name: "ATTRIBUTES" })
  attributes ;

  @Column("varchar", { name: "OWNER", length: 64 })
  owner: string;
}
