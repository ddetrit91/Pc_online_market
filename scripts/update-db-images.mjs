import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageMap = {
  // CPUs
  'amd-ryzen-7-7800x3d': '/images/products/amd-ryzen-7-7800x3d.jpg',
  'amd-ryzen-5-7600x': '/images/products/amd-ryzen-5-7600x.jpg',
  'intel-core-i7-14700k': '/images/products/intel-core-i7-14700k.jpg',
  'intel-core-i5-13400f': '/images/products/intel-core-i5-13400f.jpg',
  'amd-ryzen-5-5600': '/images/products/amd-ryzen-5-5600.jpg',

  // Motherboards
  'asus-rog-strix-b650e-f': '/images/products/asus-rog-strix-b650e-f.png',
  'msi-pro-b650m-a-wifi': '/images/products/msi-pro-b650m-a-wifi.webp',
  'msi-mag-b760-tomahawk-wifi': '/images/products/msi-mag-b760-tomahawk-wifi.webp',
  'asus-prime-b760m-k-d4': '/images/products/asus-prime-b760m-k-d4.png',
  'gigabyte-b550m-ds3h': '/images/products/gigabyte-b550m-ds3h.png',

  // GPUs
  'nvidia-geforce-rtx-4090-24gb': '/images/products/nvidia-geforce-rtx-4090-24gb.png',
  'nvidia-geforce-rtx-4080-super-16gb': '/images/products/nvidia-geforce-rtx-4080-super-16gb.webp',
  'nvidia-geforce-rtx-4070-ti-super-16gb': '/images/products/nvidia-geforce-rtx-4070-ti-super-16gb.png',
  'nvidia-geforce-rtx-4070-super-12gb': '/images/products/nvidia-geforce-rtx-4070-super-12gb.png',
  'nvidia-geforce-rtx-4060-ti-8gb': '/images/products/nvidia-geforce-rtx-4060-ti-8gb.png',
  'amd-radeon-rx-7800-xt-16gb': '/images/products/amd-radeon-rx-7800-xt-16gb.png',

  // RAM
  'kingston-fury-beast-32gb-ddr5-6000': '/images/products/kingston-fury-beast-32gb-ddr5-6000.png',
  'gskill-trident-z5-rgb-32gb-ddr5-6400': '/images/products/gskill-trident-z5-rgb-32gb-ddr5-6400.jpg',
  'corsair-vengeance-lpx-32gb-ddr4-3200': '/images/products/corsair-vengeance-lpx-32gb-ddr4-3200.webp',
  'kingston-fury-beast-16gb-ddr4-3200': '/images/products/kingston-fury-beast-16gb-ddr4-3200.png',

  // Storage
  'samsung-990-pro-2tb-nvme': '/images/products/samsung-990-pro-2tb-nvme.png',
  'kingston-kc3000-1tb-nvme': '/images/products/kingston-kc3000-1tb-nvme.jpg',
  'kingston-nv2-1tb-nvme': '/images/products/kingston-nv2-1tb-nvme.jpg',

  // PSU
  'seasonic-vertex-gx-1000-gold': '/images/products/seasonic-vertex-gx-1000-gold.jpg',
  'deepcool-pq850m-850w-gold': '/images/products/deepcool-pq850m-850w-gold.jpg',
  'corsair-rm750e-750w-gold': '/images/products/corsair-rm750e-750w-gold.webp',
  'deepcool-pk650d-650w-bronze': '/images/products/deepcool-pk650d-650w-bronze.jpg',

  // Cases
  'lian-li-o11-dynamic-evo-black': '/images/products/lian-li-o11-dynamic-evo-black.jpg',
  'nzxt-h5-flow-white': '/images/products/nzxt-h5-flow-white.png',
  'deepcool-cc560-v2-black': '/images/products/deepcool-cc560-v2-black.jpg',
  'jonsbo-c6-white-matx': '/images/products/jonsbo-c6-white-matx.webp',

  // Coolers
  'deepcool-ak620-digital': '/images/products/deepcool-ak620-digital.jpg',
  'thermalright-peerless-assassin-120-se-argb': '/images/products/thermalright-peerless-assassin-120-se-argb.png',
  'deepcool-ag400-argb': '/images/products/deepcool-ag400-argb.jpg',
  'nzxt-kraken-elite-360-rgb': '/images/products/nzxt-kraken-elite-360-rgb.png',
};

async function main() {
  console.log('Updating product image URLs in Neon PostgreSQL database...');
  let updatedCount = 0;
  for (const [slug, imageUrl] of Object.entries(imageMap)) {
    const res = await prisma.product.updateMany({
      where: { slug },
      data: { imageUrl }
    });
    if (res.count > 0) {
      console.log(`Updated ${slug} -> ${imageUrl}`);
      updatedCount += res.count;
    } else {
      console.warn(`Product not found with slug: ${slug}`);
    }
  }
  console.log(`Successfully updated ${updatedCount} products in database!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
