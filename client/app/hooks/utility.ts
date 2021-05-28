import React, { useState, useRef } from 'react';

type RefInput = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  ref: React.MutableRefObject<HTMLInputElement>;
  onKeyDown: React.KeyboardEventHandler;
  onFocus: React.FocusEventHandler;
  domProps: Omit<RefInput, 'setValue' | 'domProps'>; 
};

// Needs a separate type because of text area ref being LegacyRef
type RefTextArea = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  ref: React.LegacyRef<HTMLTextAreaElement>;
  onKeyDown: React.KeyboardEventHandler;
  onFocus: React.FocusEventHandler;
  domProps: Omit<RefTextArea, 'setValue' | 'domProps'>; 
};

export function useRefTextArea(enterHandler?: () => void, escapeHandler?: () => void): RefTextArea {
  return useRefFormInputBase(enterHandler, escapeHandler) as RefTextArea;
}

export function useRefInput(enterHandler?: () => void, escapeHandler?: () => void): RefInput {
  return useRefFormInputBase(enterHandler, escapeHandler) as RefInput;
}

function useRefFormInputBase(enterHandler?: () => void, escapeHandler?: () => void): RefInput | RefTextArea {
  const [value, setValue] = useState('');
  
  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    console.log(event.target.value);
    setValue(event.target.value);
  }

  const [preEditValue, setPreEditValue] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key == 'Enter') {
      enterHandler && enterHandler();

      if (ref && ref.current) {
        ref.current.blur();
      }
    } else if (event.key == 'Escape') {
      escapeHandler && escapeHandler();

      if (ref && ref.current) {
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