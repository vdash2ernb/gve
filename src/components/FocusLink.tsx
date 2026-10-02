"use client";

import Link from "next/link";
import { setFocus } from "./three/sceneStore";

/** A link that lights up its matching line in the 3D drawing while hovered or focused. */
export default function FocusLink({
  focus,
  href,
  className,
  children,
}: {
  focus: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={() => setFocus(focus)}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus(focus)}
      onBlur={() => setFocus(null)}
    >
      {children}
    </Link>
  );
}
