import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ShowcaseContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  padding: 4rem 2rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
`;

const ProductCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
`;

const ProductImage = styled(motion.img)`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1rem;
`;

const ProductTitle = styled.h3`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const ProductDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
`;

interface Product {
  id: number;
  title: string;
  image: string;
  description: string;
}

const products: Product[] = [
  { id: 1, title: 'Category 1', image: './photo1.png', description: 'Some text' },
  { id: 2, title: 'Category 2', image: './photo2.png', description: 'Some more text' },
  { id: 3, title: 'Category 3', image: './photo3.png', description: 'Even more text' },
  // Add more products as needed
];

const ProductShowcase: React.FC = () => {
  return (
    <ShowcaseContainer>
      <ProductGrid>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ProductImage
              src={product.image}
              alt={product.title}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            />
            <ProductTitle>{product.title}</ProductTitle>
            <ProductDescription>{product.description}</ProductDescription>
          </ProductCard>
        ))}
      </ProductGrid>
    </ShowcaseContainer>
  );
};

export default ProductShowcase;