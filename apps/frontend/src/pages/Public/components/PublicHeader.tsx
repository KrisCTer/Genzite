import React from 'react';
import { Button, Layout } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Header className="LandingPageHeader">
      <div className="LandingPageHeaderInner">
        <div className="LandingPageLogo">
          <RocketOutlined className="logo-icon" />
          <span>Genzite</span>
        </div>
        <Button type="primary" size="large" className="LandingPageSignIn" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    </Header>
  );
};

export default PublicHeader;
