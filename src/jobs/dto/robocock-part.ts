export enum RobocockPartEnum {
    HEAD = "HEAD",
    BODY = "BODY",
    WINGS = "WINGS",
    TAIL = "TAIL",
    FEET = "FEET"
}
export enum RobocockClassEnum {
    // 0 - zombie
    ZOMBIE = "ZOMBIE",
    // 1 - berserker
    BERSERKER="BERSERKER",
    // 2 - ancient
    ANCIENT="ANCIENT",
    // 3 - mecha
    MECHA="MECHA",
    // 4 - ninja
    NINJA="NINJA",
    // 5 - aquatic"
    AQUATIC="AQUATIC",
}
const Parts ={
    0 : RobocockPartEnum.HEAD,
    1 : RobocockPartEnum.BODY,
    2 : RobocockPartEnum.WINGS,
    3 : RobocockPartEnum.TAIL,
    4 : RobocockPartEnum.FEET
}
export const RobocockClass ={
    0: RobocockClassEnum.ZOMBIE,
    1: RobocockClassEnum.BERSERKER,
    2: RobocockClassEnum.ANCIENT,
    3: RobocockClassEnum.MECHA,
    4: RobocockClassEnum.NINJA,
    5: RobocockClassEnum.AQUATIC
}
export enum RobocockIdToClassMap {
    // 0 - zombie
    ZOMBIE = 0,
    // 1 - berserker
    BERSERKER=1,
    // 2 - ancient
    ANCIENT=2,
    // 3 - mecha
    MECHA=3,
    // 4 - ninja
    NINJA=4,
    // 5 - aquatic"
    AQUATIC=5,
}
export class RobocockPart {
    constructor(genePart: string){
        if(genePart.length !== 7){
            throw new Error("invalid part gene");
        }
        const partId = genePart.substring(0,1);
        this.name = Parts[partId];

        this.dominant = parseInt(genePart.substring(1,3));
        this.recessesive1 = parseInt(genePart.substring(3,5));
        this.recessesive2 = parseInt(genePart.substring(5,7));

        this.dominantClass = RobocockClass[this.dominant];
        this.recessesive1Class = RobocockClass[this.recessesive1];
        this.recessesive2Class = RobocockClass[this.recessesive2];
        
        if(!this.dominantClass || !this.recessesive1Class || !this.recessesive2Class){
            throw new Error("invalid genes class ");
        }
    }
    name: RobocockPartEnum;

    dominant: number;
    recessesive1: number;
    recessesive2: number;

    dominantClass: string;
    recessesive1Class: string;
    recessesive2Class: string;

    dominantPercentage = 38;
    recessesive1Percentage = 9;
    recessesive2Percentage = 3;
}