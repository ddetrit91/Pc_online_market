import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/images/products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const items = [
  // MOTHERBOARDS
  {
    slug: 'asus-rog-strix-b650e-f',
    ext: 'png',
    url: 'https://dlcdnwebimgs.asus.com/gain/566A4DF8-85E5-4958-9CEE-21F4629E53AB/w1000/h732'
  },
  {
    slug: 'msi-pro-b650m-a-wifi',
    ext: 'webp',
    url: 'https://storage-asset.msi.com/global/picture/product/product_1664782100d10ef26fe3fc5c4c436cc139db200c1c.webp'
  },
  {
    slug: 'msi-mag-b760-tomahawk-wifi',
    ext: 'webp',
    url: 'https://storage-asset.msi.com/global/picture/product/product_1672736676dea7397b0c279e18d4b9ff67bba7f4ec.webp'
  },
  {
    slug: 'asus-prime-b760m-k-d4',
    ext: 'png',
    url: 'https://dlcdnwebimgs.asus.com/gain/810f7dbd-6923-41ef-8fba-e9b8916b2894/w692'
  },
  {
    slug: 'gigabyte-b550m-ds3h',
    ext: 'png',
    url: 'https://static.gigabyte.com/StaticFile/Image/Global/f71d1908a477e0c6e66135c54dbd255f/ProductRemoveBg/25219'
  },

  // GPUS
  {
    slug: 'nvidia-geforce-rtx-4090-24gb',
    ext: 'png',
    url: 'https://dlcdnwebimgs.asus.com/gain/EFF9D6D8-2F6C-4E76-989F-E5DB594052BA/w1000/h732'
  },
  {
    slug: 'nvidia-geforce-rtx-4080-super-16gb',
    ext: 'webp',
    url: 'https://storage-asset.msi.com/global/picture/product/product_17047017992412b3cf6a0f603661cbab5fb5a7f44a.webp'
  },
  {
    slug: 'nvidia-geforce-rtx-4070-ti-super-16gb',
    ext: 'png',
    url: 'https://static.gigabyte.com/StaticFile/Image/Global/88366f8b8e43ca0066a14728a35e5d28/ProductRemoveBg/39125'
  },
  {
    slug: 'nvidia-geforce-rtx-4070-super-12gb',
    ext: 'png',
    url: 'https://www.palit.com/product/vga/picture/p04997/p04997_propng_862658bb54bc6881.png'
  },
  {
    slug: 'nvidia-geforce-rtx-4060-ti-8gb',
    ext: 'png',
    url: 'https://dlcdnwebimgs.asus.com/gain/faa50a4f-abbc-488c-9ec1-d55db587d653/w800'
  },
  {
    slug: 'amd-radeon-rx-7800-xt-16gb',
    ext: 'png',
    url: 'https://media.cdn.sapphiretech.com.cn/-/media/sites/sapphire/pim/product-images/11330_03_rx7800xt_pure_16ggddr6/11330_03_rx7800xt_pure_16gbgddr6_fbc_amd_374x265.ashx?v=05aafcdf715d4a4391cf55bd92b3ca1f'
  },

  // RAM
  {
    slug: 'kingston-fury-beast-32gb-ddr5-6000',
    ext: 'png',
    url: 'https://media.kingston.com/europe/press-release/2022/Kingston-FURY-Beast-DDR5-RGB-IMAGE-Press-release.png'
  },
  {
    slug: 'gskill-trident-z5-rgb-32gb-ddr5-6400',
    ext: 'jpg',
    url: 'https://www.techpowerup.com/review/g-skill-trident-z5-ddr5-6800-cl34-2x-16-gb/images/2dimm.jpg'
  },
  {
    slug: 'corsair-vengeance-lpx-32gb-ddr4-3200',
    ext: 'webp',
    url: 'https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Memory/CMK16GX4M2B3200C16/Gallery/VENG_LPX_BLK_00.webp'
  },
  {
    slug: 'kingston-fury-beast-16gb-ddr4-3200',
    ext: 'png',
    url: 'https://media.kingston.com/europe/press-release/2022/Kingston-FURY-Beast-DDR5-RGB-IMAGE-Press-release.png'
  },

  // STORAGE
  {
    slug: 'samsung-990-pro-2tb-nvme',
    ext: 'png',
    url: 'https://images.samsung.com/is/image/samsung/p6pim/sg/mz-v9p1t0bw/gallery/sg-990pro-nvme-m2-ssd-mz-v9p1t0bw-533720687?$1164_776_PNG$'
  },
  {
    slug: 'kingston-kc3000-1tb-nvme',
    ext: 'jpg',
    url: 'https://media.kingston.com/kingston/press/ktc-press-kc3000.jpg'
  },
  {
    slug: 'kingston-nv2-1tb-nvme',
    ext: 'jpg',
    url: 'https://media.kingston.com/kingston/press/ktc-press-fe-nv2-ssd.jpg'
  },

  // POWER SUPPLIES
  {
    slug: 'deepcool-pq850m-850w-gold',
    ext: 'jpg',
    url: 'https://cdn.deepcool.com/public/ProductFile/DEEPCOOL/PowerSupplyUnits/PQ850M/Gallery/800X800/01.jpg'
  },
  {
    slug: 'corsair-rm750e-750w-gold',
    ext: 'webp',
    url: 'https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/rme-series-2025/Gallery/CP-9020295-NA_01.webp'
  },
  {
    slug: 'deepcool-pk650d-650w-bronze',
    ext: 'jpg',
    url: 'https://cdn.deepcool.com/public/ProductFile/DEEPCOOL/PowerSupplyUnits/PK650D/Gallery/800X800/01.jpg'
  },

  // CASES
  {
    slug: 'lian-li-o11-dynamic-evo-black',
    ext: 'jpg',
    url: 'https://lian-li.com/wp-content/uploads/2021/12/evo-600-000.jpg'
  },
  {
    slug: 'nzxt-h5-flow-white',
    ext: 'png',
    url: 'https://nzxt.com/cdn/shop/files/h5-flow-rgb_white_01_hero.png?v=1789351745&width=800'
  },
  {
    slug: 'deepcool-cc560-v2-black',
    ext: 'jpg',
    url: 'https://cdn.deepcool.com/public/ProductFile/DEEPCOOL/Cases/CC560_V2/Gallery/800X800/01.jpg'
  },
  {
    slug: 'jonsbo-c6-white-matx',
    ext: 'webp',
    url: 'https://www.jonsbo.com/Upfiles/Prod_X/202511657722.webp'
  },

  // COOLERS
  {
    slug: 'deepcool-ak620-digital',
    ext: 'jpg',
    url: 'https://cdn.deepcool.com/public/ProductFile/DEEPCOOL/Cooling/CPUAirCoolers/AK620_DIGITAL/Gallery/800X800/01.jpg'
  },
  {
    slug: 'thermalright-peerless-assassin-120-se-argb',
    ext: 'png',
    url: 'https://www.thermalright.com/wp-content/uploads/2026/08/peerless-assassin-120-se-argb.png'
  },
  {
    slug: 'deepcool-ag400-argb',
    ext: 'jpg',
    url: 'https://cdn.deepcool.com/public/ProductFile/DEEPCOOL/Cooling/CPUAirCoolers/AG400_BK_ARGB/Gallery/800X800/01.jpg'
  },
  {
    slug: 'nzxt-kraken-elite-360-rgb',
    ext: 'png',
    url: 'https://nzxt.com/cdn/shop/files/ke360rgb-v2_white_01_hero.png?v=1789335594'
  }
];

async function run() {
  console.log(`Starting download of ${items.length} product images...`);
  for (const item of items) {
    const dest = path.join(outDir, `${item.slug}.${item.ext}`);
    try {
      console.log(`Fetching ${item.slug}...`);
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) {
        console.error(`Failed ${item.slug}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(` Saved ${item.slug}.${item.ext} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Error downloading ${item.slug}:`, err.message);
    }
  }
  console.log('Finished downloads.');
}

run();
