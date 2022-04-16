import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class Core {
  @VersionColumn({ name: "version_no" })
  versionNo: number;

  @CreateDateColumn({
    name: "created_on",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdOn: Date;

  @Column({ name: "created_by", select: false, insert: false }) 
  createdBy: string;

  @UpdateDateColumn({
    name: "updated_on",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP()",
  })
  updatedOn: Date;

  @Column({ name: "updated_by", select: false, insert: false }) 
  updatedBy: string;

}
