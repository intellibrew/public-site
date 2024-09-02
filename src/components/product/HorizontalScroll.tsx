import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';

const ScrollContainer = styled(motion.div)`
  display: flex;
  overflow-x: hidden;
  padding: 2rem 0;
  background-color: ${props => props.theme.colors.background};
`;

const ScrollItem = styled(motion.div)`
  flex: 0 0 auto;
  width: 300px;
  height: 400px;
  margin-right: 20px;
  background-color: ${props => props.theme.colors.secondary};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${props => props.theme.colors.background};
  cursor: pointer;
`;

const HorizontalScroll: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    };

    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (currentScrollRef) {
        currentScrollRef.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <ScrollContainer ref={scrollRef}>
      {items.map((item, index) => (
        <ScrollItem
          key={index}
          initial={{ opacity: 0, x: 100 }}
          animate={controls}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onViewportEnter={() => {
            controls.start({ opacity: 1, x: 0, transition: { duration: 0.5 } });
          }}
        >
          Item {item}
        </ScrollItem>
      ))}
    </ScrollContainer>
  );
};

export default HorizontalScroll;