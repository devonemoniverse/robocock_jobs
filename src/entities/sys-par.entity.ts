import { Column, Entity, EntityManager } from "typeorm";

import { Constants } from "../common/constants";
import { SYSPAR } from "../common/enum";
import { Core } from "../core/database/core.entity";

@Entity("sys_par")
export class SysPar extends Core {
  
  @Column("varchar", { primary: true, name: "CODE", length: 60 })
  code: string;

  @Column("longtext", { name: "DESC" })
  desc: string;

  @Column("longtext", { name: "VALUE" })
  value: string;

  @Column("varchar", { name: "INTERNAL", length: 1 })
  internal: string;

  @Column("varchar", { name: "ENABLED", length: 1 })
  enabled: string;

  @Column("varchar", { name: "DATA_TYPE", length: 50 })
  dataType: string;

  @Column("longtext", { name: "DEFAULT_VALUE", nullable: true })
  defaultValue: string | null;
 
  static async getValue(txnEm: EntityManager, code: SYSPAR) {
    const syspar = await txnEm.findOne(SysPar,{code: code});
    return syspar.isEnabled() ? syspar.value : syspar.defaultValue;
  }
  isEnabled() {
    return this.enabled === Constants.YES;
  }
}
