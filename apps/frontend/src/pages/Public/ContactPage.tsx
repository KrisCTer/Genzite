import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Typography, Button, Input, Collapse, message } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';

import './LandingPage.css';
import './ContactPage.css';
import PublicHeader from './components/PublicHeader';
import PublicFooter from './components/PublicFooter';

import useSEO from '../../hooks/useSEO';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
};

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

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const formAnchors = useMemo(
    () => ({
      contactForm: 'contact-form-section',
      info: 'contact-info-section',
    }),
    [],
  );

  useSEO({
    title: 'Contact',
    description:
      "We'd love to hear from you. Reach out for questions, collaborations, and digital product opportunities.",
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

      <Content className="LandingPageContainer ContactPageContainer">
        <motion.section className="ContactHeroSection section-section" {...fadeUp}>
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
                <Button type="primary" size="large" className="hero-cta" onClick={() => scrollToSection(formAnchors.contactForm)}>
                  Contact Now
                </Button>
                <Button type="default" size="large" className="hero-secondary" onClick={() => scrollToSection(formAnchors.info)}>
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

        <motion.section id={formAnchors.info} className="contact-info section-section" {...fadeUp}>
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

        <motion.section id={formAnchors.contactForm} className="contact-form-section section-section" {...fadeUp}>
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
    </Layout>
  );
};

export default ContactPage;
