import React, { useState, useRef, useLayoutEffect } from 'react';

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
  ref: React.MutableRefObject<HTMLTextAreaElement>;
  onKeyDown: React.KeyboardEventHandler;
  onFocus: React.FocusEventHandler;
  onBlur: React.FocusEventHandler;
  domProps: Omit<RefTextArea, 'setValue' | 'domProps'>; 
};

export function useRefTextArea(enterHandler?: () => void, escapeHandler?: () => void): RefTextArea {
  return useRefFormInputBase(enterHandler, escapeHandler) as RefTextArea;
}

export function useRefInput(enterHandler?: () => void, escapeHandler?: () => void): RefInput {
  return useRefFormInputBase(enterHandler, escapeHandler) as RefInput;
}

function useRefFormInputBase(enterHandler?: () => void, escapeHandler?: () => void): RefInput | RefTextArea {
  const [value, setValue] = useState('erere');
  const [preEditValue, setPreEditValue] = useState('');
  let didConsumeEnterHandler = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

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

  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

  useLayoutEffect(() => {
    const textArea = ref.current as HTMLTextAreaElement;
    textArea.style.height = 'inherit';
    textArea.style.height = `${textArea.scrollHeight}px`;
  }, [ref, value]);

  const refInput = {
    value,
    setValue,
    onChange,
    ref,
    onKeyDown,
    onFocus,
    onBlur
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setValue: _, ...domProps } = refInput;
  return { ...refInput, domProps };
}