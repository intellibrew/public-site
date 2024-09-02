import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation, useViewportScroll, useTransform } from 'framer-motion';

const Frame = styled.div`
  height: 100vh;
  width: 100%;
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const GradientOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.gradients.secondary};
  mix-blend-mode: overlay;
`;

const ContentWrapper = styled(motion.div)`
  text-align: center;
  z-index: 2;
`;

const AnimatedText = styled(motion.h2)`
  font-size: 4rem;
  background: ${props => props.theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: ${props => props.theme.fonts.headings};
  margin-bottom: 2rem;
`;

const SubText = styled(motion.p)`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text};
  max-width: 600px;
  margin: 0 auto;
`;

const Frame2: React.FC = () => {
  const controls = useAnimation();
  const { scrollY } = useViewportScroll();
  const y = useTransform(scrollY, [300, 600], [0, -100]);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <Frame>
      <GradientOverlay 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
      />
      <ContentWrapper style={{ y }}>
        <AnimatedText
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Innovate. Create. Transform.
        </AnimatedText>
        <SubText
          initial={{ opacity: 0 }}
          animate={controls}
          transition={{ duration: 1, delay: 1 }}
        >
          Pushing the boundaries of what's possible
        </SubText>
      </ContentWrapper>
    </Frame>
  );
};

export default Frame2;