import React from 'react';
import { Layout } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Footer } = Layout;

const PublicFooter: React.FC = () => {
  return (
    <Footer className="LandingPageFooter">
      <div className="footer-inner">
        <div className="footer-logo">
          <RocketOutlined className="logo-icon" />
          <span>Genzite</span>
        </div>
        <div className="footer-links">
          <a>Product</a>
          <a>Contact</a>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Genzite. Built for modern AI teams.</div>
      </div>
    </Footer>
  );
};

export default PublicFooter;
