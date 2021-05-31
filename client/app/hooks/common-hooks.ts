import { MutableRefObject, useEffect, useRef, useState } from "react";

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

export function useHiddenContainer<ContainerType extends HTMLElement, ButtonType extends HTMLElement>() {
  const containerRef = useRef<ContainerType>(null);
  const btnRef = useRef<ButtonType>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClick(event: Event) {
      if (btnRef.current?.contains(event.target as Node)) {
        setIsOpen(!isOpen);
      } else if (!containerRef.current?.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('mousedown', handleClick); }
  }, [btnRef, containerRef, isOpen]);

  return { isOpen, setIsOpen, containerRef, btnRef };
}