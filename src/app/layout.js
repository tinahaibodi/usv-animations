import "./globals.css";

export const metadata = {
  title: "USV Animations",
  description: "Animation playground for exportable article visuals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
