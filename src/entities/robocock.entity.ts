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

  @Column("bigint", { name: "BREED_COUNT", default: () => "'0'" })
  breedCount: string;

  @Column("bigint", { name: "TIER" })
  tier: string;

  isRoboHEN():boolean{
    return parseInt(this.type) === 1;
  }
  isRoboCOCK():boolean{
    return parseInt(this.type) === 0;
  }
  isOG():boolean{
    return parseInt(this.generation) === 0;
  }
}
