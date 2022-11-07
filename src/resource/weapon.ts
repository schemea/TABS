import { Column, Resource, Type } from "../decorator/resource";

export enum WeaponType {
    Melee,
}

@Resource
export class Weapon {
    public readonly name: string;

    public readonly type: WeaponType;

    public readonly projectile: string

    @Type("float")
    public readonly range: number;

    @Type("float")
    public readonly cooldown: number;

    @Type("float")
    @Column("shoot delay")
    public readonly shootDelay: number;

    @Type("float")
    public readonly damage: number;

    @Type("float")
    public readonly dps: number;

    @Type("int")
    @Column("force on hit")
    public readonly forceOnHit: number;

    constructor(name: string, type: WeaponType, projectile: string, range: number, cooldown: number, shootDelay: number, damage: number, dps: number, knockback: number) {
        this.name = name;
        this.type = type;
        this.projectile = projectile;
        this.range = range;
        this.cooldown = cooldown;
        this.shootDelay = shootDelay;
        this.damage = damage;
        this.dps = dps;
        this.forceOnHit = knockback;
    }
}
