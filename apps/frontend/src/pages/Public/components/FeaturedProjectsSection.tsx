import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import './FeaturedProjectsSection.css';

export type FeaturedProject = {
  title: string;
  description: string;
  image: string;
};

type FeaturedProjectsSectionProps = {
  projects: FeaturedProject[];
  className?: string;
  title?: string;
};

const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({
  projects,
  className = '',
  title = 'Featured Projects',
}) => {
  return (
    <motion.section className={`featured-projects-section section-section ${className}`.trim()} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }} viewport={{ once: true, amount: 0.2 }}>
      <div className="contact-section-head">
        <h2>{title}</h2>
      </div>
      <div className="showcase-grid showcase-grid--three-col">
        {projects.map((project) => (
          <article key={project.title} className="showcase-card glass-card hover-glow">
            <div className="showcase-image-wrap">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="showcase-image-overlay" />
            </div>
            <div className="showcase-copy">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <span>
                View project <ArrowUpRight size={16} />
              </span>
            </div>
          </article>
        ))}
      </div>
    </motion.section>
  );
};

export default FeaturedProjectsSection;
