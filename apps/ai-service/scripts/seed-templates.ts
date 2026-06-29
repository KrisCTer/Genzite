import { PrismaClient } from '@prisma/client-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load shared .env file
dotenv.config({ path: path.join(__dirname, '../../../infra/.env') });
if (!process.env.DATABASE_URL && process.env.SUPABASE_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_URL;
  process.env.DIRECT_URL = process.env.SUPABASE_DIRECT_URL || process.env.SUPABASE_URL;
}

const prisma = new PrismaClient();

const GOLDEN_TEMPLATES = [
  {
    name: "Minimalist E-Commerce",
    category: "ecommerce",
    tags: ["shop", "bán", "store", "mua", "sản phẩm"],
    content: {
      site: { name: "Minimalist E-Commerce", subdomain: "shop-minimal" },
      pages: [
        {
          title: "Home",
          slug: "/",
          widgets: [
            { type: "HeroSection", contentConfig: { title: "Summer Collection", subtitle: "Discover our new arrivals", ctaText: "Shop Now" }, sortOrder: 1 },
            { type: "ProductGrid", contentConfig: { category: "featured", limit: 4 }, sortOrder: 2 },
            { type: "Footer", contentConfig: { copyright: "© 2026", links: ["About", "Contact"] }, sortOrder: 3 }
          ]
        }
      ]
    }
  },
  {
    name: "Creative Portfolio",
    category: "portfolio",
    tags: ["portfolio", "cá nhân", "cv", "resume", "dự án", "hồ sơ"],
    content: {
      site: { name: "Creative Portfolio", subdomain: "my-portfolio" },
      pages: [
        {
          title: "Home",
          slug: "/",
          widgets: [
            { type: "HeroSection", contentConfig: { title: "Hi, I'm Alex", subtitle: "UX/UI Designer based in Tokyo", ctaText: "View My Work" }, sortOrder: 1 },
            { type: "Features", contentConfig: { items: ["Web Design", "App Design", "Branding"] }, sortOrder: 2 },
            { type: "ContactForm", contentConfig: { heading: "Get in touch", emailPlaceholder: "Your email" }, sortOrder: 3 }
          ]
        }
      ]
    }
  },
  {
    name: "Tech Insights Blog",
    category: "blog",
    tags: ["blog", "tin tức", "bài viết", "news"],
    content: {
      site: { name: "Tech Insights Blog", subdomain: "tech-blog" },
      pages: [
        {
          title: "Home",
          slug: "/",
          widgets: [
            { type: "HeroSection", contentConfig: { title: "Tech Insights", subtitle: "Deep dives into AI and Web3", ctaText: "Read Latest" }, sortOrder: 1 },
            { type: "ArticleList", contentConfig: { limit: 6 }, sortOrder: 2 },
            { type: "Newsletter", contentConfig: { title: "Subscribe for updates" }, sortOrder: 3 }
          ]
        }
      ]
    }
  }
];

async function main() {
  console.log('Seeding AiTemplates into database...');

  for (const tpl of GOLDEN_TEMPLATES) {
    const existing = await prisma.aiTemplate.findFirst({
      where: { name: tpl.name }
    });

    if (!existing) {
      await prisma.aiTemplate.create({
        data: {
          name: tpl.name,
          category: tpl.category,
          tags: tpl.tags,
          content: tpl.content as object,
        }
      });
      console.log(`Created template: ${tpl.name}`);
    } else {
      console.log(`Template already exists: ${tpl.name}`);
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
