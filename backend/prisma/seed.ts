import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GlobeTrotter database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: {},
    create: {
      email: 'admin@globetrotter.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      city: 'Ahmedabad',
      country: 'India',
    },
  });

  // Seed Cities
  const citiesData = [
    { name: 'Paris', country: 'France', popularity: 98, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
    { name: 'Tokyo', country: 'Japan', popularity: 95, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
    { name: 'New York', country: 'USA', popularity: 92, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
    { name: 'Rome', country: 'Italy', popularity: 90, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
    { name: 'Barcelona', country: 'Spain', popularity: 88, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4' },
    { name: 'London', country: 'UK', popularity: 94, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad' },
    { name: 'Dubai', country: 'UAE', popularity: 87, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c' },
    { name: 'Singapore', country: 'Singapore', popularity: 85, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd' },
    { name: 'Sydney', country: 'Australia', popularity: 83, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' },
    { name: 'Amsterdam', country: 'Netherlands', popularity: 86, image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4' },
  ];

  const citiesMap: Record<string, string> = {};
  for (const c of citiesData) {
    const existing = await prisma.city.findFirst({ where: { name: c.name } });
    if (existing) {
      citiesMap[c.name] = existing.id;
    } else {
      const created = await prisma.city.create({ data: c });
      citiesMap[c.name] = created.id;
    }
  }

  // Seed Activities
  const activitiesData = [
    // Paris
    { city: 'Paris', name: 'Eiffel Tower Summit Tour', category: 'CULTURE' as const, estimatedCost: 35 },
    { city: 'Paris', name: 'Louvre Museum Guided Walk', category: 'CULTURE' as const, estimatedCost: 25 },
    { city: 'Paris', name: 'Seine River Sunset Cruise', category: 'NATURE' as const, estimatedCost: 20 },
    { city: 'Paris', name: 'French Pastry & Croissant Tasting', category: 'FOOD' as const, estimatedCost: 45 },

    // Tokyo
    { city: 'Tokyo', name: 'Shibuya Crossing & Harajuku Tour', category: 'CULTURE' as const, estimatedCost: 15 },
    { city: 'Tokyo', name: 'Tsukiji Outer Market Food Tour', category: 'FOOD' as const, estimatedCost: 60 },
    { city: 'Tokyo', name: 'Mount Fuji Day Trip', category: 'ADVENTURE' as const, estimatedCost: 90 },

    // New York
    { city: 'New York', name: 'Statue of Liberty Ferry Tour', category: 'CULTURE' as const, estimatedCost: 30 },
    { city: 'New York', name: 'Central Park Bike Rental', category: 'NATURE' as const, estimatedCost: 20 },
    { city: 'New York', name: 'Broadway Show Experience', category: 'CULTURE' as const, estimatedCost: 120 },

    // Rome
    { city: 'Rome', name: 'Colosseum & Roman Forum Tour', category: 'CULTURE' as const, estimatedCost: 40 },
    { city: 'Rome', name: 'Vatican Museums & Sistine Chapel', category: 'CULTURE' as const, estimatedCost: 35 },
    { city: 'Rome', name: 'Authentic Pasta Making Class', category: 'FOOD' as const, estimatedCost: 75 },

    // Dubai
    { city: 'Dubai', name: 'Burj Khalifa At The Top Ticket', category: 'CULTURE' as const, estimatedCost: 50 },
    { city: 'Dubai', name: 'Desert Safari with Dune Bashing', category: 'ADVENTURE' as const, estimatedCost: 80 },
  ];

  for (const act of activitiesData) {
    const cityId = citiesMap[act.city];
    if (cityId) {
      const existing = await prisma.activity.findFirst({
        where: { name: act.name, cityId },
      });
      if (!existing) {
        await prisma.activity.create({
          data: {
            name: act.name,
            category: act.category,
            estimatedCost: act.estimatedCost,
            cityId,
          },
        });
      }
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
