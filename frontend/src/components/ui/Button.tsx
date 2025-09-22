import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'white';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantMap: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'text-gray-700 hover:text-gray-900 focus-ring',
  white: 'bg-white text-gray-900 hover:bg-gray-100 rounded-lg px-5 py-3 focus-ring',
};

export default function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const classes = `${variantMap[variant]} ${className}`.trim();
  return <button className={classes} {...rest} />;
}

