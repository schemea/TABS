import { List, Resource, Type } from "../decorator/resource";
import { Index } from "../decorator/indexing";
import { Column } from "../decorator/column";

export enum WeaponType {
    Melee,
}

@Resource
export class Weapon {
    @Index
    public readonly name: string;

    public readonly type: WeaponType;

    public readonly projectile: string;

    @Type("int")
    public readonly count: number;

    @Type("float")
    public readonly range: number;

    @Type("float")
    public readonly cooldown: number;

    @Type("float")
    @Column("shoot delay")
    public readonly shootDelay: number;

    @Type("float")
    @List("-")
    public readonly damage: [ number, number ] | [ number ];

    @Type("float")
    public readonly dps: number;

    @Type("int")
    @Column("force on hit")
    public readonly forceOnHit: number;

    @Type("float")
    public readonly reload: number;


    constructor(name: string, type: WeaponType, projectile: string, count: number, range: number, cooldown: number, shootDelay: number, damage: [ number, number ] | [ number ], dps: number, forceOnHit: number, reload: number) {
        this.name = name;
        this.type = type;
        this.projectile = projectile;
        this.count = count;
        this.range = range;
        this.cooldown = cooldown;
        this.shootDelay = shootDelay;
        this.damage = damage;
        this.dps = dps;
        this.forceOnHit = forceOnHit;
        this.reload = reload;
    }
}
