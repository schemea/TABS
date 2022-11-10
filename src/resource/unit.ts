import { Resource, Type } from "../decorator/resource";
import { Index } from "../decorator/indexing";
import { Column } from "../decorator/column";

@Resource
export class Unit {
    @Index
    public readonly name: string;

    public readonly faction: string;

    @Type("int")
    public readonly cost: number;

    @Type("int")
    public readonly hp: number;

    @Column("main weapon")
    public readonly mainWeapon: string;

    @Column("off weapon")
    public readonly offWeapon: string;

    public readonly ability: string;

    @Type("int")
    public readonly rating: number;

    public readonly comments: string;

    constructor(name: string, faction: string, cost: number, hp: number, mainWeapon: string, offWeapon: string, ability: string, rating: number, comments: string) {
        this.name = name;
        this.faction = faction;
        this.cost = cost;
        this.hp = hp;
        this.mainWeapon = mainWeapon;
        this.offWeapon = offWeapon;
        this.ability = ability;
        this.rating = rating;
        this.comments = comments;
    }
}
