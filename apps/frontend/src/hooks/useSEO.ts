import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
}

const useSEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    // Change Title
    const defaultTitle = 'Genzite Platform';
    document.title = `${title} | ${defaultTitle}`;

    // Change Meta Description if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        metaDescription.setAttribute('content', description);
        document.head.appendChild(metaDescription);
      }
    }

    // Cleanup on page leave (optional, depends on architecture)
    return () => {
      document.title = defaultTitle;
    };
  }, [title, description]);
};

export default useSEO;
