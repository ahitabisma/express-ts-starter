import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';
import { Role } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');

    // Delete all existing users and refresh tokens (cascading delete will remove related tokens)
    await prisma.user.deleteMany({});
    console.log('Cleaned up existing data');

    // Reset auto increment for user ID
    await prisma.$executeRaw`ALTER TABLE users AUTO_INCREMENT = 1;`;

    // Create a password hash for all users
    const defaultPassword = await bcrypt.hash('123123', 10);

    // Create an admin user
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: defaultPassword,
            role: Role.ADMIN
        }
    });
    console.log(`Created admin user with id: ${admin.id}`);

    // Create regular users
    const user1 = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            password: defaultPassword,
            role: Role.USER
        }
    });
    console.log(`Created regular user with id: ${user1.id}`);

    const user2 = await prisma.user.create({
        data: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: defaultPassword,
            role: Role.USER
        }
    });
    console.log(`Created regular user with id: ${user2.id}`);

    console.log('Seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });