'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther } from 'viem';
import { mainnet } from 'wagmi/chains';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  Moon,
  Radio,
  Rocket,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';

const PRESALE_END_DATE = '2027-03-31T23:59:59Z';
const TREASURY_WALLET = '0xYOUR_TREASURY_WALLET_HERE';
const MINIMUM_USD = 25;

const acceptedAssets = [
  { symbol: 'ETH', network: 'Ethereum', priceLabel: 'Pay with native ETH' },
  { symbol: 'USDC', network: 'Ethereum', priceLabel: 'Stablecoin rail' },
  { symbol: 'USDT', network: 'Ethereum', priceLabel: 'Stablecoin rail' },
];

const batches = [
  { batch: 'Batch 1', price: '$0.10', status: 'Live now', progress: 72 },
  { batch: 'Batch 2', price: '$0.25', status: 'Locked', progress: 0 },
  { batch: 'Batch 3', price: '$0.50', status: 'Locked', progress: 0 },
  { batch: 'Final Batch', price: '$0.75', status: 'Locked', progress: 0 },
];

const missionChecks = [
  'Crew manifest open',
  'Minimum allocation $250',
  'Accepted assets: ETH, USDC, USDT',
  'Listing target aligned to Artemis III',
];

function getTimeRemaining(targetDate) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, complete: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    complete: false,
  };
}

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

function sortConnectors(connectors) {
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

function getWalletDescription(walletName) {
  if (walletName === 'MetaMask') return 'Browser extension or mobile app';
  if (walletName === 'WalletConnect') return 'Use mobile or external wallet';
  if (walletName === 'Coinbase Wallet') return 'Browser extension or mobile app';
  return 'Secure wallet connection';
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

function Progress({ value = 0, className = '' }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function NumberInput({ label, value, onChange, suffix }) {
  return (
    <div className="rounded-2xl border border-blue-400/20 bg-black/30 p-4">
      <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">{label}</div>
      <div className="flex items-center justify-between gap-3 mt-3">
        <input
          type="number"
          min="0"
          step="0.0001"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-2xl font-semibold text-blue-50 outline-none"
        />
        <div className="text-sm text-blue-100/60 whitespace-nowrap">{suffix}</div>
      </div>
    </div>
  );
}

export default function ArtemisPresalePage() {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(PRESALE_END_DATE));
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [paymentAmount, setPaymentAmount] = useState('250');
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ethUsdPrice, setEthUsdPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [connectingWallet, setConnectingWallet] = useState(null);

  const { address, isConnected, connector, chain } = useAccount();
  const { connect, connectors, isPending, pendingConnector, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const {
    data: txHash,
    sendTransaction,
    isPending: isSendingTransaction,
    error: sendError,
  } = useSendTransaction();

  const {
    isLoading: isConfirmingTransaction,
    isSuccess: isTransactionConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(PRESALE_END_DATE));
    }, 1000);

    return () => clearInterval(interval);
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
    if (selectedAsset !== 'ETH') {
      setActionMessage('ETH is enabled for the MVP test. USDC and USDT will follow next.');
    } else {
      setActionMessage('');
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (isConnected) {
      setConnectingWallet(null);
    }
  }, [isConnected]);

  useEffect(() => {
    if (error) {
      setConnectingWallet(null);
    }
  }, [error]);

  const currentBatchPrice = 0.1;

  const assetUsdPrice = useMemo(() => {
    if (selectedAsset === 'ETH') return ethUsdPrice ?? 0;
    if (selectedAsset === 'USDC') return 1;
    if (selectedAsset === 'USDT') return 1;
    return 0;
  }, [selectedAsset, ethUsdPrice]);

  const numericPaymentAmount = useMemo(() => {
    const amount = Number(paymentAmount || 0);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }, [paymentAmount]);

  const estimatedUsdValue = useMemo(() => {
    if (numericPaymentAmount <= 0) return 0;
    return numericPaymentAmount * assetUsdPrice;
  }, [numericPaymentAmount, assetUsdPrice]);

  const estimatedTokens = useMemo(() => {
    if (estimatedUsdValue <= 0) return '0';

    return (estimatedUsdValue / currentBatchPrice).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }, [estimatedUsdValue]);

  const countdownBlocks = useMemo(
    () => [
      {
        label: 'Days',
        value: isMounted ? String(timeRemaining.days).padStart(2, '0') : '--',
      },
      {
        label: 'Hours',
        value: isMounted ? String(timeRemaining.hours).padStart(2, '0') : '--',
      },
      {
        label: 'Minutes',
        value: isMounted ? String(timeRemaining.minutes).padStart(2, '0') : '--',
      },
      {
        label: 'Seconds',
        value: isMounted ? String(timeRemaining.seconds).padStart(2, '0') : '--',
      },
    ],
    [timeRemaining, isMounted]
  );

  const supportedConnectors = useMemo(() => {
    if (!isMounted) return [];

    const filtered = connectors.filter((item) => {
      const name = normaliseConnectorName(item.name);
      return ['MetaMask', 'Coinbase Wallet', 'WalletConnect'].includes(name);
    });

    const unique = filtered.filter((connectorItem, index, array) => {
      return (
        index ===
        array.findIndex(
          (item) =>
            item.id === connectorItem.id ||
            normaliseConnectorName(item.name) ===
              normaliseConnectorName(connectorItem.name)
        )
      );
    });

    return sortConnectors(unique);
  }, [connectors, isMounted]);

  const selectedWalletName = connector ? normaliseConnectorName(connector.name) : null;
  const isOnEthereumMainnet = chain?.id === mainnet.id;
  const meetsMinimum = estimatedUsdValue >= MINIMUM_USD;
  const isEthPurchase = selectedAsset === 'ETH';

  const canSubmitEthTransaction =
    isConnected &&
    isEthPurchase &&
    isOnEthereumMainnet &&
    numericPaymentAmount > 0 &&
    meetsMinimum &&
    !isSendingTransaction &&
    !isConfirmingTransaction &&
    !isSwitchingChain &&
    TREASURY_WALLET !== '0xYOUR_TREASURY_WALLET_HERE';

  const handleReturnToLanding = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

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

  const handleWalletConnect = (walletConnector) => {
    const walletName = normaliseConnectorName(walletConnector.name);
    setConnectingWallet(walletName);
    connect({ connector: walletConnector });
  };

  const handleCancelWalletConnection = () => {
    setConnectingWallet(null);
  };

  const handleLaunchSequence = () => {
    if (!isConnected) {
      setActionMessage('Connect your wallet before entering the launch sequence.');
      return;
    }

    if (!isEthPurchase) {
      setActionMessage('ETH is enabled for the MVP test. USDC and USDT will follow next.');
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
      setActionMessage(`Minimum boarding is $${MINIMUM_USD} equivalent.`);
      return;
    }

    if (TREASURY_WALLET === '0xYOUR_TREASURY_WALLET_HERE') {
      setActionMessage('Add your treasury wallet address before testing transactions.');
      return;
    }

    try {
      setActionMessage('');
      sendTransaction({
        to: TREASURY_WALLET,
        value: parseEther(paymentAmount),
        chainId: mainnet.id,
      });
    } catch {
      setActionMessage('Unable to prepare the ETH transaction.');
    }
  };

  const etherscanUrl = txHash ? `https://etherscan.io/tx/${txHash}` : null;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.45),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(147,197,253,0.25),transparent_35%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(white 0.7px, transparent 0.7px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-blue-400/20 bg-blue-500/5 backdrop-blur-xl px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-blue-200/60">
              Artemis Presale Portal
            </div>
            <div className="text-xl font-semibold text-blue-50 mt-1">
              Mission Control / Boarding Gate
            </div>
          </div>
          <button
            type="button"
            onClick={handleReturnToLanding}
            className="inline-flex items-center justify-center rounded-2xl h-12 px-5 border border-blue-400/20 text-blue-100 hover:bg-blue-500/10 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Landing Page
          </button>
        </header>

        <section className="grid xl:grid-cols-[1.08fr_0.92fr] gap-8 items-start pt-12 pb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200 mb-5">
              <Radio className="w-4 h-4" />
              Crew boarding channel open
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight">
              Board the mission.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-400 to-sky-300">
                Secure your lunar allocation.
              </span>
            </h1>

            <p className="mt-6 text-lg text-blue-100/70 max-w-2xl leading-8">
              This is the dedicated presale portal for Artemis. Connect your wallet,
              confirm your allocation, and enter the launch sequence before the crew
              manifest closes on 31 March 2027.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-3xl">
              {[
                ['Current batch', 'Batch 1 / $0.10'],
                ['Launch objective', 'Tier 1 exchange'],
                ['Primary catalyst', 'Artemis III'],
                ['Raise target', '$10,000,000'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5"
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                    {label}
                  </div>
                  <div className="text-2xl font-semibold text-blue-50 mt-3">{value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 backdrop-blur-xl p-6 mt-8 max-w-4xl">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-blue-200/45">
                    Final boarding countdown
                  </div>
                  <div className="text-2xl md:text-3xl font-semibold text-blue-50 mt-2">
                    Presale ends 31 March 2027
                  </div>
                </div>
                <div className="rounded-full border border-blue-400/20 bg-black/30 px-4 py-2 text-sm text-blue-100/75">
                  {!isMounted
                    ? 'Syncing telemetry'
                    : timeRemaining.complete
                    ? 'Boarding closed'
                    : 'Manifest still open'}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {countdownBlocks.map((block) => (
                  <div
                    key={block.label}
                    className="rounded-3xl border border-blue-400/20 bg-black/35 p-4 text-center"
                  >
                    <div className="text-3xl md:text-4xl font-semibold text-blue-50">
                      {block.value}
                    </div>
                    <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45 mt-2">
                      {block.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-300/25 bg-gradient-to-br from-blue-500/15 via-sky-400/10 to-cyan-300/15 p-6 md:p-8 mt-8 max-w-4xl">
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/55">
                Mission briefing
              </div>
              <div className="text-3xl font-semibold mt-2 text-blue-50">
                What happens next
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {[
                  [
                    '1. Connect wallet',
                    'Authenticate entry to the boarding gate and confirm you are on a supported network.',
                  ],
                  [
                    '2. Confirm allocation',
                    'Choose your asset, enter your contribution, and review the ARTM received at the live batch price.',
                  ],
                  [
                    '3. Enter launch sequence',
                    'Submit the transaction on-chain and secure your position ahead of Artemis III.',
                  ],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-cyan-300/20 bg-black/30 p-5"
                  >
                    <div className="text-lg font-semibold text-blue-50">{title}</div>
                    <div className="text-sm leading-7 text-blue-100/65 mt-3">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-[2rem] border border-blue-400/20 bg-black/35 backdrop-blur-xl p-6 md:p-8 sticky top-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                    Boarding gate
                  </div>
                  <div className="text-3xl font-semibold text-blue-50 mt-2">
                    {isConnected ? 'Crew confirmed' : 'Connect wallet'}
                  </div>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-xs border ${
                    isConnected
                      ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
                      : 'border-blue-400/20 bg-blue-500/5 text-blue-100/75'
                  }`}
                >
                  {isConnected ? 'Wallet live' : 'Awaiting connection'}
                </div>
              </div>

              {!isConnected ? (
                <div className="mt-6">
                  <div className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
                    <div className="text-sm text-blue-100/70 leading-7">
                      Connect your wallet to unlock the presale console. Once connected,
                      you will be able to choose your asset, review your estimated ARTM
                      allocation, and submit your transaction.
                    </div>

                    <div className="space-y-3 mt-5">
                      {!isMounted ? (
                        <div className="rounded-2xl border border-blue-400/20 bg-black/30 px-4 py-4 text-sm text-blue-100/60">
                          Detecting available wallets...
                        </div>
                      ) : connectingWallet ? (
                        <div className="rounded-3xl border border-cyan-300/20 bg-black/30 p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-cyan-200 animate-spin" />
                            </div>
                            <div className="flex-1">
                              <div className="text-blue-50 font-medium">
                                Connecting to {connectingWallet}
                              </div>
                              <div className="text-sm text-blue-100/65 mt-2 leading-7">
                                Check your wallet to continue. On desktop, look for your
                                browser extension popup. On mobile, your wallet app may
                                open automatically.
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-5">
                            <Button
                              variant="outline"
                              className="rounded-2xl h-12 font-medium"
                              onClick={handleCancelWalletConnection}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-2xl h-12 font-medium"
                              onClick={handleCancelWalletConnection}
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Choose Another
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {supportedConnectors.map((walletConnector) => {
                            const walletName = normaliseConnectorName(walletConnector.name);

                            return (
                              <button
                                type="button"
                                key={`${walletConnector.id}-${walletName}`}
                                onClick={() => handleWalletConnect(walletConnector)}
                                disabled={Boolean(connectingWallet)}
                                className="w-full rounded-2xl border border-blue-400/20 bg-black/30 px-4 py-4 flex items-center justify-between text-left hover:bg-blue-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl border border-blue-400/20 bg-blue-400/10 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-blue-200" />
                                  </div>
                                  <div>
                                    <div className="text-blue-50 font-medium">
                                      {walletName}
                                    </div>
                                    <div className="text-sm text-blue-100/55 mt-1">
                                      {getWalletDescription(walletName)}
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-blue-200" />
                              </button>
                            );
                          })}

                          {supportedConnectors.length === 0 && (
                            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100/80">
                              No supported wallet connectors were found. Check that
                              MetaMask, Coinbase Wallet, or WalletConnect are configured
                              in your wagmi setup.
                            </div>
                          )}

                          <div className="rounded-2xl border border-blue-400/20 bg-black/30 p-4 text-sm text-blue-100/60">
                            On desktop, approve the connection in your wallet extension.
                            On mobile, your wallet app may open automatically.
                          </div>

                          {error && (
                            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100/80">
                              {error.message}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-5">
                    <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                        Supported networks
                      </div>
                      <div className="text-blue-50 font-medium mt-3">Ethereum</div>
                    </div>
                    <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                        Accepted assets
                      </div>
                      <div className="text-blue-50 font-medium mt-3">ETH / USDC / USDT</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200 mt-0.5" />
                    <div className="w-full">
                      <div className="text-emerald-100 font-medium">
                        {selectedWalletName || 'Wallet'} connected successfully
                      </div>
                      <div className="text-sm text-emerald-100/70 mt-1">
                        You are cleared for boarding. Continue below to finalize your
                        allocation.
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
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
                          <Copy className="w-3.5 h-3.5" />
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!isOnEthereumMainnet && (
                    <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-4">
                      <div className="text-amber-100 font-medium">
                        Ethereum mainnet required
                      </div>
                      <div className="text-sm text-amber-100/70 mt-1">
                        Switch your wallet to Ethereum mainnet before continuing.
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-2xl h-11 font-medium mt-4"
                        onClick={handleSwitchToEthereum}
                        disabled={isSwitchingChain}
                      >
                        {isSwitchingChain ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Switching...
                          </>
                        ) : (
                          'Switch to Ethereum'
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                          Live batch
                        </div>
                        <div className="text-2xl font-semibold text-blue-50 mt-2">
                          Batch 1 / $0.10
                        </div>
                      </div>
                      <div className="rounded-full border border-blue-400/20 bg-black/30 px-4 py-2 text-sm text-blue-100/75">
                        Minimum boarding: $25
                      </div>
                    </div>

                    <div className="space-y-4 mt-5">
                      <div className="rounded-2xl border border-blue-400/20 bg-black/30 p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                          Choose payment asset
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
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
                                    : 'border-blue-400/20 bg-black/25 hover:bg-blue-500/10'
                                }`}
                              >
                                <div className="text-blue-50 font-semibold">
                                  {asset.symbol}
                                </div>
                                <div className="text-sm text-blue-100/55 mt-1">
                                  {asset.network}
                                </div>
                                <div className="text-xs text-blue-200/45 mt-3">
                                  {asset.priceLabel}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <NumberInput
                        label="Contribution amount"
                        value={paymentAmount}
                        onChange={setPaymentAmount}
                        suffix={selectedAsset}
                      />

                      <div className="rounded-2xl border border-blue-400/20 bg-black/30 p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                          Estimated ARTM received
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-3">
                          <div className="text-3xl font-semibold text-blue-50">
                            {estimatedTokens}
                          </div>
                          <div className="text-sm text-blue-100/55">at $0.10 per coin</div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-blue-400/20 bg-black/30 p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                          Conversion reference
                        </div>

                        <div className="mt-3 text-sm text-blue-100/70">
                          {selectedAsset === 'ETH' ? (
                            priceLoading ? (
                              'Loading ETH/USD price...'
                            ) : priceError ? (
                              priceError
                            ) : (
                              <>
                                1 ETH = $
                                {ethUsdPrice?.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}{' '}
                                USD
                              </>
                            )
                          ) : (
                            <>1 {selectedAsset} = $1.00 USD</>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-blue-100/55">
                          Estimated USD contribution: $
                          {estimatedUsdValue.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-blue-400/20 bg-black/30 p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">
                          Destination wallet
                        </div>
                        <div className="mt-3 text-sm text-blue-100/70">
                          {formatAddress(TREASURY_WALLET)}
                        </div>
                      </div>

                      {actionMessage && (
                        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100/80">
                          {actionMessage}
                        </div>
                      )}

                      {sendError && (
                        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100/80">
                          {sendError.message}
                        </div>
                      )}

                      {receiptError && (
                        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100/80">
                          {receiptError.message}
                        </div>
                      )}

                      {txHash && (
                        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                          <div className="text-sm text-cyan-100/90">
                            Transaction submitted
                          </div>
                          <div className="text-xs text-cyan-100/70 mt-2 break-all">
                            {txHash}
                          </div>
                          {etherscanUrl && (
                            <a
                              href={etherscanUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-cyan-100 mt-3 hover:underline"
                            >
                              View on Etherscan
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      )}

                      {isTransactionConfirmed && (
                        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100/85">
                          ETH payment confirmed on Ethereum mainnet.
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full mt-5 rounded-2xl h-14 text-base font-semibold shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                      onClick={handleLaunchSequence}
                      disabled={!canSubmitEthTransaction}
                    >
                      {isSendingTransaction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening wallet...
                        </>
                      ) : isConfirmingTransaction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Confirming transaction...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Enter Launch Sequence
                        </>
                      )}
                    </Button>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Button
                        variant="outline"
                        className="rounded-2xl h-12 font-medium"
                        onClick={disconnect}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Change Wallet
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl h-12 font-medium"
                        onClick={disconnect}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-blue-50 font-medium">
                    <Clock3 className="w-4 h-4 text-blue-200" />
                    Presale phase
                  </div>
                  <div className="text-blue-100/60 text-sm mt-2">
                    Batch 1 currently active. Later batches unlock sequentially as the
                    mission advances.
                  </div>
                </div>
                <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-blue-50 font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-200" />
                    Security note
                  </div>
                  <div className="text-blue-100/60 text-sm mt-2">
                    Only use supported wallets and supported networks. Confirm all
                    transaction details before submission.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 pb-12">
          <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6 md:p-8">
            <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">
              Mission checks
            </div>
            <div className="text-3xl font-semibold mt-2 text-blue-50">
              Pre-launch checklist
            </div>
            <div className="space-y-4 mt-6">
              {missionChecks.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-blue-400/20 bg-black/30 p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan-200" />
                  <div className="text-blue-100/75">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-sky-400/10 p-6 md:p-8">
            <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">
              Batch telemetry
            </div>
            <div className="text-3xl font-semibold mt-2 text-blue-50">
              Presale progression
            </div>
            <div className="space-y-5 mt-6">
              {batches.map((batch) => (
                <div
                  key={batch.batch}
                  className="rounded-3xl border border-blue-400/20 bg-black/30 p-5"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xl font-semibold text-blue-50">
                        {batch.batch}
                      </div>
                      <div className="text-sm text-blue-100/55 mt-1">
                        Entry price {batch.price}
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-4 py-2 text-sm border ${
                        batch.status === 'Live now'
                          ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                          : 'border-blue-400/20 bg-blue-500/5 text-blue-100/70'
                      }`}
                    >
                      {batch.status}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={batch.progress} className="bg-blue-950/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="rounded-[2rem] border border-blue-400/20 bg-black/35 backdrop-blur-xl p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-5">
              <div className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
                <div className="flex items-center gap-2 text-blue-50 font-medium">
                  <CircleDollarSign className="w-4 h-4 text-cyan-200" />
                  Current live price
                </div>
                <div className="text-4xl font-bold text-cyan-300 mt-3">$0.10</div>
                <div className="text-sm text-blue-100/60 mt-2">
                  Batch 1 pricing for early crew members.
                </div>
              </div>
              <div className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
                <div className="flex items-center gap-2 text-blue-50 font-medium">
                  <Moon className="w-4 h-4 text-cyan-200" />
                  Listing objective
                </div>
                <div className="text-4xl font-bold text-cyan-300 mt-3">$1.00</div>
                <div className="text-sm text-blue-100/60 mt-2">
                  Targeted Tier 1 exchange launch aligned to Artemis III.
                </div>
              </div>
              <div className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
                <div className="flex items-center gap-2 text-blue-50 font-medium">
                  <Lock className="w-4 h-4 text-cyan-200" />
                  Allocation threshold
                </div>
                <div className="text-4xl font-bold text-cyan-300 mt-3">$25</div>
                <div className="text-sm text-blue-100/60 mt-2">
                  Minimum contribution to enter the manifest.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}