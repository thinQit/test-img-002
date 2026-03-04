import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lenslight.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me';
  const passwordHash = await hashPassword(adminPassword);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash }
  });

  await prisma.siteContent.upsert({
    where: { id: 'default' },
    update: {
      heroTitle: 'Illuminate stories through light, texture, and emotion.',
      heroImageUrl: '/images/hero.jpg',
      aboutHtml:
        '<p>LensLight blends documentary storytelling with fine-art sensibilities. Each frame is crafted to feel timeless and intimate.</p><p>With experience in portraiture, brand storytelling, and editorial work, LensLight delivers visuals that elevate brands and preserve meaningful milestones.</p>',
      metaTitle: 'LensLight Photography',
      metaDescription: 'A modern photography portfolio and booking experience.'
    },
    create: {
      id: 'default',
      heroTitle: 'Illuminate stories through light, texture, and emotion.',
      heroImageUrl: '/images/hero.jpg',
      aboutHtml:
        '<p>LensLight blends documentary storytelling with fine-art sensibilities. Each frame is crafted to feel timeless and intimate.</p><p>With experience in portraiture, brand storytelling, and editorial work, LensLight delivers visuals that elevate brands and preserve meaningful milestones.</p>',
      metaTitle: 'LensLight Photography',
      metaDescription: 'A modern photography portfolio and booking experience.'
    }
  });

  const existingPhotos = await prisma.photo.count();
  if (existingPhotos === 0) {
    const samples = [
      {
        title: 'Golden Hour Portrait',
        caption: 'Soft light and cinematic tones for editorial portraits.',
        url: '/images/feature.jpg',
        thumbnailUrl: '/images/feature.jpg',
        tags: JSON.stringify(['portrait', 'editorial']),
        published: true
      },
      {
        title: 'Coastal Storytelling',
        caption: 'A lifestyle session captured along the shoreline.',
        url: '/images/hero.jpg',
        thumbnailUrl: '/images/hero.jpg',
        tags: JSON.stringify(['lifestyle', 'travel']),
        published: true
      },
      {
        title: 'Studio Editorial',
        caption: 'Moody lighting for a high-fashion campaign.',
        url: '/images/cta.jpg',
        thumbnailUrl: '/images/cta.jpg',
        tags: JSON.stringify(['studio', 'fashion']),
        published: true
      }
    ];

    for (const photo of samples) {
      await prisma.photo.create({ data: photo });
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
