import { Module } from '@nestjs/common';

import { Constants } from '../common/constants';
import {
  BreedPaymentJobService,
} from './breed-payment-job/breed-payment-job.service';
import {
  CockFactoryNFTJobService,
} from './cock-factory-job/cock-factory-job.service';
import { MockService } from './mock.service';
import { RobocockNftJobService } from './nft-job/robocock-nft-job.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
@Module({
  imports:[
     
   
  ],
  providers: [ 
    process.env.ENABLE_ROBOCOCK_NFT_JOB === Constants.YES ?  RobocockNftJobService : MockService,
    process.env.ENABLE_ROBOCOCK_BREED_JOB === Constants.YES ?  BreedPaymentJobService : MockService,
    process.env.ENABLE_COCK_FACTORY_NFT_JOB === Constants.YES ?  CockFactoryNFTJobService : MockService,
 
 
  ],
})
export class JobsModule {}
