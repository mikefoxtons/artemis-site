
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Moon, Radar, Activity, TimerReset, ShieldCheck, Users, Satellite, ChevronRight, Wallet, Zap, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Mission Status', value: 'ASCENDING', sub: 'All systems nominal', icon: Rocket },
  { label: 'Target', value: 'THE MOON', sub: 'Literal mission narrative', icon: Moon },
  { label: 'Crew', value: '214,672', sub: 'Astronaut holders', icon: Users },
  { label: 'Signal', value: 'STRONG', sub: 'Community transmission live', icon: Radar },
];

const flightCards = [
  { title: 'Altitude', value: '$42.8M', caption: 'Current market cap altitude', progress: 42 },
  { title: 'Lunar Velocity', value: '+18.4%', caption: '24 hour thrust', progress: 68 },
  { title: 'Fuel Reserves', value: '$3.2M', caption: 'Mission treasury', progress: 57 },
  { title: 'Countdown', value: 'T-287', caption: 'Days to next mission window (Artemis III)', progress: 81 },
];

const missionTimeline = [
  {
    phase: 'PRESALE — IGNITION',
    date: 'Start: Q4 2026',
    description: 'Presale opens. Early crew boarding. Initial liquidity preparation and mission awareness campaign.',
    status: 'Upcoming',
  },
  {
    phase: 'PRESALE — FUELING COMPLETE',
    date: 'End: Q1 2027',
    description: 'Presale closes. Liquidity fully provisioned. Final crew manifest locked before launch phase.',
    status: 'Locked',
  },
  {
    phase: 'ARTEMIS III — MOON MISSION',
    date: 'Target: Sept 2027 (NASA)',
    description: 'Coin launch aligns with Artemis III lunar mission. Target: Tier 1 exchange listing at global peak attention.',
    status: 'Primary Event',
  },
  {
    phase: 'ARTEMIS IV — BASE EXPANSION',
    date: 'Target: 2028',
    description: 'Post-launch expansion, DAO activation, ecosystem buildout and long-term mission sustainability.',
    status: 'Locked',
  },
];

const telemetry = [
  { label: 'Launch Sequence', value: 'Green' },
  { label: 'Orbital Stability', value: 'Nominal' },
  { label: 'Crew Morale', value: 'Max' },
  { label: 'Moon Probability', value: 'Inevitable' },
];

const ctaCards = [
  {
    eyebrow: 'Primary action',
    title: 'Board the mission',
    text: 'Secure your allocation before the presale window closes and the crew manifest is locked.',
    button: 'Board Presale Now',
    icon: Rocket,
  },
  {
    eyebrow: 'Wallet ready',
    title: 'Connect and fuel up',
    text: 'A crypto-native entry point for buyers ready to connect wallet, review terms and deploy capital fast.',
    button: 'Connect Wallet',
    icon: Wallet,
  },
  {
    eyebrow: 'Fast-track route',
    title: 'Enter launch sequence',
    text: 'A high-visibility CTA built to feel immediate, premium and unmistakably Web3.',
    button: 'Enter Launch Sequence',
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
  const base = 'inline-flex items-center justify-center transition-all duration-200 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 text-white hover:from-blue-400 hover:via-sky-300 hover:to-cyan-200',
    outline: 'border border-blue-400/30 bg-blue-500/5 text-blue-100 hover:bg-blue-500/10',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ className = '', children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = '', children }) {
  return <div className={className}>{children}</div>;
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(PRESALE_END_DATE));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const countdownBlocks = useMemo(() => ([
    { label: 'Days', value: String(timeRemaining.days).padStart(2, '0') },
    { label: 'Hours', value: String(timeRemaining.hours).padStart(2, '0') },
    { label: 'Minutes', value: String(timeRemaining.minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(timeRemaining.seconds).padStart(2, '0') },
  ]), [timeRemaining]);
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.45),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(147,197,253,0.25),transparent_35%)]" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 0.7px, transparent 0.7px)', backgroundSize: '28px 28px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">

        {/* HERO + DASHBOARD */}
        <section className="grid lg:grid-cols-2 gap-10 items-center pt-16 pb-12">

          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200 mb-5">
              <Satellite className="w-4 h-4" />
              Lunar mission in progress
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight">
              The coin
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-400 to-sky-300">
                built to go to the Moon.
              </span>
            </h1>

            <p className="mt-6 text-lg text-blue-100/70 max-w-2xl leading-8">
              Every milestone aligns with real-world space missions. Presale fuels the rocket. Artemis III is the launch moment.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="rounded-2xl h-14 px-7 text-base font-semibold bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 text-white shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:from-blue-400 hover:via-sky-300 hover:to-cyan-200">
                <Rocket className="w-4 h-4 mr-2" />
                Board Presale Now
              </Button>
              <Button variant="outline" className="rounded-2xl h-14 px-7 text-base font-semibold border-blue-400/30 bg-blue-500/5 text-blue-100 hover:bg-blue-500/10">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>

            <div className="mt-8 rounded-[2rem] border border-blue-400/20 bg-blue-500/5 backdrop-blur-xl p-5 md:p-6 max-w-2xl">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-blue-200/45">Live countdown</div>
                  <div className="text-2xl md:text-3xl font-semibold text-blue-50 mt-2">Presale ends 31 March 2027</div>
                </div>
                <div className="rounded-full border border-blue-400/20 bg-black/30 px-4 py-2 text-sm text-blue-100/75">
                  {timeRemaining.complete ? 'Presale complete' : 'Final boarding in progress'}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {countdownBlocks.map((block) => (
                  <div key={block.label} className="rounded-3xl border border-blue-400/20 bg-black/35 p-4 text-center">
                    <div className="text-3xl md:text-4xl font-semibold text-blue-50">{block.value}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45 mt-2">{block.label}</div>
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

                <div className="absolute bottom-4 left-4 right-4">

                  <div className="rounded-3xl border border-blue-400/20 bg-black/50 p-5">

                    <div className="text-xs text-blue-200/60 uppercase tracking-widest">Altitude Tracker</div>
                    <div className="text-2xl mt-2">Mission Milestones</div>

                    <div className="mt-4 space-y-4">

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Presale Start — Q4 2026</span>
                          <span>Fueling</span>
                        </div>
                        <Progress value={10} className="bg-blue-900/40" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Presale End — Q1 2027</span>
                          <span>Ready</span>
                        </div>
                        <Progress value={25} className="bg-blue-900/40" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Artemis III — Sept 2027</span>
                          <span>Launch Event</span>
                        </div>
                        <Progress value={50} className="bg-blue-900/40" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-blue-100/70 mb-1">
                          <span>Moon Landing Target</span>
                          <span>$1B+</span>
                        </div>
                        <Progress value={4} className="bg-blue-900/40" />
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ROADMAP */}
        <section className="py-4">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch mb-6">
            <div className="rounded-[2rem] border border-cyan-300/25 bg-gradient-to-br from-blue-500/15 via-sky-400/10 to-cyan-300/15 p-6 md:p-8 shadow-[0_0_60px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/55">Mission call to action</div>
                  <div className="text-3xl md:text-4xl font-semibold mt-2 text-blue-50">Board the crew before the hatch seals.</div>
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-black/25 px-4 py-2 text-sm text-cyan-100/80">
                  Presale boarding active
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                {ctaCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="rounded-3xl border border-cyan-300/20 bg-black/30 p-5">
                      <div className="w-11 h-11 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-cyan-200" />
                      </div>
                      <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/45">{card.eyebrow}</div>
                      <div className="text-xl font-semibold text-blue-50 mt-2">{card.title}</div>
                      <div className="text-blue-100/65 mt-3 leading-7 text-sm">{card.text}</div>
                      <Button className="w-full mt-5 rounded-2xl h-12 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 text-white hover:from-blue-400 hover:via-sky-300 hover:to-cyan-200">
                        {card.button}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-400/20 bg-black/35 backdrop-blur-xl p-6 md:p-8">
              <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Crypto buy module</div>
              <div className="text-3xl font-semibold mt-2 text-blue-50">Launch-ready buy now panel.</div>
              <div className="text-blue-100/65 mt-3 leading-7">This is the style of CTA that should repeat throughout the site: direct, high-contrast and built like a premium token sale interface.</div>

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
                      <div className="text-blue-50 font-medium mt-1">Crew manifest open</div>
                    </div>
                    <Zap className="w-5 h-5 text-cyan-200" />
                  </div>
                </div>

                <Button className="w-full mt-5 rounded-2xl h-14 text-base font-semibold bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 text-white shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:from-blue-400 hover:via-sky-300 hover:to-cyan-200">
                  Buy $ARTM Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  {[
                    ['Crew Boarding', 'Open'],
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
            <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Launch alignment panel</div>
            <div className="text-3xl md:text-4xl font-semibold mt-2 text-blue-50">Artemis Coin launches into the biggest moon narrative on Earth.</div>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">Global event</div>
                <div className="text-2xl font-semibold text-blue-50 mt-2">Artemis III lunar mission</div>
                <div className="text-blue-100/65 mt-2 leading-7">NASA’s crewed return-to-the-Moon mission provides a real-world attention anchor for the project’s biggest public moment.</div>
              </div>
              <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-blue-200/45">Coin strategy</div>
                <div className="text-2xl font-semibold text-blue-50 mt-2">Tier 1 exchange launch</div>
                <div className="text-blue-100/65 mt-2 leading-7">Presale closes on 31 March 2027. The launch campaign builds toward Artemis III, where the coin targets maximum narrative alignment and global visibility.</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
              {[
                ['Presale Start', 'Q4 2026'],
                ['Presale End', '31 March 2027'],
                ['Launch Trigger', 'Artemis III'],
                ['Exchange Goal', 'Top-tier listing'],
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
          <h2 className="text-3xl md:text-5xl font-semibold mt-2 text-blue-50">Mission aligned with real-world space timeline.</h2>

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

        {/* PRICING MODEL */}
        <section className="py-12">
          <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Pricing Model</div>
          <h2 className="text-3xl md:text-5xl font-semibold mt-2 text-blue-50">Presale structure & raise target</h2>

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6">
              <div className="text-xl font-semibold text-blue-50">Raise Target</div>
              <div className="text-4xl font-bold mt-2 text-cyan-300">$10,000,000</div>
              <div className="text-blue-100/60 mt-3">Structured presale designed to build momentum into a major exchange launch event aligned with Artemis III.</div>
            </div>

            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6">
              <div className="text-xl font-semibold text-blue-50">Listing Price</div>
              <div className="text-4xl font-bold mt-2 text-cyan-300">$1.00</div>
              <div className="text-blue-100/60 mt-3">Targeted Tier 1 exchange listing aligned with peak global attention during Artemis III.</div>
            </div>

          </div>

          <div className="rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-sky-400/10 p-6 mt-6">
            <div className="text-xl font-semibold text-blue-50">Presale Batches</div>

            <div className="space-y-4 mt-4">
              {[
                ['Batch 1', '$0.10'],
                ['Batch 2', '$0.25'],
                ['Batch 3', '$0.50'],
                ['Final Batch', '$0.75'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="text-blue-100/70">{label}</div>
                  <div className="text-blue-50 font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Entry Advantage</div>
              <div className="text-blue-50 font-semibold mt-2">Pre-Launch Positioning</div>
              <div className="text-blue-100/60 mt-2 text-sm">Access tokens before a major Tier 1 exchange listing aligned with a global event narrative.</div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Narrative Driver</div>
              <div className="text-blue-50 font-semibold mt-2">Artemis III</div>
              <div className="text-blue-100/60 mt-2 text-sm">Launch timing tied to one of the most anticipated global space missions in decades.</div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Market Behaviour</div>
              <div className="text-blue-50 font-semibold mt-2">High Volatility Potential</div>
              <div className="text-blue-100/60 mt-2 text-sm">Historically, major exchange launches can drive significant price discovery and rapid repricing phases.</div>
            </div>

          </div>

        </section>

        {/* TOKENOMICS */}
        <section className="py-12">
          <div className="text-sm uppercase tracking-[0.35em] text-blue-200/45">Tokenomics</div>
          <h2 className="text-3xl md:text-5xl font-semibold mt-2 text-blue-50">Mission supply structure</h2>

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/5 p-6">
              <div className="text-xl font-semibold text-blue-50">Total Supply</div>
              <div className="text-4xl font-bold mt-2 text-cyan-300">10,000,000 ARTM</div>
              <div className="text-blue-100/60 mt-3">Fixed supply. No inflation. Designed for scarcity and strong narrative-driven demand.</div>
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
              <div className="text-blue-100/60 mt-2 text-sm">Liquidity locked post-launch to ensure trust and stability during initial trading phase.</div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Team Tokens</div>
              <div className="text-blue-50 font-semibold mt-2">Vested</div>
              <div className="text-blue-100/60 mt-2 text-sm">Team allocation subject to vesting schedule aligned with long-term mission success.</div>
            </div>

            <div className="rounded-3xl border border-blue-400/20 bg-black/30 p-5">
              <div className="text-blue-200/45 text-xs uppercase">Treasury</div>
              <div className="text-blue-50 font-semibold mt-2">Mission Fund</div>
              <div className="text-blue-100/60 mt-2 text-sm">Used for future listings, partnerships and ecosystem expansion post Artemis III launch.</div>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
