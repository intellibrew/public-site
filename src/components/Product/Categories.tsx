import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CategoriesContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: ${props => props.theme.colors.background};
`;

const Category = styled(motion.div)`
  width: 200px;
  height: 200px;
  background-color: ${props => props.theme.colors.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const CategoryText = styled.h3`
  color: ${props => props.theme.colors.background};
  font-size: 1.5rem;
`;

const Categories: React.FC = () => {
  const categories = ['Category 1', 'Category 2', 'Category 3'];

  return (
    <CategoriesContainer>
      {categories.map((category, index) => (
        <Category
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          whileHover={{ scale: 1.1 }}
        >
          <CategoryText>{category}</CategoryText>
        </Category>
      ))}
    </CategoriesContainer>
  );
};

export default Categories;