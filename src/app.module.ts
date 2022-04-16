import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WinstonModule } from "nest-winston";

import { BlockchainModule } from "./blockchain/blockchain.module";
import { JobsModule } from "./jobs/jobs.module";
import { loggerOpts } from "./winston.config";

@Module({
  imports: [    
    TypeOrmModule.forRoot(), 
    WinstonModule.forRoot(loggerOpts),
    ScheduleModule.forRoot(), JobsModule, BlockchainModule],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
