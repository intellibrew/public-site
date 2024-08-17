import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 1rem 2rem;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <p>&copy; 2024 Company Name. All rights reserved.</p>
      <p>Contact: info@company.com | +1 (123) 456-7890</p>
    </FooterContainer>
  );
};

export default Footer;