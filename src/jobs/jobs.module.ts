import { Module } from "@nestjs/common";

import { Constants } from "../common/constants";
import { MockService } from "./mock.service";
import { RobocockNftJobService } from "./nft-job/robocock-nft-job.service";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
@Module({
  imports:[
     
   
  ],
  providers: [ 
    process.env.ENABLE_ROBOCOCK_NFT_JOB === Constants.YES ?  RobocockNftJobService : MockService,
 
  ],
})
export class JobsModule {}
