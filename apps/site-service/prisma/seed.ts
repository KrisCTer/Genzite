import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Xóa dữ liệu cũ
    await prisma.widget.deleteMany();
    await prisma.page.deleteMany();
    await prisma.site.deleteMany();

    // Tạo Site
    const site = await prisma.site.create({
        data: {
            name: 'Flower Shop',
            subdomain: 'flowershop',
            description: 'Website bán hoa',
            ownerId: 'test-user-1',
        },
    });

    // Tạo Home Page
    const homePage = await prisma.page.create({
        data: {
            title: 'Home',
            slug: '/',
            siteId: site.id,
            sortOrder: 1,
        },
    });

    // Tạo About Page
    const aboutPage = await prisma.page.create({
        data: {
            title: 'About',
            slug: '/about',
            siteId: site.id,
            sortOrder: 2,
        },
    });

    // Widgets Home
    await prisma.widget.createMany({
        data: [
            {
                pageId: homePage.id,
                type: 'HERO',
                sortOrder: 1,
                contentConfig: {
                    title: 'Welcome to Flower Shop',
                    buttonText: 'Shop Now',
                },
            },
            {
                pageId: homePage.id,
                type: 'CARD',
                sortOrder: 2,
                contentConfig: {
                    title: 'Best Seller',
                },
            },
            {
                pageId: homePage.id,
                type: 'FOOTER',
                sortOrder: 3,
                contentConfig: {},
            },
        ],
    });

    // Widgets About
    await prisma.widget.createMany({
        data: [
            {
                pageId: aboutPage.id,
                type: 'TEXT',
                sortOrder: 1,
                contentConfig: {
                    text: 'About our company',
                },
            },
            {
                pageId: aboutPage.id,
                type: 'IMAGE',
                sortOrder: 2,
                contentConfig: {
                    imageUrl: '/about.jpg',
                },
            },
        ],
    });

    console.log('Seed completed');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });