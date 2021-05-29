import React, { useState, useRef, useLayoutEffect } from 'react';

type RefInput<T> = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  undoEdit: () => void;
  onChange: React.ChangeEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler;
  onFocus: React.FocusEventHandler;
  ref: React.MutableRefObject<T | null>;
  domProps: Omit<RefInput<T>, 'setValue' | 'undoEdit' | 'domProps'>; 
};

export function useRefTextArea(enterHandler?: () => void, escapeHandler?: () => void): RefInput<HTMLTextAreaElement> {
  return useRefFormInputBase<HTMLTextAreaElement>(enterHandler, escapeHandler);
}

export function useRefInput(enterHandler?: () => void, escapeHandler?: () => void): RefInput<HTMLInputElement> {
  return useRefFormInputBase<HTMLInputElement>(enterHandler, escapeHandler);
}

function useRefFormInputBase<T extends HTMLInputElement | HTMLTextAreaElement>(enterHandler?: () => void, escapeHandler?: () => void): RefInput<T> {
  const [value, setValue] = useState('');
  const [preEditValue, setPreEditValue] = useState('');
  let didConsumeEnterHandler = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<T>(null);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key == 'Enter') {
      enterHandler && enterHandler();
      didConsumeEnterHandler = true;

      if (ref && ref.current) {
        ref.current.blur();
      }
    } else if (event.key == 'Escape') {
      escapeHandler && escapeHandler();
      didConsumeEnterHandler = true;

      if (ref && ref.current) {
        setValue(preEditValue);
        ref.current.blur();
      }
    }
  }

  function onChange(event: React.ChangeEvent<T>) {
    setValue(event.target.value);
  }

  function onFocus() {
    setPreEditValue(value);
    didConsumeEnterHandler = false;
  }

  function onBlur() {
    // Interesting syntax, not sure how I feel about it yet
    !didConsumeEnterHandler && enterHandler && enterHandler();
  }

  function undoEdit() {
    setValue(preEditValue);
  }

  useLayoutEffect(() => {
    // Only resize textarea
    if ((ref.current as HTMLElement)?.nodeName.toLowerCase() == 'textarea') {
      const textArea = ref.current as unknown as HTMLTextAreaElement;

      // Get the computed font size and use as base height
      const computed = getComputedStyle(textArea);
      const fontSize = Number(computed.fontSize.slice(0, computed.fontSize.length - 2));

      textArea.style.height = 'inherit';
      textArea.style.height = `${fontSize}px`;

      // if the textarea becomes multiline use the scrollHeight
      if (textArea.scrollHeight > textArea.clientHeight) {
        textArea.style.height = `${textArea.scrollHeight}px`;
      }
    }
  }, [ref, value]);

  const refInput = {
    value,
    setValue,
    onChange,
    undoEdit,
    ref,
    onKeyDown,
    onFocus,
    onBlur
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setValue: _, undoEdit: __, ...domProps } = refInput;
  return { ...refInput, domProps };
}