import { Module } from "@nestjs/common";

import { Constants } from "../common/constants";
import { BreedPaymentJobService } from "./breed-payment-job/breed-payment-job.service";
import { CockFactoryNFTJobService } from "./cock-factory-job/cock-factory-job.service";
import { ConversionJobService } from "./conversion-job/conversion-job.service";
import { DepositWithdrawJobService } from "./deposit-withdraw-job/deposit-withdraw-job.service";
import { MockService } from "./mock.service";
import { RobocockNftJobService } from "./nft-job/robocock-nft-job.service";
import { CancelExpiredPveService } from "./store-proc-job/cancel_expired_pve.service";
import { ReleaseCrystalService } from "./store-proc-job/release-crystal.service";
import { TrainRecordService } from "./store-proc-job/train-record.service";
import { TransferService } from "./transfer-job/transfer.service";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
@Module({
  imports:[
     
   
  ],
  providers: [ 
    process.env.ENABLE_ROBOCOCK_NFT_JOB === Constants.YES ?  RobocockNftJobService : MockService,
    process.env.ENABLE_ROBOCOCK_BREED_JOB === Constants.YES ?  BreedPaymentJobService : MockService,
    process.env.ENABLE_COCK_FACTORY_NFT_JOB === Constants.YES ?  CockFactoryNFTJobService : MockService,
    process.env.ENABLE_TRANSFER_JOB === Constants.YES ?  TransferService : MockService,
    process.env.ENABLE_CONVERSION_JOB === Constants.YES ? ConversionJobService: MockService,
    process.env.ENABLE_DEPOSIT_WITHDRAW_JOB === Constants.YES ? DepositWithdrawJobService : MockService,

    process.env.ENABLE_STORE_PROC_JOB === Constants.YES ? CancelExpiredPveService : MockService,
    process.env.ENABLE_STORE_PROC_JOB === Constants.YES ? ReleaseCrystalService : MockService,
    process.env.ENABLE_STORE_PROC_JOB === Constants.YES ? TrainRecordService : MockService
 
  ],
})
export class JobsModule {}
