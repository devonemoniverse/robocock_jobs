import { Inject, Injectable } from "@nestjs/common";
import { Logger } from "winston";

import { IWeb3, Web3Utils } from "./web3-util";

@Injectable()
export class Web3Pool {
    private _available = [];
    private _inUsed = {};
    private _instanceCount = 0;
    constructor( 
        @Inject("winston")
        private readonly logger: Logger){
    }

    getWeb3(rpcUrl): IWeb3 {
        let web3Instance=null;
        if (this._available.length ==0 ){
            web3Instance = Web3Utils.createWeb3(rpcUrl);
            web3Instance.id = "id_"+ (this._instanceCount++);
        } else {
            web3Instance = this._available.pop();
        }
        //this.logger.info(`Web3Pool.getWeb3 - id ${ web3Instance.id}`);
        this._inUsed[ web3Instance.id]=  web3Instance;
        return  web3Instance;
    }

    release (tw: IWeb3 ): void {
       // this.logger.info(`Web3Pool.release - id ${tw.id}`);
        delete this._inUsed[tw.id];
        this._available.push(tw);
    }
}