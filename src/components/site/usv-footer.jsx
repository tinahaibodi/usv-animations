import Link from "next/link";
import Image from "next/image";

export default function UsvFooter() {
  return (
    <footer className="usv-footer">
      <div className="usv-footer-rule" />
      <div className="usv-footer-grid">
        <section>
          <h3>Union Square Ventures</h3>
          <p>817 Broadway, 14th Floor</p>
          <p>New York, NY 10003</p>
          <div className="usv-social-row" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="usv-icon-twitter">
              <path d="M18.9 2.25h3.37l-7.37 8.43 8.67 11.07h-6.79l-5.31-6.68-5.84 6.68H2.25l7.88-9.01L1.8 2.25h6.97l4.8 6.1 5.33-6.1zm-1.19 17.47h1.87L7.76 4.2H5.74l11.97 15.52z" />
            </svg>
            <svg viewBox="0 0 24 24" className="usv-icon-linkedin">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6A2.5 2.5 0 1 1 4.98 3.5zM.28 8.25h4.41v14.24H.28V8.25zM8.06 8.25h4.23v1.94h.06c.59-1.11 2.03-2.28 4.18-2.28 4.47 0 5.29 2.94 5.29 6.77v7.81h-4.4v-6.93c0-1.65-.03-3.77-2.3-3.77-2.31 0-2.67 1.8-2.67 3.66v7.04h-4.39V8.25z" />
            </svg>
          </div>
        </section>

        <section>
          <h3>Company</h3>
          <ul>
            <li>
              <Link href="#">About</Link>
            </li>
            <li>
              <Link href="#">People</Link>
            </li>
            <li>
              <Link href="#">Investments</Link>
            </li>
            <li>
              <Link href="#">Jobs</Link>
            </li>
            <li>
              <Link href="/writing">Writing</Link>
            </li>
          </ul>
        </section>

        <section>
          <h3>Contact Us</h3>
          <p>
            If you would like to share your ideas, business, or feedback with us, please email us.
            All business plan submissions must include a clear description of your operations and
            current progress.
          </p>
          <p>
            Email: <a href="mailto:info@usv.com">info@usv.com</a>
          </p>
          <p>Call: (212) 994-7880</p>
          <p>Fax: (212) 994-7399</p>
        </section>
      </div>
      <div className="usv-footer-rule" />
      <div className="usv-footer-bottom">
        <Image src="/assets/usv-logo.png" alt="USV logo" width={64} height={64} className="usv-logo" />
        <span>Policy Against Harassment</span>
      </div>
    </footer>
  );
}
