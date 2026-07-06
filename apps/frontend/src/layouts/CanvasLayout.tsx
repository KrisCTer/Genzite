import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ADMIN_BASE, WORKSPACE_BASE } from '../utils/userNav';
import './CanvasLayout.css';

/**
 * CanvasLayout — Full-bleed layout for PageBuilder & AI Canvas.
 * No sidebar, no header chrome. Just the canvas experience.
 */
const CanvasLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith(WORKSPACE_BASE);
  const backPath = isWorkspace ? WORKSPACE_BASE : `${ADMIN_BASE}/site`;

  return (
    <div className="canvas-layout">
      {/* Minimal escape hatch — small back pill in top-left */}
      <button
        className="canvas-layout-back"
        onClick={() => navigate(backPath)}
        title="Back to workspace"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span className="canvas-layout-back-text">Workspace</span>
      </button>

      <Outlet />
    </div>
  );
};

export default CanvasLayout;
