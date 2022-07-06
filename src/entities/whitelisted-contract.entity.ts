import { Column, Entity } from "typeorm";
import { Core } from "../core/database/core.entity";

@Entity("whitelisted_contract" )
export class WhitelistedContract extends Core {
  @Column("varchar", { primary: true, name: "CONTRACT_ADDRESS", length: 300 })
  contractAddress: string;

  @Column("varchar", { name: "DESCRIPTION", length: 300 })
  description: string;

   
}
