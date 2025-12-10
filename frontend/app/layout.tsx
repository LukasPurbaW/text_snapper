// This import should be at the top of your layout file
import "./globals.css";  // or "@/globals.css" if using src directory

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}