'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useAccount,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { mainnet } from 'wagmi/chains';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';

import {
  MINIMUM_USD,
  USDC_ETHEREUM_ADDRESS,
  USDT_ETHEREUM_ADDRESS,
  ERC20_TRANSFER_ABI,
} from '@/lib/web3/constants';

import {
  mapTransactionErrorToNotice,
  mapWalletErrorToNotice,
  isUserRejectedError,
} from '@/lib/web3/errors';

const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET;
const CURRENT_BATCH_PRICE = 0.25;

const acceptedAssets = [
  { symbol: 'ETH', network: 'Ethereum' },
  { symbol: 'USDC', network: 'Ethereum' },
  { symbol: 'USDT', network: 'Ethereum' },
];

function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normaliseConnectorName(name = '') {
  const lower = name.toLowerCase();

  if (lower.includes('meta')) return 'MetaMask';
  if (lower.includes('coinbase')) return 'Coinbase Wallet';
  if (lower.includes('walletconnect')) return 'WalletConnect';

  return name;
}

function Button({ className = '', variant = 'default', children, type = 'button', ...props }) {
  const base =
    'inline-flex items-center justify-center transition-all duration-200 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default:
      'bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 text-white hover:from-blue-400 hover:via-sky-300 hover:to-cyan-200',
    outline:
      'border border-blue-400/30 bg-blue-500/5 text-blue-100 hover:bg-blue-500/10',
    ghost: 'text-blue-100 hover:bg-blue-500/10',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function NumberInput({ label, value, onChange, suffix }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-[0.24em] text-blue-200/45">{label}</div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <input
          type="number"
          min="0"
          step="0.0001"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-3xl font-semibold text-white outline-none"
          placeholder="0"
          inputMode="decimal"
          aria-label={`${label} in ${suffix}`}
        />
        <div className="whitespace-nowrap text-sm text-blue-100/60">{suffix}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />;
}

function validateAmount(amountValue) {
  const amount = Number(amountValue || 0);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function calculateEstimatedUsdValue(amountValue, asset, assetUsdPrice) {
  const amount = validateAmount(amountValue);
  if (amount <= 0) return 0;
  return amount * assetUsdPrice;
}

function calculateEstimatedTokens(usdValue) {
  if (usdValue <= 0) return '0';
  return (usdValue / CURRENT_BATCH_PRICE).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export default function ArtemisPresalePage() {
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ethUsdPrice, setEthUsdPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [walletNotice, setWalletNotice] = useState(null);
  const [transactionNotice, setTransactionNotice] = useState(null);

  const { address, isConnected, connector, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const {
    data: ethTxHash,
    sendTransaction,
    isPending: isSendingTransaction,
    error: sendError,
  } = useSendTransaction();

  const {
    data: tokenTxHash,
    writeContract,
    isPending: isWritingContract,
    error: writeError,
  } = useWriteContract();

  const activeTxHash = ethTxHash || tokenTxHash;

  const {
    isLoading: isConfirmingTransaction,
    isSuccess: isTransactionConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: activeTxHash,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchEthPrice = async () => {
      try {
        setPriceLoading(true);
        setPriceError('');

        const response = await fetch('/api/eth-price', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load ETH price');
        }

        const data = await response.json();

        if (active) {
          setEthUsdPrice(data.ethUsd);
        }
      } catch {
        if (active) {
          setPriceError('Unable to load ETH/USD price');
        }
      } finally {
        if (active) {
          setPriceLoading(false);
        }
      }
    };

    fetchEthPrice();

    const interval = setInterval(fetchEthPrice, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!walletNotice) return;

    const timeout = window.setTimeout(() => {
      setWalletNotice(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [walletNotice]);

  useEffect(() => {
    if (!sendError) return;

    setTransactionNotice(mapTransactionErrorToNotice(sendError));

    if (!isUserRejectedError(sendError)) {
      console.error(sendError);
    }
  }, [sendError]);

  useEffect(() => {
    if (!writeError) return;

    setTransactionNotice(mapTransactionErrorToNotice(writeError));

    if (!isUserRejectedError(writeError)) {
      console.error(writeError);
    }
  }, [writeError]);

  useEffect(() => {
    if (!receiptError) return;

    setTransactionNotice(mapTransactionErrorToNotice(receiptError));

    if (!isUserRejectedError(receiptError)) {
      console.error(receiptError);
    }
  }, [receiptError]);

  useEffect(() => {
    if (!transactionNotice) return;

    const timeout = window.setTimeout(() => {
      setTransactionNotice(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [transactionNotice]);

  useEffect(() => {
    if (selectedAsset === 'USDC' || selectedAsset === 'USDT') {
      setPaymentAmount(String(MINIMUM_USD));
      return;
    }

    if (selectedAsset === 'ETH' && ethUsdPrice && ethUsdPrice > 0) {
      const ethAmount = (MINIMUM_USD / ethUsdPrice).toFixed(6);
      setPaymentAmount(ethAmount);
    }
  }, [selectedAsset, ethUsdPrice]);

  const assetUsdPrice = useMemo(() => {
    if (selectedAsset === 'ETH') return ethUsdPrice ?? 0;
    if (selectedAsset === 'USDC') return 1;
    if (selectedAsset === 'USDT') return 1;
    return 0;
  }, [selectedAsset, ethUsdPrice]);

  const numericPaymentAmount = useMemo(() => validateAmount(paymentAmount), [paymentAmount]);

  const estimatedUsdValue = useMemo(
    () => calculateEstimatedUsdValue(paymentAmount, selectedAsset, assetUsdPrice),
    [paymentAmount, selectedAsset, assetUsdPrice]
  );

  const estimatedTokens = useMemo(
    () => calculateEstimatedTokens(estimatedUsdValue),
    [estimatedUsdValue]
  );

  const selectedWalletName = connector ? normaliseConnectorName(connector.name) : null;
  const isOnEthereumMainnet = chain?.id === mainnet.id;
  const meetsMinimum = estimatedUsdValue >= MINIMUM_USD;

  const isEthPurchase = selectedAsset === 'ETH';
  const isUsdcPurchase = selectedAsset === 'USDC';
  const isUsdtPurchase = selectedAsset === 'USDT';
  const isTokenPurchase = isUsdcPurchase || isUsdtPurchase;

  const selectedTokenAddress = isUsdcPurchase
    ? USDC_ETHEREUM_ADDRESS
    : isUsdtPurchase
      ? USDT_ETHEREUM_ADDRESS
      : null;

  const selectedTokenDecimals = isTokenPurchase ? 6 : 18;

  const isSubmittingTransaction =
    isSendingTransaction || isWritingContract || isConfirmingTransaction;

  const canSubmitTransaction =
    isConnected &&
    isOnEthereumMainnet &&
    numericPaymentAmount > 0 &&
    meetsMinimum &&
    !isSubmittingTransaction &&
    !isSwitchingChain &&
    !!TREASURY_WALLET;

  const etherscanUrl = activeTxHash ? `https://etherscan.io/tx/${activeTxHash}` : null;

  const handleCopyAddress = async () => {
    if (!address || typeof window === 'undefined' || !navigator?.clipboard) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  };

  const handleSwitchToEthereum = () => {
    switchChain({ chainId: mainnet.id });
  };

  const handleOpenWalletModal = () => {
    setWalletNotice(null);

    if (!openConnectModal) {
      setWalletNotice(
        mapWalletErrorToNotice(
          new Error('Wallet modal unavailable. Check RainbowKit provider setup.')
        )
      );
      return;
    }

    openConnectModal();
  };

  const handleManageWallet = () => {
    if (openAccountModal) {
      openAccountModal();
      return;
    }

    disconnect();
  };

  const handleLaunchSequence = () => {
    if (!isConnected) {
      setActionMessage('Connect your wallet before continuing.');
      return;
    }

    if (!isOnEthereumMainnet) {
      setActionMessage('Switch to Ethereum mainnet before continuing.');
      return;
    }

    if (numericPaymentAmount <= 0) {
      setActionMessage('Enter a valid contribution amount.');
      return;
    }

    if (!meetsMinimum) {
      setActionMessage(`Minimum purchase is $${MINIMUM_USD} equivalent.`);
      return;
    }

    if (!TREASURY_WALLET) {
      setActionMessage('Add your treasury wallet address before testing transactions.');
      return;
    }

    try {
      setActionMessage('');
      setTransactionNotice(null);

      if (isEthPurchase) {
        sendTransaction({
          to: TREASURY_WALLET,
          value: parseEther(paymentAmount),
          chainId: mainnet.id,
        });
        return;
      }

      if (isTokenPurchase && selectedTokenAddress) {
        writeContract({
          abi: ERC20_TRANSFER_ABI,
          address: selectedTokenAddress,
          functionName: 'transfer',
          args: [TREASURY_WALLET, parseUnits(paymentAmount, selectedTokenDecimals)],
          chainId: mainnet.id,
        });
        return;
      }

      setActionMessage('Unsupported payment asset.');
    } catch {
      setActionMessage('Unable to prepare the transaction.');
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.28),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.12),transparent_28%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(white 0.7px, transparent 0.7px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-6 md:py-10">
        <header className="mb-8 flex items-center justify-between gap-4 px-0 py-2">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <span className="text-xl">🚀</span>
            </div>

            <div className="leading-tight">
              <div className="text-xl font-semibold tracking-[0.2em] text-white">
                ARTEMIS
              </div>
              <div className="text-xs tracking-[0.35em] text-blue-300/60">
                LUNAR MEMECOIN MISSION
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm text-blue-100 transition-all duration-200 hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mission Control
          </Link>
        </header>

        <section
          aria-labelledby="presale-heading"
          className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_80px_rgba(37,99,235,0.08)] backdrop-blur-xl md:p-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h1 id="presale-heading" className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Secure your $ARTM3 allocation
            </h1>
            <div className="mt-4 text-xl font-medium text-cyan-300 md:text-2xl">
              Batch 1 — $0.25
            </div>
            <p className="mt-2 text-sm text-blue-100/60 md:text-base">
              Price increases as batches fill
            </p>
            <p className="mt-4 text-sm text-blue-100/65 md:text-base">
              Buy $ARTM3 in the Artemis presale using ETH, USDC, or USDT on the Ethereum network.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            <Divider />
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            {!isConnected ? (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                  <Button
                    className="h-14 w-full rounded-2xl text-base font-semibold shadow-[0_0_30px_rgba(59,130,246,0.28)]"
                    onClick={handleOpenWalletModal}
                    disabled={!isMounted}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>

                  <div className="mt-4 text-center text-sm text-blue-100/60">
                    Choose MetaMask or WalletConnect in the wallet modal.
                  </div>

                  {walletNotice && (
                    <div
                      className={`mt-4 flex min-h-[56px] items-center rounded-2xl p-4 text-sm ${
                        walletNotice.type === 'warning'
                          ? 'border border-amber-300/20 bg-amber-400/10 text-amber-100/80'
                          : 'border border-red-300/20 bg-red-400/10 text-red-100/80'
                      }`}
                    >
                      <span className="line-clamp-2">{walletNotice.message}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-200" />
                  <div className="w-full">
                    <div className="font-medium text-emerald-100">
                      {selectedWalletName || 'Wallet'} connected
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="rounded-full border border-emerald-300/20 bg-black/20 px-3 py-1 text-xs text-emerald-100/80">
                        {formatAddress(address)}
                      </div>

                      {chain?.name && (
                        <div className="rounded-full border border-emerald-300/20 bg-black/20 px-3 py-1 text-xs text-emerald-100/80">
                          {chain.name}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-black/20 px-3 py-1 text-xs text-emerald-100/80 hover:bg-black/30"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {!isOnEthereumMainnet && (
                  <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-4">
                    <div className="font-medium text-amber-100">Ethereum mainnet required</div>
                    <div className="mt-1 text-sm text-amber-100/70">
                      Switch your wallet to Ethereum mainnet before continuing.
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 h-11 rounded-2xl font-medium"
                      onClick={handleSwitchToEthereum}
                      disabled={isSwitchingChain}
                    >
                      {isSwitchingChain ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Switching...
                        </>
                      ) : (
                        'Switch to Ethereum'
                      )}
                    </Button>
                  </div>
                )}

                <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {acceptedAssets.map((asset) => {
                      const active = selectedAsset === asset.symbol;
                      return (
                        <button
                          type="button"
                          key={asset.symbol}
                          onClick={() => setSelectedAsset(asset.symbol)}
                          className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                            active
                              ? 'border-cyan-300/30 bg-cyan-300/10'
                              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          }`}
                          aria-pressed={active}
                        >
                          <div className="font-semibold text-white">{asset.symbol}</div>
                          <div className="mt-1 text-sm text-blue-100/55">{asset.network}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <NumberInput
                      label="Amount"
                      value={paymentAmount}
                      onChange={setPaymentAmount}
                      suffix={selectedAsset}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-blue-200/45">
                      You receive
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-3xl font-semibold text-white">{estimatedTokens} ARTM3</div>
                      <div className="text-sm text-blue-100/55">at $0.25</div>
                    </div>
                    <div className="mt-2 text-sm text-blue-100/55">
                      {selectedAsset === 'ETH' ? (
                        priceLoading ? (
                          'Loading ETH/USD price...'
                        ) : priceError ? (
                          priceError
                        ) : (
                          <>1 ETH = ${ethUsdPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</>
                        )
                      ) : (
                        <>1 {selectedAsset} = $1.00</>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-blue-100/55">
                      Estimated contribution: $
                      {estimatedUsdValue.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="mt-1 text-sm text-blue-100/45">
                      Destination: {TREASURY_WALLET ? formatAddress(TREASURY_WALLET) : 'Not configured'}
                    </div>
                  </div>

                  {actionMessage && (
                    <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100/80">
                      {actionMessage}
                    </div>
                  )}

                  {transactionNotice && (
                    <div
                      className={`mt-4 flex min-h-[56px] items-center rounded-2xl p-4 text-sm ${
                        transactionNotice.type === 'warning'
                          ? 'border border-amber-300/20 bg-amber-400/10 text-amber-100/80'
                          : 'border border-red-300/20 bg-red-400/10 text-red-100/80'
                      }`}
                    >
                      <span className="line-clamp-2">{transactionNotice.message}</span>
                    </div>
                  )}

                  {activeTxHash && (
                    <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <div className="text-sm text-cyan-100/90">Transaction submitted</div>
                      <div className="mt-2 break-all text-xs text-cyan-100/70">{activeTxHash}</div>
                      {etherscanUrl && (
                        <a
                          href={etherscanUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-100 hover:underline"
                        >
                          View on Etherscan
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {isTransactionConfirmed && (
                    <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100/85">
                      Payment confirmed on Ethereum mainnet.
                    </div>
                  )}

                  <Button
                    className="mt-5 h-14 w-full rounded-2xl text-base font-semibold shadow-[0_0_30px_rgba(59,130,246,0.28)]"
                    onClick={handleLaunchSequence}
                    disabled={!canSubmitTransaction}
                  >
                    {isSendingTransaction ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening wallet...
                      </>
                    ) : isWritingContract ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening wallet...
                      </>
                    ) : isConfirmingTransaction ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming transaction...
                      </>
                    ) : (
                      'Buy $ARTM3'
                    )}
                  </Button>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl font-medium"
                      onClick={handleManageWallet}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Manage Wallet
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl font-medium"
                      onClick={disconnect}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            <Divider />
          </div>

          <section aria-labelledby="presale-trust-heading" className="mx-auto mt-8 max-w-2xl">
            <h2 id="presale-trust-heading" className="sr-only">
              Presale trust indicators
            </h2>

            <div className="mb-4 text-center text-sm text-blue-100/55">
              Built on Ethereum. Fixed supply. Buy using ETH, USDC or USDT.
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-white">
                  <Lock className="h-4 w-4 text-cyan-200" />
                  Liquidity locked
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-white">
                  <TrendingDown className="h-4 w-4 text-cyan-200" />
                  Fixed supply
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-white">
                  <ShieldCheck className="h-4 w-4 text-cyan-200" />
                  Team vested
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

export function __testables() {
  return {
    formatAddress,
    normaliseConnectorName,
    validateAmount,
    calculateEstimatedUsdValue,
    calculateEstimatedTokens,
    MINIMUM_USD,
    CURRENT_BATCH_PRICE,
  };
}