import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EduHousing',
  description: 'Plateforme de logement étudiant',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
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
          body { margin: 0; background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
