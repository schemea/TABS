import React, { CSSProperties, Fragment, useRef, useState } from "react";
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
    const items = useRef<State<T>[]>([]);
    const startTimer = useTimer();
    const [ , update ] = useState({});

    function closed() {
        return items.current.map(item => ({ ...item, open: false }));
    }

    function remove(id: string) {
        items.current = items.current.filter(item => item.id !== id);
        update({});
    }

    function getStyle(open: boolean): CSSProperties {
        if (open) {
            return { zIndex: 1000 };
        }

        return {
            zIndex: 900,
            pointerEvents: "none",
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
            return <Fragment>{ items.current.map(item => renderItem(item, cb)) }</Fragment>;
        },
        show(data: T, anchor?: Anchor) {
            if (data === items.current[items.current.length - 1]?.data) return;

            startTimer(
                () => {
                    items.current = [
                        ...closed(),
                        { open: true, data, anchor, id: id() },
                    ];
                    update({});
                }, 20,
            );

        },
        hide() {
            startTimer(() => {
                items.current = closed();
                update({});
            }, 20);
        },
    };
}
