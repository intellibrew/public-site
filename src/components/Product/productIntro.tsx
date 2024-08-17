import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const IntroContainer = styled.div`
  height: 100vh;
  width: 100%;
  background-image: url('/path-to-product-image.jpg');
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IntroText = styled(motion.h2)`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.secondary};
`;

const ProductIntro: React.FC = () => {
  return (
    <IntroContainer>
      <IntroText
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        Introducing Our Product
      </IntroText>
    </IntroContainer>
  );
};

export default ProductIntro;