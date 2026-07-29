const React = require('react');
const { Html, Head, Main, NextScript } = require('next/document');

// _document.js — Global HTML Document Template
// Adds charset, viewport, theme-color, favicons, and global SEO meta tags
// for every page of lekya.in

export default function Document() {
  return (
    <Html lang="en-IN">
      <Head>
        {/* Character Set & Encoding */}
        <meta charSet="utf-8" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />

        {/* Theme Color for browser tab & PWA */}
        <meta name="theme-color" content="#0a0010" />
        <meta name="msapplication-TileColor" content="#0a0010" />

        {/* Default SEO (overridden per page) */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Lekya Specs" />
        <meta name="copyright" content="Lekya Group" />

        {/* Fonts — Inter + Playfair Display */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />

        {/* Web App Manifest (PWA) */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
