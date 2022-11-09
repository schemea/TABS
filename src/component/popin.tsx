import React, { CSSProperties, Fragment, useState } from "react";
import { Grow, Paper, styled } from "@mui/material";
import { useTimer } from "../hook/timer";
import { getUntransformedBounds } from "../witchcraft/revert-transform";

type Anchor = MouseEvent | React.MouseEvent;

interface State<T> {
    id: string;
    open: boolean;
    data: T;
    anchor?: Anchor;
}

export interface Popin<T> {
    show(data: T, event?: Anchor): void;

    hide(): void;
}

function id() {
    return (++id.index).toString();
}

id.index = 0;

const Root = styled("div")({
    position: "fixed",
    transform: "translateY(-50%)",
});

function updatePosition(state: State<any>) {
    if (!state.open) return () => {};

    return function (element: HTMLElement | null) {
        const { anchor } = state;
        if (!anchor || !element) return;

        let x = 0, y = 0;
        // if ("clientX" in anchor) {
        //     console.log(anchor);
        //     return {
        //         left: anchor.clientX,
        //         top: anchor.clientY,
        //     };
        // }

        if (anchor.target instanceof HTMLElement) {
            const { right, top, bottom } = anchor.target.getBoundingClientRect();
            const { height } = getUntransformedBounds(element);
            x = right;
            y = (top + bottom) / 2;
            console.log(innerHeight, height);
            y = Math.min(y, innerHeight - height / 2);
        }

        element.style.left = x + "px";
        element.style.top = y + "px";
    };
}

export function usePopin<T>() {
    const [ state, setState ] = useState<State<T>[]>([]);
    const startTimer = useTimer();

    function closed() {
        return state.map(item => ({ ...item, open: false }));

    }

    function remove(id: string) {
        return setState(state.filter(item => item.id !== id));
    }

    function getStyle(open: boolean): CSSProperties {
        if (open) {
            return { zIndex: 1000 };
        }

        return {
            zIndex: 900,
            pointerEvents: "none"
        };
    }

    function renderItem(item: State<T>, cb: (data: T) => React.ReactElement) {
        return (
            <Root ref={ updatePosition(item) } key={ item.id } style={ getStyle(item.open) }>
                <Grow in={ item.open } appear={ true } unmountOnExit
                      onExited={ () => remove(item.id) }>
                    <Paper>
                        { cb(item.data) }
                    </Paper>
                </Grow>
            </Root>
        );
    }


    return {
        render(cb: (data: T) => React.ReactElement) {
            return <Fragment>{ state.map(item => renderItem(item, cb)) }</Fragment>;
        },
        show(data: T, anchor?: Anchor) {
            if (data === state[state.length - 1]?.data) return;

            startTimer(
                () => setState([
                    ...closed(),
                    { open: true, data, anchor, id: id() },
                ]), 20,
            );

        },
        hide() {
            startTimer(() => setState(closed()), 20);
        },
    };
}
