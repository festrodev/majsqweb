import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "maj$q",
  description:
    "L'agent qui planifie ta soirée, depuis ta conversation de groupe. Montréal.",
};

export const viewport: Viewport = {
  // allow-hex: the browser paints its chrome from this before any stylesheet
  // has loaded, so it cannot be a CSS variable. Keep in step with
  // --majsq-night in globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        {/* Google Fonts is the one font host allowed. Both faces are declared
            in globals.css with real fallback stacks, so a blocked request
            degrades to system fonts instead of invisible text. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
