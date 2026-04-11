import './globals.css';
import Providers from './providers';

const siteUrl = 'https://artemis3.io';

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'Artemis Coin Presale | Artemis3.io',
    template: '%s | Artemis3.io',
  },

  description:
    'Join the Artemis presale and secure your $ARTM allocation before launch.',

  verification: {
    google: '8-TC18_G7qkTSam-Ccvk0CudU68lL4Qv4cu2na_VVM8',
  },

  applicationName: 'Artemis',

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Artemis',
    title: 'Artemis Coin Presale | Artemis3.io',
    description:
      'Join the Artemis presale and secure your $ARTM allocation before launch.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Artemis Coin Presale | Artemis3.io',
    description:
      'Join the Artemis presale and secure your $ARTM allocation before launch.',
    images: [`${siteUrl}/og-image.png`],
  },
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