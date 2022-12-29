import { Inject, Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { Logger } from "winston";

import { QUERIES } from "../../database/queries";
import { JobService } from "../job.service";

@Injectable()
export class ReleaseCrystalService extends JobService {
    
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        @InjectEntityManager()
        protected readonly em: EntityManager,
        @Inject("winston")
        protected readonly logger: Logger
        ){
        super(schedulerRegistry, logger);
        logger.info(this.getJobName()+" has been initialized");
    }

    getJobName(): string {
        return "ReleaseCrystalService";
    }
    getJobTimeout(): number {
        return 1000;
    }
    async runJob(): Promise<void> {
        await this.em.transaction(async (txnEm:EntityManager)=>{
            await txnEm.query(QUERIES.SET_SESSION_USER,[-1]);
            const res = await txnEm.query("call release_crystal()");
            console.log("result of release_crystal : ",res);
        });
    }
     

}
