import React, { useState, useRef, useLayoutEffect } from 'react';

type RefInputDomProps<T> = {
  value: string;
  onChange: React.ChangeEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler;
  onFocus: React.FocusEventHandler;
  onBlur: React.FocusEventHandler;
  ref: React.MutableRefObject<T | null>;
}

type RefInput<T> = {
  value: string,
  setValue: React.Dispatch<React.SetStateAction<string>>;
  preEditValue: string;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  domProps: RefInputDomProps<T>; 
};

export function useRefTextArea(enterHandler?: () => void, escapeHandler?: () => void, allowsNewLine = false): RefInput<HTMLTextAreaElement> {
  return useRefFormInputBase<HTMLTextAreaElement>(enterHandler, escapeHandler, allowsNewLine);
}

export function useRefInput(enterHandler?: () => void, escapeHandler?: () => void): RefInput<HTMLInputElement> {
  return useRefFormInputBase<HTMLInputElement>(enterHandler, escapeHandler);
}

function useRefFormInputBase<T extends HTMLInputElement | HTMLTextAreaElement>(
  enterHandler?: () => void, 
  escapeHandler?: () => void,
  allowsNewLine = false): RefInput<T> {

  const [value, setValue] = useState('');
  const [preEditValue, setPreEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<T>(null);
  let didConsumeEnterHandler = false;

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key == 'Enter' && !allowsNewLine) {
      enterHandler?.();
      didConsumeEnterHandler = true;

      if (ref && ref.current) {
        ref.current.blur();
      }
    } else if (event.key == 'Escape') {
      escapeHandler?.();
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
    adjustTextArea();
  }

  function onBlur() {
    !didConsumeEnterHandler && enterHandler?.();
  }

  function adjustTextArea() {
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
  }

  useLayoutEffect(() => {
    adjustTextArea();
  }, [value]);

  const domProps: RefInputDomProps<T> = {
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    ref
  };

  return {
    value,
    setValue,
    preEditValue,
    isEditing,
    setIsEditing,
    domProps
  };
}