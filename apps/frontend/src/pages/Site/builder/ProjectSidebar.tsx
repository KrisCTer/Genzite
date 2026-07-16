import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSitesApi } from '../../../api/sites';
import { Search, LayoutGrid, Users, Monitor, Layout, Component } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProjectSidebar.css';
import { useAuthStore } from '../../../store/auth';

const ProjectSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const { data: apiSites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSitesApi,
    enabled: !!token,
  });

  const sites = apiSites;
  const filteredSites = sites.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    const isMine = s.ownerId === user?.id || (!s.ownerId && activeTab === 'mine');
    if (activeTab === 'mine') {
      return isMine;
    } else {
      return !isMine;
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const grouped = filteredSites.reduce((acc: any, site: any) => {
    const created = new Date(site.createdAt);
    let group = 'Older';
    if (created >= today) {
      group = 'Recent';
    } else if (created >= new Date(today.getTime() - 86400000)) {
      group = 'Yesterday';
    } else if (created >= new Date(today.getTime() - 7 * 86400000)) {
      group = 'Last 7 days';
    }
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(site);
    return acc;
  }, {} as Record<string, any[]>);

  // Reorder groups: Recent first, then Yesterday, etc.
  const groupOrder = ['Recent', 'Yesterday', 'Last 7 days', 'Older'];
  const displayGroups = Object.keys(grouped).sort((a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b));

  const renderIcon = (type?: string) => {
    if (type === 'Layout') return <Layout size={12} />;
    if (type === 'Component') return <Component size={12} />;
    return <Monitor size={12} />;
  };

  const getGradient = (id: string) => {
    const sum = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const h1 = sum % 360;
    const h2 = (sum * 2) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 50%), hsl(${h2}, 70%, 30%))`;
  };

  return (
    <div className="gz-project-sidebar">
      <div className="gz-project-tabs">
        <button 
          className={`gz-project-tab ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          <LayoutGrid size={16} />
          My projects
        </button>
        <button 
          className={`gz-project-tab ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          <Users size={16} />
          Shared with me
        </button>
      </div>

      <div className="gz-project-search-wrap">
        <Search size={16} className="gz-project-search-icon" />
        <input 
          type="text" 
          className="gz-project-search" 
          placeholder="Search projects" 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="gz-project-list">
        {displayGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            {activeTab === 'mine' 
              ? (search ? 'No projects matching your search.' : 'No projects yet. Start with your design above!')
              : (search ? 'No shared projects matching your search.' : 'No projects shared with you yet.')}
          </div>
        ) : (
          displayGroups.map((groupName) => (
            <div key={groupName} className="gz-project-group">
              <div className="gz-project-group-title">{groupName}</div>
              <div className="gz-project-group-items">
                {grouped[groupName].map((site: any) => (
                  <div 
                    key={site.id} 
                    className="gz-project-item"
                    onClick={() => site.id.length > 5 ? navigate(`/project/${site.id}`) : null}
                  >
                    <div className="gz-project-thumb">
                      <div 
                        className="gz-project-thumb-inner" 
                        style={{ background: site.thumb ? undefined : getGradient(site.id) }}
                      >
                        {/* Using mock CSS classes for predefined backgrounds in screenshot */}
                        {site.thumb && <div className={`gz-project-thumb-bg ${site.thumb}`}></div>}
                      </div>
                    </div>
                    <div className="gz-project-info">
                      <div className="gz-project-name">{site.name}</div>
                      <div className="gz-project-meta">
                        {renderIcon(site.icon)}
                        <span>{new Date(site.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
