import React from 'react';

type IconProps = {
  name: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
};

// function Icon({ name, className, onClick }: IconProps): JSX.Element {
  
// }

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(({ name, className, onClick }: IconProps, ref) => {
  return <span className={"icon " + className} onClick={onClick} ref={ref}><i className={name}></i></span>
});

Icon.displayName = 'Icon';
export { Icon };