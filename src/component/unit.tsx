import "./unit.scss";
import React, { Dispatch, Fragment, useEffect, useMemo, useReducer, useState } from "react";
import { Unit } from "../resource/unit";
import { DataContext, useDataContext } from "../context/data";
import { Weapon } from "../resource/weapon";
import { WeaponView } from "./weapon";
import { usePreviousFallback } from "../hook/fallback";
import { useTimer } from "../hook/timer";
import naturalCompare from "string-natural-compare";
import {
    Chip,
    createTheme,
    Paper,
    Popover,
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


interface State {
    columns: Columns[];
    weapon?: Weapon;
    anchor?: HTMLElement;
}

enum ActionType {
    columns,
    weapon
}

interface ColumnsAction {
    type: ActionType.columns;
    columns: Columns[];
}

interface WeaponAction {
    type: ActionType.weapon;
    weapon: Weapon | undefined;
    anchor: HTMLElement | undefined;
}

type Action = ColumnsAction | WeaponAction

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

function renderColumn(unit: Unit, column: Columns, data: DataContext, state: State, dispatch: Dispatch<Action>) {
    function weapon(name?: string) {
        return function (event: React.MouseEvent<HTMLElement>) {
            const weapon = name ? data.weapons.findBy("name", name)[0] : undefined;
            if (state.weapon !== weapon) {
                dispatch({
                    type: ActionType.weapon,
                    weapon,
                    anchor: event.target as HTMLElement,
                });
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

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ActionType.weapon:
            return {
                ...state,
                weapon: action.weapon,
                anchor: action.anchor,
            };
        case ActionType.columns:
            return {
                ...state,
                columns: action.columns,
            };

        default:
            return state;
    }
}

export function UnitList() {
    const data = useDataContext();

    const [ state, dispatch ] = useReducer(reducer, {
        columns: [
            Columns.name,
            Columns.faction,
            Columns.cost,
            Columns.hp,
            Columns.mainWeapon,
            Columns.offWeapon,
            Columns.rating,
            Columns.comments,
        ],
    });

    const [ sortOrder, setSortOrder ] = useState<(keyof Unit)[]>([ "faction", "cost" ]);

    const headers = useMemo(() => state.columns
            .map(value => Headers[value])
            .map(value => <TableCell key={ value }>{ value }</TableCell>),
        [ state.columns ],
    );

    const units = data.units.all
        .sort(createComparer(sortOrder))
        .map(unit => (
            <TableRow>
                { state.columns.map(column => renderColumn(unit, column, data, state, dispatch)) }
            </TableRow>
        ));

    return (
        <Fragment>
            <WeaponPopover weapon={ state.weapon } anchor={ state.anchor }/>
            <div className="unit-list">
                <Paper className="section-title">
                    <h2>Units</h2>
                </Paper>
                <SortEditor options={ state.columns } order={ sortOrder } onChange={ setSortOrder }
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


function WeaponPopover(props: { weapon?: Weapon, anchor?: HTMLElement }) {
    const popover = usePreviousFallback(
        { weapon: props.weapon, anchor: props.anchor },
        popup => !!popup.weapon,
        {},
    );

    const content = popover.weapon ? <WeaponView weapon={ popover.weapon }/> : null;
    const [ open, setOpen ] = useState(false);
    const startTimer = useTimer();

    useEffect(function () {
        startTimer(() => setOpen(!!props.weapon), 150);
    }, [ !!props.weapon ]);

    return (
        <Popover className="weapon-popover"
                 anchorEl={ popover.anchor } open={ open }
                 anchorOrigin={ {
                     vertical: "center",
                     horizontal: "right",
                 } }
                 transformOrigin={ {
                     vertical: "center",
                     horizontal: "left",
                 } }
                 disableRestoreFocus>
            { content }
        </Popover>
    );
}
