# Map Explorer

Application Next.js pour rechercher une ville en France et afficher les logements PostgreSQL sur une carte MapLibre/OpenFreeMap.

## Variables d'environnement

Créer `.env.local` :

```env
DATABASE_URL=postgresql://username:password@localhost:5432/logements_db
PG_LOGEMENTS_TABLE=logements
NEXT_PUBLIC_OPENFREEMAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

## Lancer

```bash
npm install
npm run dev
```
