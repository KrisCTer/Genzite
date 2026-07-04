import React, { useEffect, useMemo, useRef } from 'react';
import { Layout, Typography, Button } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Cloud,
  Gauge,
  Layers,
  LayoutGrid,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import './LandingPage.css';
import './FeaturesPage.css';

import useSEO from '../../hooks/useSEO';
import PublicHeader from './components/PublicHeader';
import PublicFooter from './components/PublicFooter';
import FeaturedProjectsSection, { type FeaturedProject } from './components/FeaturedProjectsSection';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
};

const featuredProjects: FeaturedProject[] = [
  {
    title: 'AI Platform',
    description: 'Prompt-powered workspace with automation pipelines and collaborative AI assistants.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'SaaS Dashboard',
    description: 'Executive dashboards with rich data storytelling and modern operational visibility.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'CRM System',
    description: 'Customer lifecycle platform with smart segmentation and workflow automation.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'E-Commerce Website',
    description: 'High-converting storefront crafted for speed, trust, and polished checkout experience.',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Business Landing Page',
    description: 'Narrative-driven launch site optimized for campaign performance and brand positioning.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Real-time insights workspace with alerting, forecasting, and product health reporting.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
  },
];

const highlights = [
  {
    title: 'AI Integration',
    description: 'Native AI capabilities embedded into flows for generation, assistance, and automation.',
    icon: Bot,
  },
  {
    title: 'Lightning Fast Performance',
    description: 'Optimized rendering and architecture to deliver smooth, responsive experiences.',
    icon: Zap,
  },
  {
    title: 'Secure Architecture',
    description: 'Defense-in-depth approach with robust access control and secure-by-default patterns.',
    icon: ShieldCheck,
  },
  {
    title: 'Responsive Design',
    description: 'Layouts and components that adapt seamlessly across desktop, tablet, and mobile.',
    icon: LayoutGrid,
  },
  {
    title: 'Cloud Ready',
    description: 'Built to scale with modern cloud infrastructure, CI/CD, and operational observability.',
    icon: Cloud,
  },
  {
    title: 'Modern UI Components',
    description: 'Reusable, elegant components that keep teams shipping polished interfaces quickly.',
    icon: Layers,
  },
];

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const layoutRef = useRef<HTMLDivElement>(null);

  const anchors = useMemo(
    () => ({
      projects: 'features-projects-section',
      highlights: 'features-highlights-section',
    }),
    [],
  );

  useSEO({
    title: 'Features',
    description:
      'Explore the powerful capabilities that make our platform modern, intelligent, scalable, and easy to use.',
  });

  useEffect(() => {
    const node = layoutRef.current;
    if (!node) return;

    const handlePointerMove = (event: PointerEvent) => {
      node.style.setProperty('--pointer-x', (event.clientX / window.innerWidth - 0.5).toFixed(3));
      node.style.setProperty('--pointer-y', (event.clientY / window.innerHeight - 0.5).toFixed(3));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout className="LandingPageLayout" ref={layoutRef}>
      <div className="site-canvas" aria-hidden="true">
        <div className="canvas-base" />
        <div className="canvas-glows" />
        <div className="canvas-aurora" />
        <div className="canvas-mesh" />
        <div className="canvas-noise" />
        <div className="canvas-particles" />
        <div className="canvas-grid" />
        <div className="canvas-lines">
          <span className="canvas-line canvas-line--one" />
          <span className="canvas-line canvas-line--two" />
          <span className="canvas-line canvas-line--three" />
        </div>
        <div className="canvas-glass">
          <span className="glass-orb glass-orb--one" />
          <span className="glass-orb glass-orb--two" />
          <span className="glass-orb glass-orb--three" />
          <span className="glass-orb glass-orb--four" />
        </div>
        <div className="canvas-spotlights">
          <span className="section-spotlight section-spotlight--workflow" />
          <span className="section-spotlight section-spotlight--stats" />
          <span className="section-spotlight section-spotlight--testimonials" />
          <span className="section-spotlight section-spotlight--pricing" />
          <span className="section-spotlight section-spotlight--cta" />
        </div>
      </div>

      <PublicHeader />

      <Content className="LandingPageContainer FeaturesPageContainer">
        <motion.section className="FeaturesHeroSection section-section" {...fadeUp}>
          <div className="features-hero-grid">
            <div className="features-hero-copy">
              <div className="hero-eyebrow">Platform Features</div>
              <Title className="hero-title">Our Features</Title>
              <Paragraph className="hero-description features-hero-description">
                Explore the powerful capabilities that make our platform modern, intelligent, scalable, and easy to use.
              </Paragraph>
              <div className="hero-actions features-hero-actions">
                <Button type="primary" size="large" className="hero-cta" onClick={() => scrollToSection(anchors.highlights)}>
                  Explore Features
                </Button>
                <Button type="default" size="large" className="hero-secondary" onClick={() => scrollToSection(anchors.projects)}>
                  View Projects
                </Button>
              </div>
            </div>

            <motion.div
              className="features-hero-visual glass-card"
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div className="features-tech-shape features-tech-shape--one" animate={{ y: [-6, 8, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.div className="features-tech-shape features-tech-shape--two" animate={{ y: [8, -8, 8] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.div className="features-tech-orb" animate={{ y: [-8, 10, -8], x: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <Gauge size={36} />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section className="capabilities-section section-section" {...fadeUp}>
          <div className="capabilities-grid glass-card">
            <div className="capabilities-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
                alt="Designed for performance"
                loading="lazy"
              />
              <div className="capabilities-image-overlay" />
            </div>
            <div className="capabilities-copy">
              <h2>Designed for Performance</h2>
              <p>
                Our platform combines modern UI foundations, scalable architecture, intelligent workflows,
                responsive layouts, and reusable components to deliver an exceptional user experience from
                idea to production.
              </p>
              <Button type="default" size="large" className="hero-secondary" onClick={() => navigate('/contact')}>
                Learn More
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section id={anchors.highlights} className="feature-highlights-section section-section" {...fadeUp}>
          <div className="features-section-head">
            <h2>Feature Highlights</h2>
          </div>
          <div className="feature-highlights-grid">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="feature-highlight-card glass-card hover-glow">
                  <div className="feature-highlight-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </motion.section>

        <motion.section className="image-showcase-section section-section" {...fadeUp}>
          <div className="features-section-head">
            <h2>Platform Showcase</h2>
          </div>
          <div className="image-showcase-grid">
            <article className="image-showcase-card glass-card hover-glow">
              <div className="image-showcase-wrap">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1800&q=80"
                  alt="Dashboard overview"
                  loading="lazy"
                />
                <div className="image-showcase-overlay" />
              </div>
              <div className="image-showcase-copy">
                <h3>Dashboard Overview</h3>
              </div>
            </article>
            <article className="image-showcase-card glass-card hover-glow">
              <div className="image-showcase-wrap">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
                  alt="Team collaboration workspace"
                  loading="lazy"
                />
                <div className="image-showcase-overlay" />
              </div>
              <div className="image-showcase-copy">
                <h3>Team Collaboration Workspace</h3>
              </div>
            </article>
          </div>
        </motion.section>

        <div id={anchors.projects}>
          <FeaturedProjectsSection projects={featuredProjects} />
        </div>

        <motion.section className="cta-banner section-section cta-bg glass-card" {...fadeUp}>
          <div>
            <div className="eyebrow">Features</div>
            <h2>Ready to Experience Our Features?</h2>
            <p>Discover how our modern solutions can help you build faster, smarter, and more efficiently.</p>
          </div>
          <Button type="primary" size="large" className="LandingPageHeroButton" onClick={() => navigate('/login')}>
            Get Started
          </Button>
        </motion.section>
      </Content>

      <PublicFooter />
    </Layout>
  );
};

export default FeaturesPage;
