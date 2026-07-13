import React, { useEffect, useRef, useState } from 'react';
import { Layout, Typography, Button, Input, Collapse, message, FloatButton } from 'antd';
import { motion } from 'framer-motion';
import {
  SquareTerminal,
  Workflow,
  Zap,
  Bot,
  Cloud,
  Gauge,
  Globe,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { hasStaffAccess, getHomePath } from '../../utils/userNav';
import { resolveUserRoles } from '../../utils/jwt';
import './LandingPage.css';
import './FeaturesPage.css';
import './ContactPage.css';
import PublicHeader from './components/PublicHeader';
import PublicFooter from './components/PublicFooter';
import FeaturedProjectsSection, { type FeaturedProject } from './components/FeaturedProjectsSection';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

import useSEO from '../../hooks/useSEO';

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

const contactInfo = [
  {
    title: 'Office',
    icon: MapPin,
    lines: ['123 Innovation Street', 'Ho Chi Minh City', 'Vietnam'],
  },
  {
    title: 'Email',
    icon: Mail,
    lines: ['hello@company.com', 'support@company.com'],
  },
  {
    title: 'Phone',
    icon: Phone,
    lines: ['+84 123 456 789', '+84 987 654 321'],
  },
  {
    title: 'Social',
    icon: Globe,
    lines: ['Facebook', 'LinkedIn', 'GitHub', 'Instagram'],
  },
];

const faqItems = [
  {
    key: '1',
    label: 'How can I contact your team?',
    children: 'You can send us a message through the contact form or reach us directly via email and phone listed above.',
  },
  {
    key: '2',
    label: 'How quickly will I receive a response?',
    children: 'Most inquiries receive a response within one business day. Priority requests are handled as quickly as possible.',
  },
  {
    key: '3',
    label: 'Do you accept collaborations?',
    children: 'Yes. We welcome partnerships, co-building opportunities, and strategic collaborations aligned with our product vision.',
  },
  {
    key: '4',
    label: 'Can I request custom software development?',
    children: 'Absolutely. Share your requirements in the message field and our team will propose a tailored approach for your goals.',
  },
];

const SmartAutomationCloudIcon: React.FC = () => (
  <Workflow
    size={30}
    strokeWidth={2}
    color="#06B6D4"
  />
);
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const roles = resolveUserRoles(user?.roles, token);
  // @ts-ignore
  const staffAccess = hasStaffAccess(roles);
  const goToWorkspace = () => {
    if (token) {
      navigate('/project');
      return;
    }
    navigate('/login');
  };

  const anchors = {
    home: 'home-section',
    features: 'features-section',
    featureHighlights: 'features-highlights-section',
    featureProjects: 'features-projects-section',
    contact: 'contact-section',
    contactInfo: 'contact-info-section',
    contactForm: 'contact-form-section',
  };

  useSEO({ title: 'Trang chủ', description: 'Trải nghiệm nền tảng tạo website tự động bằng AI từ Genzite.' });

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

  useEffect(() => {
    const pathTarget =
      location.pathname === '/features'
        ? anchors.features
        : location.pathname === '/contact'
          ? anchors.contact
          : null;

    const hashTarget = location.hash ? location.hash.slice(1) : null;
    const target = hashTarget || pathTarget;

    if (!target) return;

    window.setTimeout(() => {
      scrollToSection(target);
    }, 0);
  }, [location.hash, location.pathname]);

  const handleSubmit = () => {
    setIsSending(true);
    window.setTimeout(() => {
      setIsSending(false);
      message.success('Message sent. Our team will contact you soon.');
    }, 1200);
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

      <Content className="LandingPageHeroSection" id={anchors.home}>
        <div className="hero-content">
          <div className="hero-eyebrow">Premium AI Workspace</div>
          <Title className="hero-title">
            Build a <span className="text-gradient">future-ready</span> workspace
            <br />
            with AI-powered <span className="text-gradient">content systems</span>
          </Title>
          <Paragraph className="hero-description">
            Genzite brings modern SaaS design, dynamic CMS, and intelligent automation together in one elegant platform. Create, launch, and scale polished digital experiences faster.
          </Paragraph>
          <div className="hero-actions">
            <Button type="primary" size="large" className="hero-cta" onClick={goToWorkspace}>
              {!token ? 'Get Started for Free' : 'Join Workspace'}
            </Button>
            {!token ? (
              <Button type="default" size="large" className="hero-secondary" onClick={() => document.getElementById(anchors.features)?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Platform
              </Button>
            ) : (
              <Button type="default" size="large" className="hero-secondary" onClick={() => navigate(getHomePath(roles))}>
                Join Dashboard
              </Button>
            )}
          </div>
        </div>
      </Content>

      <div className="section-divider" />

      <Content className="LandingPageContainer">
        <section className="feature-grid section-section feature-bg">
          <div className="feature-card glass-card hover-glow">
            <div className="feature-heading">
              <div className="feature-icon">
                <SquareTerminal size={32} strokeWidth={2.25} color="#06B6D4" absoluteStrokeWidth />
              </div>
              <h3>Unified Content Hub</h3>
            </div>
            <p>Manage dynamic pages, models, and AI-powered content across every channel with a single source of truth.</p>
          </div>
          <div className="feature-card glass-card hover-glow">
            <div className="feature-heading">
              <div className="feature-icon">
                <SmartAutomationCloudIcon />
              </div>
              <h3>Smart Automation</h3>
            </div>
            <p>Use AI rules and auto-generated workflows to move from idea to launch faster, with fewer manual steps.</p>
          </div>
          <div className="feature-card glass-card hover-glow">
            <div className="feature-heading">
              <div className="feature-icon">
                <Zap size={30} strokeWidth={2} color="#06B6D4" strokeLinecap="round" strokeLinejoin="round" />
              </div>
              <h3>Real-Time Insights</h3>
            </div>
            <p>Track performance metrics, content health, and engagement trends in a clean, modern analytics workspace.</p>
          </div>
        </section>

        <section className="logo-cloud section-section logo-cloud-bg">
          <div className="logo-chip">Vercel</div>
          <div className="logo-chip">Stripe</div>
          <div className="logo-chip">Notion</div>
          <div className="logo-chip">Framer</div>
          <div className="logo-chip">OpenAI</div>
          <div className="logo-chip">Supabase</div>
        </section>

        <section className="workflow-section section-section workflow-bg">
          <div className="workflow-copy">
            <div className="eyebrow">AI Workflow</div>
            <h2>Design, generate, and launch in one intelligent flow.</h2>
            <p>From prompt-driven site creation to automated publishing, Genzite turns strategic ideas into polished digital experiences.</p>
          </div>
          <div className="workflow-cards">
            <div className="workflow-card glass-card">
              <span>1</span>
              <h4>Prompt to Prototype</h4>
              <p>Instantly generate strategy pages, UI flows, and content outlines using natural language.</p>
            </div>
            <div className="workflow-card glass-card">
              <span>2</span>
              <h4>Refine & Iterate</h4>
              <p>Fine-tune layouts, data models, and brand tone with AI suggestions in real time.</p>
            </div>
            <div className="workflow-card glass-card">
              <span>3</span>
              <h4>Launch & Scale</h4>
              <p>Deploy a production-ready workspace backed by CMS, automation, and monitoring.</p>
            </div>
          </div>
        </section>

        <section className="stats-section section-section stats-bg">
          <div className="stat-block glass-card">
            <span>99.98%</span>
            <p>Platform uptime trusted by modern teams.</p>
          </div>
          <div className="stat-block glass-card">
            <span>4.9/5</span>
            <p>Average user satisfaction across AI workflows.</p>
          </div>
          <div className="stat-block glass-card">
            <span>30s</span>
            <p>Average time to generate a full page from prompt.</p>
          </div>
          <div className="stat-block glass-card">
            <span>500K+</span>
            <p>Assets and content blocks managed by the platform.</p>
          </div>
        </section>

        <section className="testimonials-section section-section testimonial-bg">
          <h2>Trusted by product teams building the next generation of digital experiences.</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card glass-card">
              <p>“Genzite feels like the future of SaaS product design. We move faster, launch better, and collaborate with more confidence.”</p>
              <strong>— Maya Chen, Head of Product</strong>
            </div>
            <div className="testimonial-card glass-card">
              <p>“The mix of AI-generated layouts and real-time CMS control is unmatched. Our team ships polished customer experiences in days.”</p>
              <strong>— Jonas Park, Growth Lead</strong>
            </div>
          </div>
        </section>

        <section className="pricing-preview section-section pricing-bg">
          <h2>Premium plans built for fast-moving teams.</h2>
          <div className="pricing-grid">
            <div className="pricing-card glass-card">
              <span>Starter</span>
              <strong>$29</strong>
              <p>Best for solo founders and early prototypes.</p>
            </div>
            <div className="pricing-card featured glass-card">
              <span>Scale</span>
              <strong>$99</strong>
              <p>Perfect for growing teams and product launches.</p>
            </div>
            <div className="pricing-card glass-card">
              <span>Enterprise</span>
              <strong>Custom</strong>
              <p>Flexible pricing for large organizations and custom workflows.</p>
            </div>
          </div>
        </section>

        <section className="cta-banner section-section cta-bg glass-card">
          <div>
            <div className="eyebrow">Launch faster with premium AI tooling</div>
            <h2>Transform your digital workspace with Genzite.</h2>
          </div>
          <Button type="primary" size="large" className="LandingPageHeroButton" onClick={() => navigate('/login')}>Start your workspace</Button>
        </section>

        <motion.section id={anchors.features} className="FeaturesHeroSection section-section" {...fadeUp}>
          <div className="features-hero-grid">
            <div className="features-hero-copy">
              <div className="hero-eyebrow">Platform Features</div>
              <Title className="hero-title">Our Features</Title>
              <Paragraph className="hero-description features-hero-description">
                Explore the powerful capabilities that make our platform modern, intelligent, scalable, and easy to use.
              </Paragraph>
              <div className="hero-actions features-hero-actions">
                <Button type="primary" size="large" className="hero-cta" onClick={() => scrollToSection(anchors.featureHighlights)}>
                  Explore Features
                </Button>
                <Button type="default" size="large" className="hero-secondary" onClick={() => scrollToSection(anchors.featureProjects)}>
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
              <Button type="default" size="large" className="hero-secondary" onClick={() => scrollToSection(anchors.contact)}>
                Learn More
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section id={anchors.featureHighlights} className="feature-highlights-section section-section" {...fadeUp}>
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

        <div id={anchors.featureProjects}>
          <FeaturedProjectsSection projects={featuredProjects} />
        </div>

        <motion.section className="cta-banner section-section cta-bg glass-card" {...fadeUp}>
          <div>
            <div className="eyebrow">Features</div>
            <h2>Ready to Experience Our Features?</h2>
            <p>Discover how our modern solutions can help you build faster, smarter, and more efficiently.</p>
          </div>
          <Button type="primary" size="large" className="LandingPageHeroButton" onClick={() => scrollToSection(anchors.contact)}>
            Contact Team
          </Button>
        </motion.section>

        <motion.section id={anchors.contact} className="ContactHeroSection section-section" {...fadeUp}>
          <div className="contact-hero-grid">
            <div className="contact-hero-copy">
              <div className="hero-eyebrow">Contact</div>
              <Title className="hero-title">
                Contact <span className="text-gradient">Us</span>
              </Title>
              <Paragraph className="hero-description contact-hero-description">
                We'd love to hear from you.
                Whether you have questions, ideas, collaboration opportunities, or just want to say hello, our team is always ready to help.
              </Paragraph>
              <div className="hero-actions contact-hero-actions">
                <Button type="primary" size="large" className="hero-cta" onClick={() => scrollToSection(anchors.contactForm)}>
                  Contact Now
                </Button>
                <Button type="default" size="large" className="hero-secondary" onClick={() => scrollToSection(anchors.contactInfo)}>
                  Learn More
                </Button>
              </div>
            </div>
            <motion.div className="contact-hero-visual glass-card" initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <motion.div className="contact-hero-ring contact-hero-ring--one" animate={{ y: [-6, 8, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.div className="contact-hero-ring contact-hero-ring--two" animate={{ y: [8, -10, 8] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.div className="contact-hero-orb" animate={{ y: [-8, 10, -8], x: [0, 6, 0] }} transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}>
                <Sparkles size={34} />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section id={anchors.contactInfo} className="contact-info section-section" {...fadeUp}>
          <div className="contact-info-grid">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="contact-info-card glass-card hover-glow">
                  <div className="contact-info-head">
                    <Icon size={22} />
                    <h3>{item.title}</h3>
                  </div>
                  <div className="contact-info-lines">
                    {item.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section id={anchors.contactForm} className="contact-form-section section-section" {...fadeUp}>
          <div className="contact-form-card glass-card">
            <div className="contact-section-head">
              <h2>Send us a message</h2>
            </div>
            <div className="contact-form-grid">
              <Input className="contact-input" placeholder="Full Name" />
              <Input className="contact-input" placeholder="Email Address" />
              <Input className="contact-input" placeholder="Company" />
              <Input className="contact-input" placeholder="Subject" />
              <TextArea className="contact-input contact-textarea" placeholder="Message" rows={6} />
              <Button
                type="primary"
                size="large"
                className="LandingPageHeroButton contact-send-btn"
                icon={<Send size={16} />}
                loading={isSending}
                onClick={handleSubmit}
              >
                Send Message
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section className="contact-faq section-section" {...fadeUp}>
          <div className="contact-section-head">
            <h2>FAQ</h2>
          </div>
          <div className="glass-card faq-card">
            <Collapse items={faqItems} ghost className="contact-accordion" />
          </div>
        </motion.section>

        <motion.section className="cta-banner section-section cta-bg glass-card" {...fadeUp}>
          <div>
            <div className="eyebrow">Contact</div>
            <h2>Ready to build something amazing?</h2>
            <p>Let's create your next digital experience together.</p>
          </div>
          <Button type="primary" size="large" className="LandingPageHeroButton" onClick={() => navigate('/login')}>
            Get Started
          </Button>
        </motion.section>
      </Content>

      <PublicFooter />
      <FloatButton.BackTop style={{ right: 24, bottom: 24 }} />
    </Layout>
  );
};

export default LandingPage;
