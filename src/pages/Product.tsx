import React from 'react';
import { motion } from 'framer-motion';
import ProductIntro from '../components/product/productIntro';
import Categories from '../components/product/Categories';
import HorizontalScroll from '../components/product/HorizontalScroll';
import ProductShowcase from '../components/product/ProductShowcase';

const pageVariants = {
  initial: { opacity: 0, y: '100vh' },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: '-100vh' }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

const Product: React.FC = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <ProductIntro />
      <ProductShowcase />
      {/* <Categories /> */}
      <HorizontalScroll />
    </motion.div>
  );
};

export default Product;