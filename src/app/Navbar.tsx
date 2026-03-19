'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 2000,
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '0 28px', height: 60,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e5e7eb',
      fontFamily: "'Sora', system-ui, sans-serif",
    }}>
      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
          edu<span style={{ color: '#3b82f6' }}>Housing</span>
        </span>
      </Link>

      {/* Links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: 2, listStyle: 'none', margin: 0, padding: 0, flex: 1 }}>
        {[
          { href: '/', label: 'Accueil' },
          { href: '/explore', label: 'Explorer' },
        ].map(({ href, label }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link href={href} style={{
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                color: active ? '#3b82f6' : '#64748b',
                background: active ? '#eff6ff' : 'transparent',
                padding: '6px 12px', borderRadius: 8,
                transition: 'all 0.15s',
              }}>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <a href="#" style={{
          textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#334155',
          padding: '7px 16px', borderRadius: 10, border: '1px solid #cbd5e1',
          transition: 'all 0.15s',
        }}>
          Connexion
        </a>
        <a href="#" style={{
          textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#fff',
          padding: '7px 16px', borderRadius: 10,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          border: '1px solid #3b82f6',
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
          transition: 'all 0.15s',
        }}>
          S&apos;inscrire
        </a>
      </div>
    </nav>
  )
}
