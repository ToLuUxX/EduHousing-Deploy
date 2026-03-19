import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/navbar";

export const metadata: Metadata = {
  title: "Eduousing — Trouvez votre logement",
  description: "Carte interactive avec recherche de logements étudiants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
        />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
