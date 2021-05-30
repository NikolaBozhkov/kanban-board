import { MutableRefObject, useEffect } from "react";

export function useOutsideClickHandler(handler: () => void, ref: MutableRefObject<HTMLElement | null>): void {
  useEffect(() => {
    function handleClick(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('mousedown', handleClick); }
  }, [ref, handler]);
}