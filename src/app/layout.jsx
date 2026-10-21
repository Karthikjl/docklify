import '../index.css';
import { EditorProvider } from '../context/EditorContext';
import AppShell from '../components/AppShell';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata = {
  title: 'Docklify - Markdown, HTML, JSON & Mermaid Viewer',
  description: 'Modern, high-performance Markdown, HTML, JSON and Mermaid viewer & editor with real-time preview and intelligent formatting',
  keywords: 'docklify, markdown viewer, html editor, json viewer, mermaid diagrams, latex, real-time preview',
  authors: [{ name: 'Docklify' }],
  icons: {
    icon: [
      { url: `${basePath}/logo.svg`, type: 'image/svg+xml' },
      { url: `${basePath}/favicon.ico`, sizes: '32x32' },
    ],
    shortcut: `${basePath}/logo.svg`,
    apple: `${basePath}/logo.svg`,
  },
  openGraph: {
    title: 'Docklify - Markdown, HTML, JSON & Mermaid Viewer',
    description: 'Modern, high-performance Markdown, HTML, JSON and Mermaid viewer & editor with real-time preview',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href={`${basePath}/logo.svg`} />
        <link rel="alternate icon" href={`${basePath}/favicon.ico`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.css"
          integrity="sha384-3rdsX6e5mueWyoweR9NIVmtEsUkokpBT/0ALqKKIBMr9j4qhHkaIkAcGgsE6uVlp"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <EditorProvider>
          <AppShell>{children}</AppShell>
        </EditorProvider>
      </body>
    </html>
  );
}
