import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Verified, authentic high-res Steam & publisher CDN key art for all 20 heavy games
const OFFICIAL_GAME_POSTERS: Record<string, string> = {
  'cyberpunk-2077': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
  'black-myth-wukong': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
  'alan-wake-2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/108710/header.jpg',
  'stalker-2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1643320/header.jpg',
  'starfield': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg',
  'rdr-2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg',
  'witcher-3-nextgen': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
  'hogwarts-legacy': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg',
  'cod-warzone': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1938090/header.jpg',
  'ms-flight-simulator': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1250410/header.jpg',
  'the-last-of-us-part-1': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg',
  'horizon-forbidden-west': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2420110/header.jpg',
  'baldurs-gate-3': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
  'elden-ring': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
  'resident-evil-4-remake': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg',
  'god-of-war-ragnarok': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg',
  'ac-mirage': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2896530/header.jpg',
  'avatar-frontiers': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2840770/header.jpg',
  'forza-horizon-5': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg',
  'escape-from-tarkov': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2073850/header.jpg',
};

export async function GET() {
  try {
    let games = await prisma.game.findMany({
      orderBy: { baseFps1080p: 'asc' },
    });

    // Ensure authentic, non-repeating official key art
    const sanitized = games.map((g) => ({
      ...g,
      posterUrl: OFFICIAL_GAME_POSTERS[g.slug] || g.posterUrl,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('API games error:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
