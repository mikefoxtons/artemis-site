'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Wallet, Zap, ArrowRight, Satellite } from 'lucide-react';

const missionTimeline = [
  {
    phase: 'PRESALE — IGNITION',
    date: 'Start: Q1 2026',
    description: 'Presale opens, early supporters board and initial momentum begins building.',
    status: 'Upcoming',
  },
  {
    phase: 'PRESALE — FINAL BOARDING',
    date: 'End: Q1 2027',
    description: 'Presale closes, final allocations are locked and launch preparation begins.',
    status: 'Locked',
  },
  {
    phase: 'ARTEMIS III — LAUNCH WINDOW',
    date: 'Target: Sept 2027 (NASA)',
    description: 'Project launch aligns with Artemis III to capture peak global attention around the Moon mission.',
    status: 'Primary Event',
  },
  {
    phase: 'ARTEMIS IV — EXPANSION',
    date: 'Target: 2028',
    description: 'Post-launch growth phase including partnerships, ecosystem expansion and community development.',
    status: 'Locked',
  },
];

const ctaCards = [
  {
    eyebrow: 'Primary action',
    title: 'Join the mission',
    text: 'Secure your allocation before the presale closes and the final crew list is locked.',
    button: 'Board Presale',
    icon: Rocket,
  },
  {
    eyebrow: 'Wallet ready',
    title: 'Connect your wallet',
    text: 'A fast crypto-native route for buyers ready to connect, review terms and purchase.',
    button: 'Connect Wallet',
    icon: Wallet,
  },
  {
    eyebrow: 'Fast entry',
    title: 'Enter launch sequence',
    text: 'A premium Web3 buying journey designed to feel immediate, simple and high-conviction.',
    button: 'Launch Now',
    icon: Zap,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const PRESALE_END_DATE = '2027-03-31T23:59:59Z';

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

function Button({ className = '', variant = 'default', children, ...props }) {
  const base =
    'inline-flex items-center justify-center transition-all duration-200 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default:
      'bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 text-white hover:from-blue-400 hover:via-sky-300 hover:to-cyan-200',
    outline:
      'border border-blue-400/30 bg-blue-500/5 text-blue-100 hover:bg-blue-500/10',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
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

export default function ArtemisLandingPage() {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(PRESALE_END_DATE));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(PRESALE_END_DATE));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const countdownBlocks = useMemo(
    () => [
      { label: 'Days', value: isMounted ? String(timeRemaining.days).padStart(2, '0') : '--' },
      { label: 'Hours', value: isMounted ? String(timeRemaining.hours).padStart(2, '0') : '--' },
      { label: 'Minutes', value: isMounted ? String(timeRemaining.minutes).padStart(2, '0') : '--' },
      { label: 'Seconds', value: isMounted ? String(timeRemaining.seconds).padStart(2, '0') : '--' },
    ],
    [timeRemaining, isMounted]
  );

  const goToPresale = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/presale';
    }
  };

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
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border border-blue-400/25 bg-blue-500/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold tracking-[0.18em] text-blue-50 uppercase">
                Artemis
              </div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-blue-200/45">
                Lunar memecoin mission
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={goToPresale}
            className="rounded-2xl h-11 px-5 text-sm font-semibold"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Buy $ARTM
          </Button>
        </header>

        <section className="grid lg:grid-cols-2 gap-10 items-center pt-12 pb-12">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200 mb-5">
              <Satellite className="w-4 h-4" />
              Mission countdown now live
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight">
              The coin
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-400 to-sky-300">
                built to go to the Moon.
              </span>
            </h1>

            <p className="mt-6 text-lg text-blue-100/70 max-w-2xl leading-8">
              When Artemis III lands on the Moon, Artemis lands on a Tier 1 exchange — because in crypto, that is the Moon.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                onClick={goToPresale}
                className="rounded-2xl h-14 px-7 text-base font-semibold shadow-[0_0_30px_rgba(59,130,246,0.35)]"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Board Presale Now
              </Button>

              <Button
                variant="outline"
                onClick={goToPresale}
                className="rounded-2xl h-14 px-7 text-base font-semibold"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>

            <div className="mt-8 rounded-[2rem] border border-blue-400/20 bg-blue-500/5 backdrop-blur-xl p-5 md:p-6 max-w-2xl">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-blue-200/45">Live countdown</div>
                  <div className="text-2xl md:text-3xl font-semibold text-blue-50 mt-2">
                    Presale ends 31 March 2027
                  </div>
                </div>
                <div className="rounded-full border border-blue-400/20 bg-black/30 px-4 py-2 text-sm text-blue-100/75">
                  {!isMounted
                    ? 'Syncing telemetry'
                    : timeRemaining.complete
                      ? 'Presale complete'
                      : 'Final boarding in progress'}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {countdownBlocks.map((block) => (
                  <div
                    key={block.label}
                    className="rounded-3xl border border-blue-400/20 bg-black/35 p-4 text-center"
                  >
                    <div className="text-3xl md:text-4xl font-semibold text-blue-50">{block.value}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45 mt-2">
                      {block.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="relative rounded-[2rem] border border-blue-400/20 bg-blue-500/5 backdrop-blur-2xl p-4 shadow-2xl shadow-blue-900/60">
              <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden relative border border-blue-400/20 bg-black">
                <img
                  src="https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?auto=format&fit=crop&w=1400&q=80"
                  alt="Moon and Earth from space"
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-blue-950/30 to-transparent" />

                <div className="absolute top-4 left-4 right-4">
                  <div className="rounded-3xl border border-blue-400/20 bg-black/50 p-3 backdrop-blur-md">
                    <div className="text-xs text-blue-200/60 uppercase tracking-widest">Mission Tracker</div>
                    <div className="text-xl mt-1 text-blue-50">Key Milestones</div>

                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Presale Start — Q1 2026</span>
                          <span>Ignition</span>
                        </div>
                        <Progress value={10} className="bg-blue-900/40" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Batch 1 Complete</span>
                          <span>Early Crew Filled</span>
                        </div>
                        <Progress value={35} className="bg-blue-900/40" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>75% Allocated</span>
                          <span>Mid Mission</span>
                        </div>
                        <Progress value={65} className="bg-blue-900/40" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Presale End — Q1 2027</span>
                          <span>Final Boarding</span>
                        </div>
                        <Progress value={90} className="bg-blue-900/40" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Artemis III — Sept 2027</span>
                          <span>Launch Window</span>
                        </div>
                        <Progress value={100} className="bg-blue-900/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-4">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch mb-6">
            <div className="rounded-[2rem] border border-cyan-300/25 bg-gradient-to-br from-blue-500/15 via-sky-400/10 to-cyan-300/15 p-6 md:p-8 shadow-[0_0_60px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/55">Mission call to action</div>
                  <div className="text-3xl md:text-4xl font-semibold mt-2 text-blue-50">
                    Join the crew before the hatch seals.
                  </div>
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-black/25 px-4 py-2 text-sm text-cyan-100/80">
                  Presale now open
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                {ctaCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="rounded-3xl border border-cyan-300/20 bg-black/30 p-5 flex flex-col h-full"
                    >
                      <div className="w-11 h-11 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-cyan-200" />
                      </div>
                      <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/45">{card.eyebrow}</div>
                      <div className="text-xl font-semibold text-blue-50 mt-2">{card.title}</div>
                      <div className="text-blue-100/65 mt-3 leading-7 text-sm">{card.text}</div>
                      <Button onClick={goToPresale} className="w-full mt-auto rounded-2xl h-12">
                        {card.button}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-400/20 bg-black/35 backdrop-blur-xl p-6 md:p-8">
              <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Buy module</div>
              <div className="text-3xl font-semibold mt-2 text-blue-50">Launch-ready purchase panel</div>
              <div className="text-blue-100/65 mt-3 leading-7">
                Launch interface. Connect, fuel up, and secure your allocation before final boarding closes.
              </div>

              <div className="mt-6 rounded-3xl border border-blue-400/20 bg-blue-500/5 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">Crew access</div>
                    <div className="text-xl font-semibold text-blue-50 mt-2">Buy $ARTM now</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
                    Wallet supported
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-blue-400/20 bg-black/30 px-4 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">Payment</div>
                      <div className="text-blue-50 font-medium mt-1">ETH / USDT / USDC</div>
                    </div>
                    <Wallet className="w-5 h-5 text-blue-200" />
                  </div>
                  <div className="rounded-2xl border border-blue-400/20 bg-black/30 px-4 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">Allocation status</div>
                      <div className="text-blue-50 font-medium mt-1">Presale open</div>
                    </div>
                    <Zap className="w-5 h-5 text-cyan-200" />
                  </div>
                </div>

                <Button
                  onClick={goToPresale}
                  className="w-full mt-5 rounded-2xl h-14 text-base font-semibold shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                >
                  Buy $ARTM Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  {[
                    ['Presale', 'Open'],
                    ['Min. Buy', '$250'],
                    ['Accepted', 'Crypto'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-blue-400/20 bg-black/25 px-3 py-3">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-blue-200/45">{label}</div>
                      <div className="text-sm font-semibold text-blue-50 mt-2">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-400/20 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-sky-300/10 p-6 md:p-8">
            <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Mission Alignment</div>
            <div className="text-3xl md:text-4xl font-semibold mt-2 text-blue-50">
              Artemis launches into the biggest Moon narrative on Earth.
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">Global event</div>
                <div className="text-2xl font-semibold text-blue-50 mt-2">Artemis III lunar mission</div>
                <div className="text-blue-100/65 mt-2 leading-7">
                  NASA’s return-to-the-Moon mission gives the project a real-world attention anchor for its biggest public moment.
                </div>
              </div>
              <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">Launch strategy</div>
                <div className="text-2xl font-semibold text-blue-50 mt-2">Tier 1 exchange ambition</div>
                <div className="text-blue-100/65 mt-2 leading-7">
                  Presale closes on 31 March 2027, with launch momentum designed to build into Artemis III and maximise visibility.
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
              {[
                ['Presale Start', 'Q1 2026'],
                ['Presale End', '31 March 2027'],
                ['Launch Trigger', 'Artemis III'],
                ['Exchange Goal', 'Tier 1 listing'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">{label}</div>
                  <div className="text-xl font-semibold text-blue-50 mt-2">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="py-12">
          <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Flight plan</div>
          <h2 className="text-3xl md:text-5xl font-semibold mt-2 text-blue-50">
            Built around a real-world space timeline.
          </h2>

          <div className="mt-8 space-y-4">
            {missionTimeline.map((item, index) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6"
              >
                <div className="text-blue-200/50 text-sm">{item.date}</div>
                <div className="text-xl font-semibold mt-2 text-blue-50">{item.phase}</div>
                <div className="text-blue-100/60 mt-2">{item.description}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Pricing Model</div>
          <h2 className="text-3xl md:text-5xl font-semibold mt-2 text-blue-50">Presale structure and raise target</h2>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6">
              <div className="text-xl font-semibold text-blue-50">Raise Target</div>
              <div className="text-4xl font-bold mt-2 text-cyan-300">$10,000,000</div>
              <div className="text-blue-100/60 mt-3">
                Structured to build momentum ahead of a major exchange launch aligned with Artemis III.
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6">
              <div className="text-xl font-semibold text-blue-50">Listing Price</div>
              <div className="text-4xl font-bold mt-2 text-cyan-300">$1.00</div>
              <div className="text-blue-100/60 mt-3">
                Targeted Tier 1 exchange launch during peak attention around the Moon mission.
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-sky-400/10 p-6 mt-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xl font-semibold text-blue-50">Presale Batches</div>
                <div className="text-blue-100/60 mt-1 text-sm">Structured supply by tranche to reward early boarding.</div>
              </div>
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-200">
                Batch pricing live
              </div>
            </div>

            <div className="space-y-4 mt-5">
              {[
                {
                  label: 'Batch 1',
                  price: '$0.10',
                  supply: '1.5M ARTM',
                  remaining: '90% remaining',
                  progress: 90,
                  badge: 'Current Batch',
                  highlight: true,
                  kicker: 'Best entry point',
                },
                {
                  label: 'Batch 2',
                  price: '$0.25',
                  supply: '1.5M ARTM',
                  remaining: 'Next price +150%',
                  progress: 0,
                  badge: 'Next Up',
                  highlight: false,
                  kicker: 'Price step increase',
                },
                {
                  label: 'Batch 3',
                  price: '$0.50',
                  supply: '1.0M ARTM',
                  remaining: 'Mid-mission tranche',
                  progress: 0,
                  badge: '',
                  highlight: false,
                  kicker: 'Reduced supply',
                },
                {
                  label: 'Final Batch',
                  price: '$0.75',
                  supply: '1.0M ARTM',
                  remaining: 'Final boarding',
                  progress: 0,
                  badge: '',
                  highlight: false,
                  kicker: 'Last presale price',
                },
              ].map((batch) => (
                <div
                  key={batch.label}
                  className={`rounded-2xl px-4 py-4 ${
                    batch.highlight
                      ? 'border border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_35px_rgba(34,211,238,0.18)]'
                      : 'border border-blue-400/20 bg-black/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">{batch.label}</div>
                        {batch.badge ? (
                          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
                            {batch.badge}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-blue-50 font-semibold mt-1 text-lg">{batch.price}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-blue-100/45 mt-1">{batch.kicker}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-blue-100/75">{batch.supply}</div>
                      <div className={`text-xs uppercase tracking-[0.2em] mt-1 ${batch.highlight ? 'text-cyan-200' : 'text-blue-200/55'}`}>
                        {batch.remaining}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-blue-200/45 mb-2">
                      <span>Allocation status</span>
                      <span>{batch.progress}%</span>
                    </div>
                    <Progress value={batch.progress} className={batch.highlight ? 'bg-cyan-950/40' : 'bg-blue-900/40'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Entry Advantage</div>
              <div className="text-blue-50 font-semibold mt-2">Pre-launch position</div>
              <div className="text-blue-100/60 mt-2 text-sm">
                Secure tokens before a potential Tier 1 exchange listing aligned with a major global narrative.
              </div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Narrative Driver</div>
              <div className="text-blue-50 font-semibold mt-2">Artemis III</div>
              <div className="text-blue-100/60 mt-2 text-sm">
                Launch timing is built around one of the most anticipated space missions in decades.
              </div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Market Behaviour</div>
              <div className="text-blue-50 font-semibold mt-2">Price discovery potential</div>
              <div className="text-blue-100/60 mt-2 text-sm">
                Major exchange launches often create sharp repricing and significant early volatility.
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Tokenomics</div>
          <h2 className="text-3xl md:text-5xl font-semibold mt-2 text-blue-50">Mission supply structure</h2>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6">
              <div className="text-xl font-semibold text-blue-50">Total Supply</div>
              <div className="text-4xl font-bold mt-2 text-cyan-300">10,000,000 ARTM</div>
              <div className="text-blue-100/60 mt-3">
                Fixed supply with no inflation, designed around scarcity and narrative-driven demand.
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6">
              <div className="text-xl font-semibold text-blue-50">Allocation</div>
              <div className="space-y-4 mt-4">
                {[
                  ['Presale', '50%'],
                  ['Liquidity', '20%'],
                  ['Marketing', '10%'],
                  ['Ecosystem / Rewards', '10%'],
                  ['Team (Vested)', '5%'],
                  ['Reserve / Treasury', '5%'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="text-blue-100/70">{label}</div>
                    <div className="text-blue-50 font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Liquidity</div>
              <div className="text-blue-50 font-semibold mt-2">Locked</div>
              <div className="text-blue-100/60 mt-2 text-sm">
                Liquidity is locked post-launch to support trust and stability in the initial trading phase.
              </div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Team Tokens</div>
              <div className="text-blue-50 font-semibold mt-2">Vested</div>
              <div className="text-blue-100/60 mt-2 text-sm">
                Team allocation follows a vesting schedule aligned with long-term project execution.
              </div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Treasury</div>
              <div className="text-blue-50 font-semibold mt-2">Mission Fund</div>
              <div className="text-blue-100/60 mt-2 text-sm">
                Reserved for listings, partnerships and ecosystem expansion after launch.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
