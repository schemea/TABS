import { Resource, Type } from "../decorator/resource";
import { Index } from "../decorator/indexing";

@Resource
export class Ability {

    @Index
    public readonly name: string

    @Type("int")
    public readonly range: number

    public readonly description: string


    constructor(name: string, range: number, description: string) {
        this.name = name;
        this.range = range;
        this.description = description;
    }
}
