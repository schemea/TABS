import { Column, Resource, Type } from "../decorator/resource";

@Resource
export class Unit {
    public readonly faction: string;
    public readonly name: string;

    @Type("int")
    public readonly cost: number;

    @Type("int")
    public readonly hp: number;

    @Column("main weapon")
    public readonly mainWeapon: string;

    @Column("off weapon")
    public readonly offWeapon: string;

    @Type("int")
    public readonly rating: number;

    public readonly comments: string;


    constructor(faction: string, name: string, cost: number, hp: number, mainWeapon: string, offWeapon: string, rating: number, comments: string) {
        this.faction = faction;
        this.name = name;
        this.cost = cost;
        this.hp = hp;
        this.mainWeapon = mainWeapon;
        this.offWeapon = offWeapon;
        this.rating = rating;
        this.comments = comments;
    }
}
