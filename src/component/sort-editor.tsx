import "./sort-editor.scss";

import React, { Fragment, useState } from "react";
import { Button, Divider, Menu, MenuItem, Stack } from "@mui/material";

interface Props<T> {
    options: T[];
    order: T[];

    onChange(order: T[]): any;

    label?: (key: T) => string;
}

interface ClosedMenuState {
    open: false;
    anchor?: HTMLElement;
    index?: number;
}

interface OpenMenuState {
    open: true;
    anchor: HTMLElement;
    index: number;
}

type MenuState = ClosedMenuState | OpenMenuState;

export function SortEditor<T extends string>(props: Props<T>) {

    const [ state, setState ] = useState<MenuState>({ open: false });

    function edit(event: React.MouseEvent, index: number) {
        setState({
            open: true,
            anchor: event.target as HTMLElement,
            index,
        });
    }

    function close() {
        setState({ ...state, open: false });
    }

    function select(key: T) {
        if (state.open) {
            const newOrder = [ ...props.order ];

            if (state.index < newOrder.length) {
                newOrder[state.index] = key;
            } else {
                newOrder.push(key);
            }

            props.onChange(newOrder);
            close();
        }
    }

    function remove() {
        const index = state.index;
        const order = props.order;
        if (typeof index !== "number") return;
        close();
        const newOrder = [ ...order ];
        newOrder.splice(index, 1);
        props.onChange(newOrder);
    }

    const buttons = props.order
        .map((key, i) => (
            <Button onClick={ event => edit(event, i) } key={ `${ key }-${ i }` }>
                { props.label ? props.label(key) : key }
            </Button>
        ));

    const items = props.options
        .map(item => (
            <MenuItem key={ item } onClick={ () => select(item) }
                      disabled={ props.order.includes(item) }>
                { props.label ? props.label(item) : item }
            </MenuItem>
        ));

    if (typeof state.index === "number" && state.index < props.order.length) {
        items.unshift(
            <MenuItem key="remove" onClick={ remove }>
                Remove
            </MenuItem>,
            <Divider dir="horizontal"/>,
        );
    }

    return (
        <Fragment>
            <Menu open={ state.open } anchorEl={ state.anchor } onClose={ close }>
                { items }
            </Menu>
            <Stack className="sort-editor"
                   divider={ <div className="stack-divider">{ ">" }</div> }
                   spacing={ 2 } direction="row">
                { buttons }
                <Button onClick={ event => edit(event, props.order.length) }>+</Button>
            </Stack>
        </Fragment>
    );
}
