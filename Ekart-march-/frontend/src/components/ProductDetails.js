import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8800/product/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="product-details-container">
      <img
              src={`http://localhost:8800/${product.image_path}`}
              alt={product.title}
            />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Rs.{product.product_cost}</p>
    </div>
  );
};

export default ProductDetails;
