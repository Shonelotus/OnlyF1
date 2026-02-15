import "./css/globals.css";
import Header from "@/components/header";

export const metadata = {
  title: 'OpenPaddock',
  description: 'Tutto sulla F1 in un unico posto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
