import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Artemis',
  description: 'Artemis presale portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}