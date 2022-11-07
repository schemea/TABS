import { useRef } from "react";

export function useTimer() {
    const id = useRef<NodeJS.Timer>();
    return function (callback: () => any, ms: number) {
        if (id.current) clearTimeout(id.current);
        id.current = setTimeout(function () {
            id.current = undefined;
            callback();
        }, ms);
    };
}
