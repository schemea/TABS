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
    Tooltip,
} from "@mui/material";
import { SortEditor } from "./sort-editor";
import { Popin, usePopin } from "./popin";

function compare<K extends keyof Unit>(key: K, a: Unit, b: Unit): number {
    switch (key) {
        default:
            if (a[key] === undefined || a[key] === null) return -1;
            if (b[key] === undefined || b[key] === null) return 1;
            return naturalCompare(a[key].toString(), b[key].toString());
    }
}

function createComparer(order: (keyof Unit)[]) {
    return function (...units: [ Unit, Unit ]): number {
        for (const key of order) {
            const result = compare(key, ...units);
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

    switch (column) {
        case Columns.cost:
            return <TableCell className="unit-stat" key={ column }>{ unit[column].toLocaleString() }</TableCell>;
        case Columns.hp:
            return (
                <TableCell className="unit-stat" key={ Columns.hp }>
                    <Tooltip title={ (unit.hp / unit.cost).toFixed(2) + " hp per gold" }>
                        <div>{ unit.hp.toLocaleString() }</div>
                    </Tooltip>
                </TableCell>
            );
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
            return <TableCell className="unit-stat" key={ column }>{ unit[column] || "" }</TableCell>;
    }
}

export function UnitList() {
    const data = useDataContext();
    const [ sortOrder, setSortOrder ] = useState<(keyof Unit)[]>([ "faction", "cost" ]);
    const popin = usePopin<Weapon>();

    const [ columns, setColumns ] = useState([
        Columns.name,
        Columns.faction,
        Columns.cost,
        Columns.hp,
        Columns.mainWeapon,
        Columns.offWeapon,
        Columns.rating,
        Columns.comments,
    ]);

    const headers = useMemo(() => columns
            .map(value => Headers[value])
            .map(value => <TableCell key={ value }>{ value }</TableCell>),
        [ columns ],
    );

    const units = data.units.all
        .sort(createComparer(sortOrder))
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
                <SortEditor options={ columns } order={ sortOrder } onChange={ setSortOrder }
                            label={ key => Headers[key] }/>
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
