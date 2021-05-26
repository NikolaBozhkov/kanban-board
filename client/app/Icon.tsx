import React from 'react';

type IconProps = {
  name: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
};

export function Icon({ name, className, onClick }: IconProps): JSX.Element {
  return <span className={"icon " + className} onClick={onClick}><i className={name}></i></span>
}