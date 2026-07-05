import React from 'react';
import { Layout } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserAccountMenu from '../../../components/UserAccountMenu';

const { Header } = Layout;

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Header className="LandingPageHeader">
      <div className="LandingPageHeaderInner">
        <button
          type="button"
          className="LandingPageLogo LandingPageLogo--button"
          onClick={() => navigate('/')}
        >
          <RocketOutlined className="logo-icon" />
          <span>Genzite</span>
        </button>
        <UserAccountMenu signInClassName="LandingPageSignIn" variant="landing" />
      </div>
    </Header>
  );
};

export default PublicHeader;
