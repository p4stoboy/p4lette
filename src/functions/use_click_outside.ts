// https://codesandbox.io/s/opmco?file=/src/useClickOutside.js:0-1191

import {RefObject, useEffect} from "react";

// Improved version of https://usehooks.com/useOnClickOutside/
export const useClickOutside = <T extends HTMLElement>(
    ref: RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void
) => {
    useEffect(() => {
        let startedInside = false;
        let startedWhenMounted = false;

        const listener = (event: MouseEvent | TouchEvent) => {
            // Do nothing if `mousedown` or `touchstart` started inside ref element
            if (startedInside || !startedWhenMounted) return;
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || !event.target || ref.current.contains(event.target as Node)) return;

            handler(event);
        };

        const validateEventStart = (event: MouseEvent | TouchEvent) => {
            startedWhenMounted = !!ref.current;
            startedInside = !!ref.current && !!event.target && ref.current.contains(event.target as Node);
        };

        document.addEventListener("mousedown", validateEventStart);
        document.addEventListener("touchstart", validateEventStart);
        document.addEventListener("click", listener);

        return () => {
            document.removeEventListener("mousedown", validateEventStart);
            document.removeEventListener("touchstart", validateEventStart);
            document.removeEventListener("click", listener);
        };
    }, [ref, handler]);
};
