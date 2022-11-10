import "./ability.scss";

import React from "react";
import { Ability } from "../resource/ability";

interface Props {
    ability: Ability;
}

export function AbilityView({ ability }: Props) {

    return (
        <div className="ability-view">
            <h3>{ ability.name }</h3>
            <div className="ability-content">
                <p>{ !!ability.range && `Range: ${ ability.range } WM` }</p>
                <p>{ ability.description }</p>
            </div>
        </div>
    );
}
