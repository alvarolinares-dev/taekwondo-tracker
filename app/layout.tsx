import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Progreso Taekwondo - Seguimiento del Estudiante",
  description: "Aplicación para seguir el progreso y desarrollo de tu hijo/a en Taekwondo. Visualiza técnica, comportamiento, respeto y disciplina.",
  keywords: "taekwondo, progreso, estudiante, seguimiento, artes marciales",
  authors: [{ name: "Academia Taekwondo" }],
  openGraph: {
    title: "Progreso Taekwondo",
    description: "Seguimiento del desarrollo y progreso en Taekwondo",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥋</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}