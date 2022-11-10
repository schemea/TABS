import { Column, Resource, Type } from "../decorator/resource";
import { Index } from "../decorator";

@Resource
export class Subunit {
    @Index
    public readonly source: string;

    public readonly name: string;

    @Type("int")
    public readonly hp: number;

    @Column("main weapon")
    public readonly mainWeapon: string;

    @Column("off weapon")
    public readonly offWeapon: string;


    constructor(source: string, name: string, hp: number, mainWeapon: string, offWeapon: string) {
        this.source = source;
        this.name = name;
        this.hp = hp;
        this.mainWeapon = mainWeapon;
        this.offWeapon = offWeapon;
    }
}
