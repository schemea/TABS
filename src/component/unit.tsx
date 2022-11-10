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

type SortOption = Columns.faction | Columns.name | Stat

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

    switch (key) {
        case "faction":
            return [ a, b ]
                .map(unit => unit.faction.toUpperCase())
                .map(faction => factionOrder.indexOf(faction))
                .reduce((a, b) => a - b);
        case Stat.hp:
        case Stat.dps:
        case Stat.range:
            return [ a, b ]
                .map(unit => getMergedUnitStat(data, key, unit))
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

enum Stat {
    cost  = "cost",
    hp    = "hp",
    dps   = "dps",
    range = "range"
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

function get<T, K extends keyof T>(target: T, key: K): T[K];
function get<T>(target: any, key: string): T;
function get(target: any, key: string) {
    return target[key];
}

function getSuffix(key: keyof Unit) {
    switch (key) {
        case Columns.hp:
            return " hp";
        default:
            return "";
    }
}

function getMergedWeaponStat(data: DataContext, key: Stat, name: string, merger = (a: number, b: number) => a + b) {
    const weapon = data.weapons.findBy("name", name)[0];
    if (!weapon) return 0;

    let value = get<number>(weapon, key) || 0;

    if (key === Stat.range) return value;

    value += data.weaponComponents.findBy("source", name)
        .map(value => get<number>(value, key) || 0)
        .reduce(merger, 0);

    switch (key) {
        case Stat.dps:
            value += data.effects.findBy("source", name)
                .map(effect => effect.dps * effect.duration / weapon.cooldown)
                .reduce(merger, 0);
            break;
        default:
            value += data.effects.findBy("source", name)
                .map(value => get<number>(value, key) || 0)
                .reduce(merger, 0);
            break;
    }

    return value;
}

function getMergedUnitStat(data: DataContext, key: Stat, unit: Unit) {

    function subunit(): number {
        return data.subunits.findBy("source", unit.name)
            .map(value => get<number>(value, key) || 0)
            .reduce((a, b) => a + b, 0);
    }

    function weapon(name: string, merger = (a: number, b: number) => a + b): number {
        return getMergedWeaponStat(data, key, name, merger);
    }


    switch (key) {
        case Stat.hp:
            return unit[key] + subunit();
        case Stat.dps:
            return weapon(unit.mainWeapon) + weapon(unit.offWeapon);
        case Stat.range:
            return Math.max(weapon(unit.mainWeapon, Math.max), weapon(unit.offWeapon, Math.max));
        default:
            return unit[key];
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
        const style: React.CSSProperties = { minWidth: "70px" };

        const value = getMergedWeaponStat(data, Stat.dps, name);

        if (value) {
            const color = value > 0 ? "primary" : "secondary";
            return (
                <ThemeProvider theme={ chipTheme }>
                    <Chip color={ color } size="small" style={ style }
                          label={ value.toFixed(0) + " hp/s" }/>
                </ThemeProvider>
            );
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
    const [ sortOrder, setSortOrder ] = useState<SortOption[]>([ Columns.faction, Stat.cost ]);
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
        Stat.cost,
        Stat.hp,
        Stat.dps,
        Stat.range,
    ];

    const units = data.units.all
        .sort(createComparer(data, sortOrder))
        .map((unit, index, units): [ Unit, Unit | undefined ] => [ unit, units[index - 1] ])
        .map(([ unit, previous ]) => (
            <Fragment>
                { getDivider(previous, unit) }
                <TableRow>
                    { columns.map(column => renderColumn(unit, column, data, popin)) }
                </TableRow>
            </Fragment>
        ));

    function getDivider(previous: Unit | undefined, current: Unit) {
        function round(value: number) {
            return Math.round(value / 10) * 10;
        }

        switch (sortOrder[0]) {
            case Columns.faction:
                if (previous && previous.faction === current.faction) return null;
                return (
                    <TableRow>
                        <TableCell className="faction-section" colSpan={ columns.length }>
                            { current.faction }
                        </TableCell>
                    </TableRow>
                );
            case Stat.range: {
                let divider = 0;

                if (previous) {
                    const [ p, c ] = [ previous, current ]
                        .map(unit => getMergedUnitStat(data, Stat.range, unit))
                        .map(round);

                    if (p === c) return null;
                    else divider = c;
                }

                return (
                    <TableRow>
                        <TableCell className="faction-section" colSpan={ columns.length }>{ divider } WM</TableCell>
                    </TableRow>
                );
            }
            default:
                return null;
        }
    }

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
