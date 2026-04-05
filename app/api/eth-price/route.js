import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        headers: {
          accept: 'application/json',
        },
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko request failed: ${response.status}`);
    }

    const data = await response.json();
    const ethUsd = data?.ethereum?.usd;

    if (typeof ethUsd !== 'number') {
      throw new Error('Invalid ETH price payload');
    }

    return NextResponse.json({ ethUsd });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch ETH price',
      },
      { status: 500 }
    );
  }
}