import { Column, Entity } from "typeorm";

import { Core } from "../core/database/core.entity";

@Entity("robocock")
export class Robocock extends Core {
  
  
  @Column("bigint", { primary: true, name: "ROBOCOCK_ID" })
  robocockId: string;

  @Column("varchar", { name: "TYPE", length: 200 })
  type: string;

  @Column("varchar", { name: "CLASS", length: 200 })
  class: string;

  @Column("bigint", { name: "GENERATION" })
  generation: string;

  @Column("json", { name: "ATTRIBUTES" })
  attributes ;

  @Column("varchar", { name: "OWNER", length: 64 })
  owner: string;

  @Column("bigint", { name: "BREED_COUNT", default: () => "'0'" })
  breedCount: string;

  @Column("bigint", { name: "TIER" })
  tier: string;
  
  @Column("bigint", { name: "CLASS_ID" })
  classId: string;

  @Column("bigint", { name: "PARENT_ROBOCOCK_ID", nullable: true })
  parentRobocockId: string | null;

  @Column("bigint", { name: "PARENT_ROBOHEN_ID", nullable: true })
  parentRobohenId: string | null;

  
  @Column("bigint", { name: "MAX_BREED_COUNT" })
  maxBreedCount: string;
  
  @Column("varchar", { name: "IMAGE_URL", nullable: true, length: 300 })
  imageUrl: string | null;

  @Column("varchar", { name: "HEADER_URL", nullable: true, length: 300 })
  headerUrl: string | null;
  
  isRoboHEN():boolean{
    return parseInt(this.type) === 1;
  }
  isRoboCOCK():boolean{
    return parseInt(this.type) === 0;
  }
  isOG():boolean{
    return parseInt(this.generation) === 0;
  }
  static create(cockInfo, item){
    const r = new Robocock();
    r.class = cockInfo.className;
    r.type = cockInfo.rtype;
    r.robocockId = cockInfo.tokenId;
    r.owner = item.to;
    r.generation = cockInfo.generation;
    r.classId = cockInfo.class;
    return r;
  }
  setDataForBreedNft(cockInfo) {
    this.attributes = {
        genes: this.addPrefix("0",50,cockInfo.genes),
        summonDate: cockInfo.summonDate
    };
    // Regular Robohen 9 Breeding count
    // Regular Robocock 3 Breeding Count
    if(this.isRoboHEN()){
      this.maxBreedCount = "9";
    }else {
      this.maxBreedCount = "3";
    }
  }
  setDataForOGNft(cockInfo: any) {
    // for the case of OG just concatenate
    // allele info
    let genes = 
    "0"+"0"+cockInfo.genes+"0"+cockInfo.genes+"0"+cockInfo.genes+ // head
    "1"+"0"+cockInfo.genes+"0"+cockInfo.genes+"0"+cockInfo.genes+ // body
    "2"+"0"+cockInfo.genes+"0"+cockInfo.genes+"0"+cockInfo.genes+ // wings
    "3"+"0"+cockInfo.genes+"0"+cockInfo.genes+"0"+cockInfo.genes+ // tail
    "4"+"0"+cockInfo.genes+"0"+cockInfo.genes+"0"+cockInfo.genes; // feet

    // tier info
    genes = genes +
    "0"+"0"+"4"+ // head ultra
    "1"+"0"+"4"+ // body ultra
    "2"+"0"+"4"+ // wings ultra
    "3"+"0"+"4"+ // tail ultra
    "4"+"0"+"4"; // feet ultra

    this.attributes = {
        genes,
        summonDate: cockInfo.summonDate,
        tierParts: {
          HEAD : {
            partId: 0,
            roundSpan: 100,
            additionalEarning: 10,
            tierId: 4,
            tier:"ULTRA"
          },
          BODY : {
            partId: 1,
            roundSpan: 100,
            additionalEarning: 10,
            tierId: 4,
            tier:"ULTRA"
          },
          WINGS:{
            partId: 2,
            roundSpan: 100,
            additionalEarning: 10,
            tierId: 4,
            tier:"ULTRA"
          },
          TAIL :{
            partId: 3,
            roundSpan: 100,
            additionalEarning: 10,
            tierId: 4,
            tier:"ULTRA"
          },
          FEET :{
            partId: 4,
            roundSpan: 100,
            additionalEarning: 10,
            tierId: 4,
            tier:"ULTRA"
          }
        }
    };
    
    if(this.isRoboHEN()){
        this.maxBreedCount = "27";
    }else {
        this.maxBreedCount = "9";
    }
  }
  addPrefix(pad: string, size: number, genes: any) {
    let padded = "";
    while(genes.length + padded.length < size){
        padded+=pad;
    } 
    return padded+genes;
  }
}
