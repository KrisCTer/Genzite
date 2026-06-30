import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { fetchWidgetsApi, type Widget } from '../../api/sites';
import WidgetRenderer from '../Site/builder/WidgetRenderer';
import { ArrowLeftOutlined } from '@ant-design/icons';

const LiveViewer: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pageId) {
      setLoading(true);
      fetchWidgetsApi(pageId)
        .then(data => {
          setWidgets(data);
          setError(false);
        })
        .catch(err => {
          console.error('Failed to load page:', err);
          setError(true);
        })
        .finally(() => setLoading(false));
    }
  }, [pageId]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1117' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1117' }}>
        <Result
          status="500"
          title={<span style={{ color: '#fff' }}>Page Not Found</span>}
          subTitle={<span style={{ color: '#8B949E' }}>Sorry, something went wrong or the page does not exist.</span>}
          extra={<Link to="/admin"><Button type="primary">Back Home</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      background: '#0D1117', 
      position: 'relative', 
      overflowX: 'hidden' 
    }}>
      {/* Return button for preview purpose */}
      <Link to={`/admin/site/pages/${pageId}/builder`} style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 1000,
      }}>
        <Button 
          type="primary" 
          shape="round" 
          icon={<ArrowLeftOutlined />}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
        >
          Back to Editor
        </Button>
      </Link>

      <div style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {[...widgets].sort((a, b) => a.sortOrder - b.sortOrder).map(widget => (
          <div key={widget.id} style={{ width: '100%' }}>
            <WidgetRenderer
              type={widget.type}
              config={widget.contentConfig}
              isActive={false} // never active on live site
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveViewer;
