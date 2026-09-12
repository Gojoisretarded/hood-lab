import Image from "next/image";
import logo from "@/assets/brand/logo.png";

/**
 * The Hood Lab badge. It always sits beside the name, so it is decorative (empty alt)
 * unless a label is passed for a place where it stands alone.
 */
export function Logo({
  size = 32,
  label,
  eager = false,
  className = "",
}: {
  size?: number;
  label?: string;
  /** Load immediately (for the header, which is always on screen). */
  eager?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={logo}
      alt={label ?? ""}
      width={size}
      height={size}
      loading={eager ? "eager" : "lazy"}
      className={`logo ${className}`}
    />
  );
}
