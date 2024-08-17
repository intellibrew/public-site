import React, { useEffect, useRef } from 'react';
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
  background: ${props => props.theme.colors.gradients.primary};
  mix-blend-mode: overlay;
`;

const ContentWrapper = styled(motion.div)`
  text-align: center;
  z-index: 2;
`;

const AnimatedText = styled(motion.h1)`
  font-size: 6rem;
  background: ${props => props.theme.colors.gradients.secondary};
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

const ScrollPrompt = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Frame1: React.FC = () => {
  const controls = useAnimation();
  const { scrollY } = useViewportScroll();
  const y = useTransform(scrollY, [0, 300], [0, -100]);
  
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <Frame ref={ref}>
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
          The Future is Now
        </AnimatedText>
        <SubText
          initial={{ opacity: 0 }}
          animate={controls}
          transition={{ duration: 1, delay: 1 }}
        >
          Test website
        </SubText>
      </ContentWrapper>
      {/* <ScrollPrompt
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
      >
        Scroll to Explore
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ↓
        </motion.div>
      </ScrollPrompt> */}
    </Frame>
  );
};

export default Frame1;