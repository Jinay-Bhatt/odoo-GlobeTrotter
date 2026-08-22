import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GlobeTrotter database...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@globetrotter.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      city: 'Ahmedabad',
      country: 'India',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
  });

  // 2. Create Normal Traveler User
  const userPassword = await bcrypt.hash('User@123456', 12);
  const traveler = await prisma.user.upsert({
    where: { email: 'user@globetrotter.com' },
    update: {
      password: userPassword,
      role: 'TRAVELER',
    },
    create: {
      email: 'user@globetrotter.com',
      password: userPassword,
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'TRAVELER',
      city: 'London',
      country: 'United Kingdom',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    },
  });

  // 3. Seed Cities
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

  // 4. Seed Activities
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

  const activityMap: Record<string, string> = {};
  for (const act of activitiesData) {
    const cityId = citiesMap[act.city];
    if (cityId) {
      const existing = await prisma.activity.findFirst({
        where: { name: act.name, cityId },
      });
      if (existing) {
        activityMap[act.name] = existing.id;
      } else {
        const created = await prisma.activity.create({
          data: {
            name: act.name,
            category: act.category,
            estimatedCost: act.estimatedCost,
            cityId,
          },
        });
        activityMap[act.name] = created.id;
      }
    }
  }

  // 5. Seed Traveler Trips & Sections
  const existingTrip = await prisma.trip.findFirst({ where: { userId: traveler.id, name: 'European Grand Highlights' } });
  if (!existingTrip) {
    const trip1 = await prisma.trip.create({
      data: {
        name: 'European Grand Highlights',
        startDate: new Date('2026-09-10'),
        endDate: new Date('2026-09-20'),
        description: 'Exploring the cultural landmarks and culinary treasures of Paris and Rome.',
        coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&auto=format&fit=crop&q=80',
        status: 'UPCOMING',
        isPublic: true,
        shareToken: '8f7d9b23-4e1a-42c9-[#a28e-59f2c8d193b0',
        totalBudget: 1500,
        userId: traveler.id,
      },
    });

    const sec1 = await prisma.section.create({
      data: {
        tripId: trip1.id,
        name: 'Paris Heritage & Museums',
        sectionStart: new Date('2026-09-10'),
        sectionEnd: new Date('2026-09-14'),
        budget: 800,
        sequence: 1,
      },
    });

    if (activityMap['Eiffel Tower Summit Tour']) {
      await prisma.stopActivity.create({
        data: {
          sectionId: sec1.id,
          activityId: activityMap['Eiffel Tower Summit Tour'],
          day: 1,
          expense: 35,
          notes: 'Sunset viewing at 6:30 PM.',
        },
      });
    }

    if (activityMap['Louvre Museum Guided Walk']) {
      await prisma.stopActivity.create({
        data: {
          sectionId: sec1.id,
          activityId: activityMap['Louvre Museum Guided Walk'],
          day: 2,
          expense: 25,
          notes: 'Mona Lisa & Venus de Milo tour.',
        },
      });
    }

    const sec2 = await prisma.section.create({
      data: {
        tripId: trip1.id,
        name: 'Historic Rome & Cuisine',
        sectionStart: new Date('2026-09-15'),
        sectionEnd: new Date('2026-09-20'),
        budget: 700,
        sequence: 2,
      },
    });

    if (activityMap['Colosseum & Roman Forum Tour']) {
      await prisma.stopActivity.create({
        data: {
          sectionId: sec2.id,
          activityId: activityMap['Colosseum & Roman Forum Tour'],
          day: 6,
          expense: 40,
          notes: 'Skip-the-line ticket reserved.',
        },
      });
    }
  }

  // 6. Seed Community Posts
  const existingPost = await prisma.communityPost.findFirst({ where: { userId: traveler.id } });
  if (!existingPost) {
    await prisma.communityPost.create({
      data: {
        userId: traveler.id,
        content: 'Excited for my upcoming trip to Paris and Rome! Can anyone recommend hidden local coffee shops near Le Marais?',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      },
    });

    await prisma.communityPost.create({
      data: {
        userId: admin.id,
        content: 'Welcome to GlobeTrotter! Feel free to share your travel itineraries, photos, and recommendations with our global community.',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
      },
    });
  }

  console.log('Seeding finished successfully with Admin, Traveler, Cities, Activities, Trips, Sections, and Community Posts.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

