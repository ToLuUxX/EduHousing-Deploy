import type { Metadata } from 'next'
import Navbar from './Navbar'

export const metadata: Metadata = {
  title: 'EduHousing — Logement étudiant en France',
  description: 'Trouvez votre logement étudiant en France grâce à notre carte interactive.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --accent: #3B82F6;
            --accent-alpha: rgba(59, 130, 246, 0.08);
            --bg: #F0F4FF;
            --surface: #FFFFFF;
            --border: #E2E8F4;
            --text: #0F172A;
            --text-muted: #64748B;
            --shadow: rgba(59, 130, 246, 0.12);
          }
          *, *::before, *::after { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: 'Sora', system-ui, sans-serif;
          }
          a { transition: opacity 0.15s; }
          button { font-family: inherit; }
        `}</style>
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
