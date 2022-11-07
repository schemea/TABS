import { Column, Resource, Type } from "../decorator/resource";

@Resource
export class WeaponComponent {

    public readonly source: string

    public readonly name: string

    @Type("float")
    public readonly damage: number

    @Type("int")
    @Column("force on hit")
    public readonly forceOnHit: number;

    @Type("float")
    public readonly radius: number;

    @Type("float")
    public readonly dps: number;


    constructor(source: string, name: string, damage: number, forceOnHit: number, radius: number, dps: number) {
        this.source = source;
        this.name = name;
        this.damage = damage;
        this.forceOnHit = forceOnHit;
        this.radius = radius;
        this.dps = dps;
    }
}
