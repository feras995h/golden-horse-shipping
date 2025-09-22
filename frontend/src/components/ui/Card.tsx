import React from 'react';

type Props = React.PropsWithChildren<{
  className?: string;
  hover?: boolean;
}>;

export default function Card({ children, className = '', hover = true }: Props) {
  return (
    <div className={`card ${hover ? 'hover-lift' : ''} ${className}`.trim()}>{children}</div>
  );
}

