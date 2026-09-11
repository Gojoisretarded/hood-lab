// The project's official channels. One list, used in the header and the footer.
export const SOCIALS = [
  {
    id: "x",
    label: "X",
    handle: "@rhoodlab",
    href: "https://x.com/rhoodlab",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    handle: "t.me/rhoodlab",
    href: "https://t.me/rhoodlab",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
        />
      </svg>
    ),
  },
] as const;

/** Round icon buttons, for the header. */
export function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <ul className={`socials ${className}`} aria-label="Follow Hood Lab">
      {SOCIALS.map((s) => (
        <li key={s.id}>
          <a className="socials__icon" href={s.href} target="_blank" rel="noopener noreferrer" title={`${s.label}: ${s.handle}`}>
            {s.icon}
            <span className="sr-only">
              Hood Lab on {s.label} (opens in a new tab)
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Labelled buttons, for the footer. */
export function SocialLinks() {
  return (
    <ul className="socials socials--labelled" aria-label="Follow Hood Lab">
      {SOCIALS.map((s) => (
        <li key={s.id}>
          <a className="btn btn--quiet socials__link" href={s.href} target="_blank" rel="noopener noreferrer">
            {s.icon}
            {s.label === "X" ? "Follow on X" : "Join the Telegram"}
            <span className="socials__handle">{s.handle}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
