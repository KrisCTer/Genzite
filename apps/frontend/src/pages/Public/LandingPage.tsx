import React, { useEffect, useRef } from 'react';
import { Layout, Typography, Button } from 'antd';
import { SquareTerminal, Workflow, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import PublicHeader from './components/PublicHeader';
import PublicFooter from './components/PublicFooter';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

import useSEO from '../../hooks/useSEO';

const SmartAutomationCloudIcon: React.FC = () => (
  <Workflow
    size={30}
    strokeWidth={2}
    color="#06B6D4"
  />
);
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const layoutRef = useRef<HTMLDivElement>(null);
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

      <Content className="LandingPageHeroSection">
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
            <Button type="primary" size="large" className="hero-cta" onClick={() => navigate('/login')}>
              Get Started for Free
            </Button>
            <Button type="default" size="large" className="hero-secondary" onClick={() => navigate('/login')}>
              Explore Platform
            </Button>
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
      </Content>

      <PublicFooter />
    </Layout>
  );
};

export default LandingPage;
