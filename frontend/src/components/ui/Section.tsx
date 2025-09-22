import React from 'react';

type SectionBg = 'white' | 'gray' | 'brand' | 'gradientGold';

type Props = React.PropsWithChildren<{
  className?: string;
  tight?: boolean;
  bg?: SectionBg;
  id?: string;
}>;

function bgClass(bg?: SectionBg): string {
  switch (bg) {
    case 'white': return 'bg-white';
    case 'gray': return 'bg-gray-50';
    case 'brand': return 'hero-gradient text-white';
    case 'gradientGold': return 'bg-gradient-to-r from-gold-500 to-gold-600 text-white';
    default: return '';
  }
}

export default function Section({ children, className = '', tight = false, bg, id }: Props) {
  const base = tight ? 'section-tight' : 'section';
  return (
    <section id={id} className={`${base} ${bgClass(bg)} ${className}`.trim()}>
      {children}
    </section>
  );
}

