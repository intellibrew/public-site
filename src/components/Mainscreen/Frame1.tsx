import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, useAnimation, useViewportScroll, useTransform } from 'framer-motion';

const Frame = styled.div`
  height: 100vh;
  width: 100%;
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: flex-start;
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

const TextContainer = styled.div`
  position: relative;
  width: 70%; /* Increased width to make it longer on the right */
  padding-left: 2rem; /* Space from the left edge */
  background: transparent; /* Makes the box invisible */
`;

const ContentWrapper = styled(motion.div)`
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const AnimatedText = styled(motion.h1)`
  font-size: 4rem; /* Adjust this size as needed */
  background: ${props => props.theme.colors.gradients.secondary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: ${props => props.theme.fonts.headings};
  margin-bottom: 1rem; /* Space between main text and subtext */
  text-align: left;
`;

const SubText = styled(motion.p)`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text};
  max-width: 100%;
  margin: 0;
  text-align: left;
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
      <TextContainer>
        <ContentWrapper style={{ y }}>
          <AnimatedText
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            transition={{ duration: 1, delay: 0.5 }}
          >
            AI Manufacturing Service that Transforms Designs to Factories
          </AnimatedText>
          <SubText
            initial={{ opacity: 0 }}
            animate={controls}
            transition={{ duration: 1, delay: 1 }}
          >
            End-to-End AI Manufacturing Service for SMEs
          </SubText>
        </ContentWrapper>
      </TextContainer>
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
