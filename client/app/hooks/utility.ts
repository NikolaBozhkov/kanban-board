import React, { useState, useRef } from 'react';

type RefInput = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  ref: React.MutableRefObject<HTMLInputElement | null>;
  onKeyDown: React.KeyboardEventHandler;
  onFocus: React.FocusEventHandler;
  domProps: Omit<RefInput, 'setValue' | 'domProps'>; 
};

export function useRefInput(enterHandler?: () => void, escapeHandler?: () => void): RefInput {
  const [value, setValue] = useState('');
  
  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    console.log(event.target.value);
    setValue(event.target.value);
  }

  const [preEditValue, setPreEditValue] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key == 'Enter') {
      enterHandler && enterHandler();

      if (ref.current) {
        ref.current.blur();
      }
    } else if (event.key == 'Escape') {
      escapeHandler && escapeHandler();

      if (ref.current) {
        setValue(preEditValue);
        ref.current.blur();
      }
    }
  }

  function onFocus() {
    setPreEditValue(value);
  }

  const refInput = {
    value,
    setValue,
    onChange,
    ref,
    onKeyDown,
    onFocus
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setValue: _, ...domProps } = refInput;
  return { ...refInput, domProps };
}