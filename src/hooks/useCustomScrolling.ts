import { useEffect } from 'react';

const useCustomScrolling = () => {
  useEffect(() => {
    const smoothScroll = (target: string) => {
      const element = document.querySelector(target);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = (link as HTMLAnchorElement).getAttribute('href') as string;
        smoothScroll(target);
      });
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', () => {});
      });
    };
  }, []);
};

export default useCustomScrolling;