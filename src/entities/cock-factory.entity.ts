import { Column, Entity } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("cock_factory")
export class CockFactory extends Core {
  @Column("bigint", { primary: true, name: "COCK_FACTORY_ID" })
  cockFactoryId: string;

  @Column("varchar", { name: "OWNER", length: 64 })
  owner: string;

  
}
