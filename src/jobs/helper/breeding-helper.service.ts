import { Injectable } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { EntityManager } from "typeorm";

import { SYSPAR } from "../../common/enum";
import { ClassStat } from "../../entities/class-stat.entity";
import { Part } from "../../entities/part.entity";
import { RobocockPartStat } from "../../entities/robocock-part-stat.entity";
import { RobocockStat } from "../../entities/robocock-stat.entity";
import { Robocock } from "../../entities/robocock.entity";
import { SysPar } from "../../entities/sys-par.entity";
import { RobocockPart } from "../dto/robocock-part";

/*

https://docs.nestjs.com/providers#services
*/

@Injectable()
export class BreedingHelperService {
    static async  updateTierPartsClass(txnEm: EntityManager, r: Robocock) {
        const parts = await txnEm.find(Part, { order: { partId: "ASC" } });
        const tierParts = r.attributes.tierParts;
        
        const offSpringGenes = r.getClassGenes();
        
        for (const part of parts) {
            const partId = parseInt(part.partId);
            const offSprintClasses = offSpringGenes.substring(partId * 7, 7 * (partId + 1)); // get the string part
            const offSpringPart = new RobocockPart(offSprintClasses);
            
            // added updating tier class 
            tierParts[part.code].class = offSpringPart.dominantClass;
            tierParts[part.code].classId = offSpringPart.dominant;
        }

        // save the new updated tierPars;
        r.attributes.tierParts = tierParts;
    } 
    public static async createRobocockStatAndMainStatForNormal(txnEm: EntityManager, r: Robocock): Promise<any> {
        const baseStat = await SysPar.getValue(txnEm, SYSPAR.BASE_STAT);
        const parts = await txnEm.find(Part, { order: { partId: "ASC" } });

        const offSpringGenes = r.getClassGenes();

        const sumStats = {};
         
        // for each part there are possibilities different dominant class
        for (const part of parts) {
            const partId = parseInt(part.partId);
            const offSprintClasses = offSpringGenes.substring(partId * 7, 7 * (partId + 1)); // get the string part
            const offSpringPart = new RobocockPart(offSprintClasses);
            
 

            // get the dominant class and use this to get the stats
            const classStats = await txnEm.find(ClassStat, {
                where: { classId: offSpringPart.dominant },
                order: {
                    statOrder: "ASC"
                }
            });

            for (const classStat of classStats) {
                const robocockPartStat = new RobocockPartStat();
                robocockPartStat.partCode = part.code;
                robocockPartStat.partId = part.partId;

                robocockPartStat.class = offSpringPart.dominantClass; // use the dominant class
                robocockPartStat.classId = offSpringPart.dominant.toString(); // use the dominant class

                robocockPartStat.nftId = r.robocockId;

                robocockPartStat.stat = baseStat;
                robocockPartStat.statCap = classStat.statCap;
                robocockPartStat.statCode = classStat.statCode;
                if (!sumStats[robocockPartStat.statCode]) {
                    sumStats[robocockPartStat.statCode] = { statCap: 0, stat: 0 };
                }
                sumStats[robocockPartStat.statCode].statCap += parseFloat(robocockPartStat.statCap);
                sumStats[robocockPartStat.statCode].stat += parseFloat(robocockPartStat.stat);
                await txnEm.save(robocockPartStat);
            }
        }
    
        
        // create robocock main stat
        for (const key of Object.keys(sumStats)) {
            const robocockStat = new RobocockStat();
            robocockStat.class = r.class;
            robocockStat.classId = r.classId;

            robocockStat.robocockId = r.robocockId;
            robocockStat.stat = sumStats[key].stat;
            robocockStat.statCap = sumStats[key].statCap;
            robocockStat.statCode = key;

            await txnEm.save(robocockStat);
        }
    }

    public static async createRobocockStatAndMainStatForOG(txnEm: EntityManager, r: Robocock): Promise<any> {
        const baseStat = await SysPar.getValue(txnEm, SYSPAR.BASE_STAT);
        const classStats = await txnEm.find(ClassStat, {
            where: { classId: r.classId },
            order: {
                statOrder: "ASC"
            }
        });
        const tierParts = r.attributes.tierParts;
        const parts = await txnEm.find(Part, { order: { partId: "ASC" } });
        for (const part of parts) {
            for (const classStat of classStats) {
                const robocockPartStat = new RobocockPartStat();
                robocockPartStat.partCode = part.code;
                robocockPartStat.partId = part.partId;

                robocockPartStat.class = r.class;
                robocockPartStat.classId = r.classId;

                robocockPartStat.nftId = r.robocockId;

                robocockPartStat.stat = baseStat;
                robocockPartStat.statCap = classStat.statCap;
                robocockPartStat.statCode = classStat.statCode;
                await txnEm.save(robocockPartStat);
            }
            tierParts[part.code].class = r.class;
            tierParts[part.code].classId = r.classId;
        }

        // save the new updated tierPars;
        r.attributes.tierParts = tierParts;
        await txnEm.save(r);
    

        // create robocock main stat
        for (const classStat of classStats) {

            const robocockStat = new RobocockStat();
            robocockStat.class = r.class;
            robocockStat.classId = r.classId;

            robocockStat.robocockId = r.robocockId;
            robocockStat.stat = new BigNumber(baseStat).multipliedBy(parts.length).toFixed();
            robocockStat.statCap = new BigNumber(classStat.statCap).multipliedBy(parts.length).toFixed();
            robocockStat.statCode = classStat.statCode;

            await txnEm.save(robocockStat);
        }
    }

}
