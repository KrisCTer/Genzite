import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSitesApi, type Site } from '../../../api/sites';
import { Search, LayoutGrid, Users, Monitor, Layout, Component } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAiLogStore } from '../../../store/aiLogs';
import AgentLogSidebar from './AgentLogSidebar';
import './ProjectSidebar.css';

const MOCK_SITES = [
  { id: '1', name: 'UI Design Replica', createdAt: new Date().toISOString(), icon: 'Monitor', thumb: 'bg-1' },
  { id: '2', name: 'Genzite_Part_1783146500956', createdAt: new Date(Date.now() - 86400000).toISOString(), icon: 'Monitor', thumb: 'bg-2' },
  { id: '3', name: 'Genzite_Part_1783146500941', createdAt: new Date(Date.now() - 86400000).toISOString(), icon: 'Layout', thumb: 'bg-3' },
  { id: '4', name: 'Genzite_Part_1783145256884', createdAt: new Date(Date.now() - 86400000).toISOString(), icon: 'Layout', thumb: 'bg-4' },
  { id: '5', name: 'Genzite_Part_1783145256888', createdAt: new Date(Date.now() - 86400000).toISOString(), icon: 'Component', thumb: 'bg-5' },
];

const ProjectSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: apiSites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSitesApi,
  });

  const sites = apiSites;
  const filteredSites = sites.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const grouped = filteredSites.reduce((acc, site) => {
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

  const isGenerating = useAiLogStore(state => state.isGenerating);

  if (isGenerating) {
    return (
      <div className="gz-project-sidebar" style={{ padding: 0, overflow: 'hidden', background: '#0F172A' }}>
        <AgentLogSidebar />
      </div>
    );
  }

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
        {displayGroups.map((groupName) => (
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
        ))}
      </div>
    </div>
  );
};

export default ProjectSidebar;
