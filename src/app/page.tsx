'use client'

import { useRouter } from 'next/navigation'
import CitySearchBar from '@/features/map/CitySearchBar'
import type { MapLocation } from '@/types/housing'

const STATS = [
  { value: '12 000+', label: 'Logements disponibles' },
  { value: '200+', label: 'Villes en France' },
  { value: '98%', label: 'Étudiants satisfaits' },
]

export default function HomePage() {
  const router = useRouter()

  const handleSelect = (location: MapLocation) => {
    const params = new URLSearchParams({
      city: location.name.split(',')[0].trim(),
      lat: String(location.lat),
      lon: String(location.lon),
      name: location.name,
    })
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '48px 24px 80px',
        }}
      >
        {/* Background gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1976d2 100%)',
            zIndex: 0,
          }}
        />

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-8%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'rgba(99,102,241,0.1)', zIndex: 0,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 720, textAlign: 'center' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99,
            padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>
              Plateforme de logement étudiant en France
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            margin: '0 0 16px',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#ffffff',
          }}>
            Trouvez votre{' '}
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              logement idéal
            </span>
            {' '}près de votre université
          </h1>

          <p style={{ margin: '0 0 40px', fontSize: 18, color: '#94a3b8', lineHeight: 1.6, maxWidth: 560, marginInline: 'auto' }}>
            Explorez des milliers de logements sur une carte interactive. Filtrez par ville, prix et type de logement.
          </p>

          {/* Search bar */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 24,
            padding: '10px 10px 10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            marginBottom: 48,
          }}>
            <div style={{ flex: 1 }}>
              <CitySearchBar onSelect={handleSelect} variant="hero" />
            </div>
            <button
              style={{
                flexShrink: 0,
                height: 52,
                padding: '0 28px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)'
              }}
            >
              Rechercher
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {STATS.map((s) => (
              <div key={s.value} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            Comment ça marche ?
          </h2>
          <p style={{ margin: '0 0 56px', color: 'var(--text-muted)', fontSize: 16 }}>
            En trois étapes simples, trouvez le logement parfait.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '🔍', title: 'Cherchez votre ville', desc: 'Tapez le nom de votre ville ou université dans la barre de recherche.' },
              { step: '02', icon: '🗺️', title: 'Explorez la carte', desc: 'Visualisez tous les logements disponibles autour de votre destination.' },
              { step: '03', icon: '🏠', title: 'Trouvez votre logement', desc: 'Filtrez par prix, type et contactez directement les propriétaires.' },
            ].map((item) => (
              <div key={item.step} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '32px 24px',
                textAlign: 'left',
                boxShadow: '0 2px 8px var(--shadow)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-alpha)', padding: '3px 10px', borderRadius: 99, letterSpacing: 1 }}>
                    ÉTAPE {item.step}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
