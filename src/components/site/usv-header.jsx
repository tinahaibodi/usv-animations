import Link from "next/link";
import Image from "next/image";

const navItems = [
  { label: "About", href: "#" },
  { label: "People", href: "#" },
  { label: "Investments", href: "#" },
  { label: "Jobs", href: "#" },
  { label: "Writing", href: "/writing", active: true },
];

export default function UsvHeader() {
  return (
    <header className="usv-header">
      <Link href="/writing" className="usv-logo-link" aria-label="Union Square Ventures home">
        <Image src="/assets/usv-logo.png" alt="USV logo" width={64} height={64} className="usv-logo" />
      </Link>
      <nav aria-label="Primary">
        <ul className="usv-nav">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={item.active ? "active" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="usv-header-icons" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="usv-icon-twitter">
          <path d="M18.9 2.25h3.37l-7.37 8.43 8.67 11.07h-6.79l-5.31-6.68-5.84 6.68H2.25l7.88-9.01L1.8 2.25h6.97l4.8 6.1 5.33-6.1zm-1.19 17.47h1.87L7.76 4.2H5.74l11.97 15.52z" />
        </svg>
        <svg viewBox="0 0 32 32" className="usv-icon-search">
          <circle cx="14" cy="14" r="8.5" fill="none" strokeWidth="2.3" />
          <path d="M20 20l7 7" fill="none" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      </div>
    </header>
  );
}
