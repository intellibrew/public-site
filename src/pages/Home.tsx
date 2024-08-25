import React from 'react';
import { motion } from 'framer-motion';
import Frame1 from '../components/mainscreen/Frame1';
import Frame2 from '../components/mainscreen/Frame2';
import Frame3 from '../components/mainscreen/Frame3';
import useCustomScrolling from '../hooks/useCustomScrolling';

const pageVariants = {
  initial: { opacity: 0, x: '-100vw' },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: '100vw' }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

const Home: React.FC = () => {
  useCustomScrolling();

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Frame1 />
      <Frame2 />
      <Frame3 />
    </motion.div>
  );
};

export default Home;