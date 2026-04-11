import PresaleClient from './PresaleClient';

export const metadata = {
  title: 'Buy Artemis Coin | $ARTM Presale',
  description:
    'Connect your wallet and buy $ARTM in the Artemis presale before launch using ETH, USDC, or USDT.',
  alternates: {
    canonical: '/presale',
  },
};

export default function PresalePage() {
  return <PresaleClient />;
}