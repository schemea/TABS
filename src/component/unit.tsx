import "./unit.scss";
import React, { Fragment, useMemo, useState } from "react";
import { Unit } from "../resource/unit";
import { DataContext, useDataContext } from "../context/data";
import { Weapon } from "../resource/weapon";
import { WeaponView } from "./weapon";
import naturalCompare from "string-natural-compare";
import {
    Chip,
    createTheme,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ThemeProvider,
} from "@mui/material";
import { SortEditor } from "./sort-editor";
import { Popin, usePopin } from "./popin";
import { Subunit } from "../resource/subunit";

type SortOption = keyof Unit | "dps" | "range"

function compare<K extends SortOption>(data: DataContext, key: K, a: Unit, b: Unit): number {
    const factionOrder = [
        "TRIBAL",
        "FARMER",
        "MEDIEVAL",
        "ANCIENT",
        "VIKING",
        "DYNASTY",
        "RENAISSANCE",
        "PIRATE",
        "SPOOKY",
        "WILD WEST",
        "LEGACY",
        "GOOD",
        "EVIL",
        "SECRET",
    ];

    function get<T = any>(object: any, key: string): T {
        return object[key];
    }

    function subunit(key: keyof Unit, unit: Unit): number {
        return data.subunits.findBy("source", unit.name)
            .map(value => get<number>(value, key) || 0)
            .reduce((a, b) => a + b, 0);
    }

    function weapon(key: keyof Weapon, name: string): number {
        if (!name) return 0;

        let dps = data.weapons.findBy("name", name)
            .map(value => get<number>(value, key) || 0)
            .reduce((a, b) => a + b, 0);

        dps += data.weaponComponents.findBy("source", name)
            .map(value => get<number>(value, key) || 0)
            .reduce((a, b) => a + b, 0);

        return dps;
    }

    switch (key) {
        case "faction":
            return [ a, b ]
                .map(unit => unit.faction.toUpperCase())
                .map(faction => factionOrder.indexOf(faction))
                .reduce((a, b) => a - b);
        case "hp":
            return [ a, b ]
                .map(unit => get<number>(unit, key) + subunit(key, unit))
                .reduce((a, b) => a - b);
        case "dps":
            return [ a, b ]
                .map(unit => weapon(key, unit.mainWeapon) + weapon(key, unit.offWeapon))
                .reduce((a, b) => a - b);
        case "range":
            return [ a, b ]
                .map(unit => Math.max(weapon(key, unit.mainWeapon), weapon(key, unit.offWeapon)))
                .reduce((a, b) => a - b);
        default:
            if (get(a, key) === undefined || get(a, key) === null) return -1;
            if (get(b, key) === undefined || get(b, key) === null) return 1;
            return naturalCompare(get(a, key).toString(), get(b, key).toString());
    }
}

function createComparer(data: DataContext, order: SortOption[]) {
    return function (...units: [ Unit, Unit ]): number {
        for (const key of order) {
            const result = compare(data, key, ...units);
            if (result !== 0) {
                return result;
            }
        }

        return 0;
    };
}

enum Columns {
    name       = "name",
    faction    = "faction",
    cost       = "cost",
    hp         = "hp",
    mainWeapon = "mainWeapon",
    offWeapon  = "offWeapon",
    rating     = "rating",
    comments   = "comments"
}


const Headers: Record<Columns, string> = {
    [Columns.name]: "Name",
    [Columns.faction]: "Faction",
    [Columns.cost]: "Cost",
    [Columns.hp]: "HP",
    [Columns.mainWeapon]: "Main Weapon",
    [Columns.offWeapon]: "Off Weapon",
    [Columns.rating]: "Rating",
    [Columns.comments]: "Comments",
};

const chipTheme = createTheme({
    palette: {
        primary: {
            main: "#602020b0",
        },
        secondary: {
            main: "#154015b0",
        },
        mode: "dark",
    },
});

function getSuffix(key: keyof Unit) {
    switch (key) {
        case Columns.hp:
            return " hp";
        default:
            return "";
    }
}

function renderColumn(unit: Unit, column: Columns, data: DataContext, popin: Popin<Weapon>) {
    function weapon(name?: string) {
        return function (event: React.MouseEvent<HTMLElement>) {
            const weapon = name ? data.weapons.findBy("name", name)[0] : undefined;
            if (weapon) {
                popin.show(weapon, event);
            } else {
                popin.hide();
            }
        };
    }

    function dps(name: string) {
        const style: React.CSSProperties = {
            // position: "absolute",
            // right: 0,
            minWidth: "70px",
        };

        const weapon = name ? data.weapons.findBy("name", name)[0] : undefined;
        if (weapon) {
            let value = weapon.dps || 0;

            value += data.effects.findBy("source", weapon.name)
                .map(effect => (effect.dps * effect.duration) / weapon.cooldown)
                .reduce((a, b) => a + b, 0);

            value += data.weaponComponents.findBy("source", weapon.name)
                .map(component => component.dps || 0)
                .reduce((a, b) => a + b, 0);

            if (value) {
                const color = value > 0 ? "primary" : "secondary";
                return (
                    <ThemeProvider theme={ chipTheme }>
                        <Chip color={ color } size="small" style={ style }
                              label={ value.toFixed(0) + " hp/s" }/>
                    </ThemeProvider>
                );
            }
        }
        return null;
    }

    function formatValue<K extends keyof Unit>(key: K, value: any) {
        return value.toLocaleString() + getSuffix(key);
    }

    function stat<K extends keyof Unit>(key: K) {
        const value = unit[key];
        const subunitValues = data.subunits.findBy("source", unit.name)
            .filter(subunit => !!subunit[key as keyof Subunit])
            .map(subunit => (
                <Fragment>
                    <div>{ subunit.name }</div>
                    <div>{ formatValue(key, subunit[key as keyof Subunit]) }</div>
                </Fragment>
            ));

        if (subunitValues.length) {
            if (value) {
                subunitValues.unshift(
                    <Fragment>
                        <div>unit</div>
                        <div>{ formatValue(key, value) }</div>
                    </Fragment>,
                );
            }

            return (<div className="subunit-stats">{ subunitValues }</div>);
        }

        return (
            <Fragment>{ formatValue(key, value) }</Fragment>
        );
    }

    switch (column) {
        case Columns.name:
            return <TableCell className="unit-stat" key={ column }>{ unit[column] }</TableCell>;
        case Columns.cost:
            return <TableCell className="unit-stat" key={ column }>{ unit[column].toLocaleString() }</TableCell>;
        // case Columns.hp:
        //     return (
        //         <TableCell className="unit-stat" key={ Columns.hp }>
        //             <Tooltip title={ (unit.hp / unit.cost).toFixed(2) + " hp per gold" }>
        //                 <div>{ unit.hp.toLocaleString() }</div>
        //             </Tooltip>
        //         </TableCell>
        //     );
        case Columns.mainWeapon:
        case Columns.offWeapon:
            return (
                <TableCell className="unit-stat" key={ column }
                           onMouseEnter={ weapon(unit[column]) }
                           onMouseLeave={ weapon(undefined) }
                >
                    <div className="unit-weapon">
                        <span>{ unit[column]?.toLocaleString() }</span>
                        { dps(unit[column]) }
                    </div>
                </TableCell>
            );
        default:
            return <TableCell className="unit-stat" key={ column }>{ stat(column) }</TableCell>;
    }
}

function getSortLabel(key: SortOption) {
    switch (key) {
        case "dps":
            return "DPS";
        default:
            return Headers[key as Columns] || (key[0].toUpperCase() + key.substring(1));
    }
}

export function UnitList() {
    let columns = [
        Columns.name,
        Columns.faction,
        Columns.cost,
        Columns.hp,
        Columns.mainWeapon,
        Columns.offWeapon,
        // Columns.rating,
        Columns.comments,
    ];

    const data = useDataContext();
    const [ sortOrder, setSortOrder ] = useState<SortOption[]>([ "faction", "cost" ]);
    const popin = usePopin<Weapon>();

    // if (sortOrder[0] === Columns.faction) {
    //     columns = columns.filter(value => value !== Columns.faction);
    // }

    const headers = useMemo(() => columns
            .map(value => Headers[value])
            .map(value => <TableCell key={ value }>{ value }</TableCell>),
        [ columns ],
    );

    const sortOptions: SortOption[] = [
        Columns.name,
        Columns.faction,
        Columns.cost,
        Columns.hp,
        "dps",
        "range"
    ]

    const units = data.units.all
        .sort(createComparer(data, sortOrder))
        .map((unit, index, units): [ Unit, boolean ] => [ unit, unit.faction !== units[index - 1]?.faction ])
        .map(([ unit, isNewFaction ]) => (
            <Fragment>
                { isNewFaction && sortOrder[0] === Columns.faction && (
                    <TableRow>
                        <TableCell className="faction-section" colSpan={ columns.length }>{ unit.faction }</TableCell>
                    </TableRow>
                ) }
                <TableRow>
                    { columns.map(column => renderColumn(unit, column, data, popin)) }
                </TableRow>
            </Fragment>
        ));

    return (
        <Fragment>
            { popin.render(data => <WeaponView weapon={ data }/>) }
            <div className="unit-list">
                <Paper className="section-title">
                    <h2>Units</h2>
                </Paper>
                <SortEditor options={ sortOptions }
                            order={ sortOrder }
                            onChange={ setSortOrder } label={ getSortLabel }/>
                <TableContainer component={ Paper }>
                    <Table>
                        <TableHead>
                            <TableRow>{ headers }</TableRow>
                        </TableHead>
                        <TableBody>
                            { units }
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </Fragment>
    );
}
