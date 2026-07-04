import React from 'react';
import { Layout } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Footer } = Layout;

const PublicFooter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (target: 'home' | 'features' | 'contact') => {
    if (location.pathname !== '/') {
      if (target === 'home') {
        navigate('/');
        return;
      }

      navigate(`/${target}`);
      return;
    }

    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
      return;
    }

    const sectionId = `${target}-section`;
    scrollToSection(sectionId);
    window.history.replaceState(null, '', `/#${sectionId}`);
  };

  const activeNav =
    location.pathname === '/features' || location.hash.includes('features')
      ? 'features'
      : location.pathname === '/contact' || location.hash.includes('contact')
        ? 'contact'
        : 'home';

  return (
    <Footer className="LandingPageFooter">
      <div className="footer-inner">
        <div className="footer-logo">
          <RocketOutlined className="logo-icon" />
          <span>Genzite</span>
        </div>
        <div className="footer-links">
          <button className={activeNav === 'home' ? 'is-active' : ''} onClick={() => handleNavClick('home')}>Home</button>
          <button className={activeNav === 'features' ? 'is-active' : ''} onClick={() => handleNavClick('features')}>Features</button>
          <button className={activeNav === 'contact' ? 'is-active' : ''} onClick={() => handleNavClick('contact')}>Contact</button>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Genzite. Built for modern AI teams.</div>
      </div>
    </Footer>
  );
};

export default PublicFooter;
