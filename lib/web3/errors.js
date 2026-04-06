export function mapTransactionErrorToNotice(error) {
  const message = error?.message?.toLowerCase?.() || '';

  if (
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('rejected') ||
    message.includes('declined')
  ) {
    return {
      type: 'warning',
      message: 'Transaction cancelled',
    };
  }

  if (
    message.includes('insufficient funds') ||
    message.includes('exceeds balance') ||
    message.includes('transfer amount exceeds balance')
  ) {
    return {
      type: 'error',
      message: 'Insufficient balance for this transaction',
    };
  }

  if (
    message.includes('gas required exceeds allowance') ||
    message.includes('intrinsic gas too low') ||
    message.includes('out of gas')
  ) {
    return {
      type: 'error',
      message: 'Transaction could not be completed due to gas settings',
    };
  }

  if (
    message.includes('nonce') ||
    message.includes('replacement transaction underpriced')
  ) {
    return {
      type: 'error',
      message: 'A wallet transaction conflict occurred. Please try again',
    };
  }

  if (
    message.includes('execution reverted') ||
    message.includes('call exception')
  ) {
    return {
      type: 'error',
      message: 'Transaction failed to execute',
    };
  }

  return {
    type: 'error',
    message: 'Unable to complete transaction',
  };
}

export function mapWalletErrorToNotice(error) {
  const message = error?.message?.toLowerCase?.() || '';

  if (
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('rejected') ||
    message.includes('declined')
  ) {
    return {
      type: 'warning',
      message: 'Connection cancelled',
    };
  }

  if (message.includes('connector not found')) {
    return {
      type: 'error',
      message: 'Wallet not available',
    };
  }

  if (message.includes('switch chain') || message.includes('chain mismatch')) {
    return {
      type: 'warning',
      message: 'Switch to Ethereum mainnet and try again',
    };
  }

  return {
    type: 'error',
    message: 'Unable to connect wallet',
  };
}

export function isUserRejectedError(error) {
  const message = error?.message?.toLowerCase?.() || '';

  return (
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('rejected') ||
    message.includes('declined')
  );
}