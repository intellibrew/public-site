import { useInView } from 'react-intersection-observer';
import { useAnimation } from 'framer-motion';

export const useScrollAnimation = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  if (inView) {
    controls.start('visible');
  }

  return { ref, controls, variants: scrollVariants };
};

export const scrollVariants = {
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hidden: { opacity: 0, y: 50 }
};