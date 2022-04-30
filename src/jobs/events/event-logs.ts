import { ILog } from "./ILog";

export class EventLogs implements ILog {
    data: any;
    typesArray: any;
    topics: any;
    name: any;
    constructor(data,  topics, name, json){
        this.data = data;
        this.typesArray = [];
        this.topics = topics;
        this.name = name;
        
        for(const data of json){
            if(data.type === "event" && data.name === name){
                this.typesArray = data.inputs;
                break;
            }
        }
    }
   
    getLogName(){
        return this.name;
    }
     
    getParseLog(web3: any) {
        const obj = {};
        const decodedParameters = web3.eth.abi.decodeLog(this.typesArray, this.data, this.topics);
        for(const type of this.typesArray){
            const name = type.name;
            const val = decodedParameters[name];
            if(!!type["components"]){
                const objVal = {};
                const types = type["components"];
                for(let i = 0;i< types.length;i++){
                    objVal[types[i].name] = val[i];
                }
                obj[name] = objVal;
            } else {
                obj[name] = val;
            }
        }
        return obj;
    }
    
}