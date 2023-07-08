import prisma from '../prismaClient';

export default async function setup() {
    await prisma.User.create({
        data: {
            id: 1,
            username: 'Integration.testuser@example.com',
            displayName: 'Integration Test User',
        },
    });
}
