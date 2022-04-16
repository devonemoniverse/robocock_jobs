import BigNumber from "bignumber.js";

export interface IWeb3 {
    id: string;
    eth: any;
}
const Web3 = require("web3");
export class Web3Utils {
    static getGasUsed(web3: IWeb3, receipt: any, rawTxn: any): any {
        return this.fromWei(web3,(new BigNumber( rawTxn.gasPrice)).times(receipt.gasUsed).toString());
    }
    static async getTimestamp(web3, blockNumber: any) {
        const result = await this.getBlockInfo(web3, blockNumber);
        return result.timestamp;
    }
    static async getBlockInfo(web3, blockNumber: any) {
        return await web3.eth.getBlock( blockNumber);
    }
    static loadContract(contractJson, contractAddress, web3: IWeb3) {
        return new web3.eth.Contract(contractJson, contractAddress);
    }
    static async loadAndGetContract(contractJson, contractAddress, web3: IWeb3) {
        const contractObj = await this.loadContract(contractJson, contractAddress, web3);
        return contractObj.methods;
    }
    static   createWeb3(rpcUrl): IWeb3 {
        const WEB3_PROVIDER = new Web3.providers.HttpProvider(rpcUrl);
        const web3 = new Web3(WEB3_PROVIDER);
        return web3;
    }
    static fromWei(web3, n){
        return web3.utils.fromWei(n,'ether');
    }

    static async getGasPrice(web3){
        const gasPrice = await web3.eth.getGasPrice();
        return gasPrice;
    }
 
}