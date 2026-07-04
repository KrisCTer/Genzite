import React from 'react';
import { Button, Layout } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header } = Layout;

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Header className="LandingPageHeader">
      <div className="LandingPageHeaderInner">
        <div className="LandingPageLogo">
          <RocketOutlined className="logo-icon" />
          <span>Genzite</span>
        </div>
        <div className="LandingPageNav">
          <button className={location.pathname === '/' ? 'is-active' : ''} onClick={() => navigate('/')}>Home</button>
          <button className={location.pathname === '/features' ? 'is-active' : ''} onClick={() => navigate('/features')}>Features</button>
          <button className={location.pathname === '/contact' ? 'is-active' : ''} onClick={() => navigate('/contact')}>Contact</button>
        </div>
        <Button type="primary" size="large" className="LandingPageSignIn" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    </Header>
  );
};

export default PublicHeader;
