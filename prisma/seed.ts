import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate a secure random password if not provided via ENV
const generateSecurePassword = () => crypto.randomUUID() + '!Aa1';

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Admin User (use ENV variable or generate secure random password)
  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD || generateSecurePassword();
  const adminPassword = await bcrypt.hash(adminPasswordPlain, 12);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log('⚠️  Generated admin password:', adminPasswordPlain);
  }
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin erstellt:', admin.username);

  // 1b. Owner User
  const ownerPasswordPlain = process.env.SEED_OWNER_PASSWORD || generateSecurePassword();
  const ownerPassword = await bcrypt.hash(ownerPasswordPlain, 12);
  if (!process.env.SEED_OWNER_PASSWORD) {
    console.log('⚠️  Generated owner password:', ownerPasswordPlain);
  }
  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      passwordHash: ownerPassword,
      firstName: 'Inhaber',
      lastName: 'User',
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log('✅ Owner erstellt:', owner.username);

  // 2. Fahrlehrer (use ENV variable or generate secure random password)
  const instructorPasswordPlain = process.env.SEED_INSTRUCTOR_PASSWORD || generateSecurePassword();
  const instructorPassword = await bcrypt.hash(instructorPasswordPlain, 12);
  if (!process.env.SEED_INSTRUCTOR_PASSWORD) {
    console.log('⚠️  Generated instructor password:', instructorPasswordPlain);
  }
  
  const instructor1 = await prisma.user.upsert({
    where: { username: 'max.mueller' },
    update: {},
    create: {
      username: 'max.mueller',
      passwordHash: instructorPassword,
      firstName: 'Max',
      lastName: 'Müller',
      role: 'INSTRUCTOR',
      isActive: true,
    },
  });
  console.log('✅ Fahrlehrer erstellt:', instructor1.username);

  const instructor2 = await prisma.user.upsert({
    where: { username: 'anna.schmidt' },
    update: {},
    create: {
      username: 'anna.schmidt',
      passwordHash: instructorPassword,
      firstName: 'Anna',
      lastName: 'Schmidt',
      role: 'INSTRUCTOR',
      isActive: true,
    },
  });
  console.log('✅ Fahrlehrer erstellt:', instructor2.username);

  // 3. Fahrzeuge
  const vehicle1 = await prisma.vehicle.upsert({
    where: { licensePlate: 'B-CD 1234' },
    update: {},
    create: {
      name: 'VW Golf 8',
      licensePlate: 'B-CD 1234',
      transmission: 'MANUAL',
      isActive: true,
      notes: 'Schaltgetriebe, Hauptfahrzeug',
    },
  });
  console.log('✅ Fahrzeug erstellt:', vehicle1.name);

  const vehicle2 = await prisma.vehicle.upsert({
    where: { licensePlate: 'B-XY 5678' },
    update: {},
    create: {
      name: 'Audi A3',
      licensePlate: 'B-XY 5678',
      transmission: 'AUTOMATIC',
      isActive: true,
      notes: 'Automatikgetriebe',
    },
  });
  console.log('✅ Fahrzeug erstellt:', vehicle2.name);

  // 4. Fahrschüler
  const student1 = await prisma.student.create({
    data: {
      firstName: 'Lisa',
      lastName: 'Weber',
      birthDate: new Date('2005-03-15'),
      isActive: true,
    },
  });
  console.log('✅ Schüler erstellt:', student1.firstName, student1.lastName);

  const student2 = await prisma.student.create({
    data: {
      firstName: 'Tom',
      lastName: 'Meyer',
      birthDate: new Date('2004-08-22'),
      isActive: true,
    },
  });
  console.log('✅ Schüler erstellt:', student2.firstName, student2.lastName);

  const student3 = await prisma.student.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Klein',
      birthDate: new Date('2006-01-10'),
      isActive: true,
    },
  });
  console.log('✅ Schüler erstellt:', student3.firstName, student3.lastName);

  // 5. Beispiel-Termine
  const today = new Date();
  today.setHours(10, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  await prisma.appointment.createMany({
    data: [
      // Normale Übungsfahrt
      {
        type: 'PRACTICAL_LESSON',
        startTime: today,
        endTime: new Date(today.getTime() + 90 * 60000),
        studentId: student1.id,
        instructorId: instructor1.id,
        vehicleId: vehicle1.id,
        routeType: null, // Normale Übungsfahrt
        paymentStatus: 'OPEN',
        notes: 'Erste Fahrstunde',
      },
      // Sonderfahrt: Überland
      {
        type: 'PRACTICAL_LESSON',
        startTime: new Date(today.getTime() + 2 * 60 * 60000),
        endTime: new Date(today.getTime() + 3.5 * 60 * 60000),
        studentId: student2.id,
        instructorId: instructor1.id,
        vehicleId: vehicle1.id,
        routeType: 'COUNTRY',
        paymentStatus: 'PAID',
        notes: 'Überlandfahrt Richtung Potsdam',
      },
      // Sonderfahrt: Autobahn
      {
        type: 'PRACTICAL_LESSON',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 90 * 60000),
        studentId: student1.id,
        instructorId: instructor2.id,
        vehicleId: vehicle2.id,
        routeType: 'HIGHWAY',
        paymentStatus: 'OPEN',
        notes: 'Autobahnfahrt A10',
      },
      // Sonderfahrt: Nachtfahrt
      {
        type: 'PRACTICAL_LESSON',
        startTime: new Date(tomorrow.getTime() + 10 * 60 * 60000), // 20:00
        endTime: new Date(tomorrow.getTime() + 11.5 * 60 * 60000), // 21:30
        studentId: student3.id,
        instructorId: instructor1.id,
        vehicleId: vehicle1.id,
        routeType: 'NIGHT',
        paymentStatus: 'OPEN',
        notes: 'Nachtfahrt durch Berlin',
      },
      // Theorieunterricht (kein Schüler, kein Fahrzeug)
      {
        type: 'THEORY_LESSON',
        startTime: dayAfter,
        endTime: new Date(dayAfter.getTime() + 90 * 60000),
        studentId: null,
        instructorId: instructor2.id,
        vehicleId: null,
        paymentStatus: 'OPEN',
        notes: 'Thema: Vorfahrtsregeln',
      },
    ],
  });
  console.log('✅ Beispiel-Termine erstellt');

  console.log('🎉 Seeding abgeschlossen!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding fehlgeschlagen:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });