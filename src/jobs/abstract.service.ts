import { Injectable } from "@nestjs/common";

import { JobService } from "./job.service";

@Injectable()
export abstract class AbstractService extends JobService   {
     
    abstract getEventNameMapping(topicHash);
   
    getEventName(data: any, web3) {
        let rawData = data;
        if((rawData.raw_log_topics && rawData.raw_log_data) || rawData.raw_log_topics){
            rawData = {
                log_events: [data]
            }
        }

        if(rawData.log_events){
            const logEvents = rawData.log_events;
            for(const ev of logEvents){
                const topics = ev["raw_log_topics"];
                if(topics){
                    
                    for(const topic of topics){
                        const eventName = this.getEventNameMapping(topic.toLowerCase());
                        if(!!eventName){
                            return eventName(ev.raw_log_data, ev.raw_log_topics);
                        }
                    }
                }
            }
        }
        return null;
    }
}