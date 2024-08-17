import React from 'react';
import { motion } from 'framer-motion';
import AboutUs from '../components/aboutUs/aboutUs';

const pageVariants = {
  initial: { opacity: 0, x: '100vw' },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: '-100vw' }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

const About: React.FC = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <AboutUs />
    </motion.div>
  );
};

export default About;