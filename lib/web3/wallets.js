export function normaliseConnectorName(name = '') {
  const lower = name.toLowerCase();

  if (lower.includes('meta')) return 'MetaMask';
  if (lower.includes('coinbase')) return 'Coinbase Wallet';
  if (lower.includes('walletconnect')) return 'WalletConnect';

  return name;
}

export function sortConnectors(connectors) {
  const order = {
    MetaMask: 1,
    'Coinbase Wallet': 2,
    WalletConnect: 3,
  };

  return [...connectors].sort((a, b) => {
    const aName = normaliseConnectorName(a.name);
    const bName = normaliseConnectorName(b.name);
    return (order[aName] || 999) - (order[bName] || 999);
  });
}

export function getWalletDescription(walletName) {
  if (walletName === 'MetaMask') return 'Browser extension or mobile app';
  if (walletName === 'WalletConnect') return 'Use mobile or external wallet';
  if (walletName === 'Coinbase Wallet') return 'Browser extension or mobile app';
  return 'Secure wallet connection';
}