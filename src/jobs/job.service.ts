import { Injectable } from "@nestjs/common";
import { Interval, SchedulerRegistry } from "@nestjs/schedule";
import { Logger } from "winston";

@Injectable()
export abstract class JobService {
   
    constructor(
      private _schedulerRegistry: SchedulerRegistry,
      
      private readonly _logger: Logger,  
    ) {}
  
    private async _runJob() : Promise<void> {
      if(!this.isDisableLogging())this._logger.debug(this.getJobName()+" started processing...");

      await this.runJob().catch(err=>{
        this._logger.error(err);
      });
      
      if(!this.isDisableLogging())this._logger.debug(this.getJobName()+" done processing...");

      this._schedulerRegistry.deleteTimeout(this.getJobName());
 
    }
  
    addTimeout(name: string, milliseconds: number) : void{
      const me = this;
      
      const callback = async () => { 
        await me._runJob();
      };
    
      const timeout = setTimeout(callback, milliseconds);
      this._schedulerRegistry.addTimeout(name, timeout);
    }   
    
    @Interval(1000)
    checkTimeout(): void{
      try{
        this._schedulerRegistry.getTimeout(this.getJobName());
      }catch(err){
        this.addTimeout(this.getJobName(),this.getJobTimeout());  
      }
    }

    abstract getJobName(): string;
    abstract getJobTimeout(): number;
    abstract runJob(): Promise<void>    
    isDisableLogging(){
      return false;
    }
}