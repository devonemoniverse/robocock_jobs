import { Global, Module } from "@nestjs/common";

import { BlockchainService } from "./blockchain.service";
import { Web3Pool } from "./web3-pool";

/*
https://docs.nestjs.com/modules
*/
@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [BlockchainService, Web3Pool],
    exports:[BlockchainService, Web3Pool]
})
export class BlockchainModule { }
