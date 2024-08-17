import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background-image: url('/path-to-about-image.jpg');
  background-size: cover;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
`;

const AnimatedText = styled(motion.p)`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: 2rem;
`;

const ContactForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled(motion.input)`
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: ${props => props.theme.colors.text};
  font-size: 1rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const TextArea = styled(motion.textarea)`
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  resize: vertical;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 1rem 2rem;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  align-self: center;
`;

const AboutUs: React.FC = () => {
  return (
    <AboutContainer>
      <GlassCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <AnimatedText
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Ready to take the leap?
          Get in touch!
        </AnimatedText>
        <ContactForm
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Input
            type="text"
            placeholder="Name"
            whileFocus={{ scale: 1.05 }}
          />
          <Input
            type="email"
            placeholder="Email"
            whileFocus={{ scale: 1.05 }}
          />
          <TextArea
            placeholder="Message"
            rows={4}
            whileFocus={{ scale: 1.05 }}
          />
          <SubmitButton
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Message
          </SubmitButton>
        </ContactForm>
      </GlassCard>
    </AboutContainer>
  );
};

export default AboutUs;