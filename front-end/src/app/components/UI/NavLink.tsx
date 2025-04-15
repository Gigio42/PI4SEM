"use client";

import Link from 'next/link';
import { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export default function NavLink({ href, children, className, active }: NavLinkProps) {
  return (
    <Link href={href}>
      <span className={className}>
        {children}
      </span>
    </Link>
  );
}
