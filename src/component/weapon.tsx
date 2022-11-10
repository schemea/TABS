import "./weapon.scss";

import React, { Fragment } from "react";
import { Weapon } from "../resource/weapon";
import { useDataContext } from "../context/data";
import { Effect } from "../resource/effect";
import { WeaponComponent } from "../resource/weapon-component";

interface Props {
    weapon: Weapon;
}

function renderEffect(effect: Effect, id: string) {
    const columns: (keyof Omit<Effect, "source">)[] = [ "dps", "duration", "damage" ];

    const names: Record<keyof Omit<Effect, "source">, string> = {
        dps: "DPS",
        duration: "Duration",
        damage: "Damage",
    };

    function suffix(key: keyof Effect) {
        switch (key) {
            case "dps":
                return " hp/s";
            case "damage":
                return " hp";
            default:
                return "";
        }
    }

    return (
        <table className="weapon-effect" key={ id }>
            <tbody>
            { columns
                .filter(key => !!effect[key])
                .map(key => (
                    <tr key={ key }>
                        <td>{ names[key] }</td>
                        <td>{ effect[key] }{ suffix(key) }</td>
                    </tr>
                )) }
            </tbody>
        </table>
    );

}

function getSuffix<K extends keyof Weapon>(key: K): string {
    switch (key) {
        case "cooldown":
        case "shootDelay":
        case "reload":
            return "s";
        case "damage":
            return " hp";
        case "dps":
            return " hp/s";
        case "range":
            return " WM";
        default:
            return "";
    }
}

function getLabel<K extends (keyof Weapon | keyof WeaponComponent)>(key: K) {
    switch (key) {
        case "name":
            return null;
        case "shootDelay":
            return "Shoot delay";
        case "dps":
            return "DPS";
        case "forceOnHit":
            return "Force on Hit";
        default:
            return key[0].toUpperCase() + key.substring(1);
    }
}

function formatValue<K extends keyof Weapon>(key: K, value: any): string {
    switch (key) {
        case "damage":
            return value ? value.join(" - ") + getSuffix(key) : "";
        default:
            return value + getSuffix(key);
    }
}

export function WeaponView({ weapon }: Props) {
    const data = useDataContext();

    const effects = data.effects.findBy("source", weapon.name)
        .map((effect, index) => renderEffect(effect, index.toString()));

    const components = data.weaponComponents.findBy("source", weapon.name);

    function stat<K extends keyof Weapon>(key: K) {
        const value = weapon[key];
        const componentValues = components
            .filter(component => !!component[key as keyof WeaponComponent])
            .map(component => (
                <Fragment>
                    <div>{ component.name }</div>
                    <div>{ formatValue(key, component[key as keyof WeaponComponent]) }</div>
                </Fragment>
            ));

        if (componentValues.length) {
            if (value) {
                componentValues.unshift(
                    <Fragment>
                        <div>weapon</div>
                        <div>{ formatValue(key, value) }</div>
                    </Fragment>,
                );
            }

            return (
                <tr key={ key }>
                    <td>{ getLabel(key) }</td>
                    <td>
                        <div className="component-stats">
                            { componentValues }
                        </div>
                    </td>
                </tr>
            );
        }

        if (!value) return null;

        return (
            <tr key={ key }>
                <td>{ getLabel(key) }</td>
                <td>{ formatValue(key, value) }</td>
            </tr>
        );
    }

    const statNames: (keyof Weapon)[] = [
        "type",
        "range",
        "count",
        "projectile",
        "damage",
        "cooldown",
        "dps",
        "shootDelay",
        "reload",
        "forceOnHit",
    ];


    return (
        <div className="weapon-view">
            <h3 className="weapon-section">{ weapon.name }</h3>
            <table className="weapon-stats">
                <tbody>
                { statNames.map(stat) }
                </tbody>
            </table>
            { !!effects.length && (
                <Fragment>
                    <h4 className="weapon-section">Effects</h4>
                    { effects }
                </Fragment>
            ) }
        </div>
    );
}
