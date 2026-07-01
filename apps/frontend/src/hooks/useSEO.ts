import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
}

const useSEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    // Đổi Title
    const defaultTitle = 'Genzite Platform';
    document.title = `${title} | ${defaultTitle}`;

    // Đổi Meta Description nếu có truyền vào
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

    // Cleanup khi rời khỏi trang (optional, tuỳ kiến trúc)
    return () => {
      document.title = defaultTitle;
    };
  }, [title, description]);
};

export default useSEO;
