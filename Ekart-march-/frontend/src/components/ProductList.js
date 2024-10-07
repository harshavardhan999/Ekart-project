import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from  './ProductList.module.css';
import axios from 'axios';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/allproducts');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.productlistcontainer}>
      {products.map(product => (
  <Link to={`/productdetails/${product.id}`} key={product.id} className={styles.productLink}>
    <div className={styles.productitem}>
      <img
        src={`http://localhost:8800/${product.image_path}`}
        alt={product.title}
      />
      <p>{product.title}</p>
      <p>Rs.{product.product_cost}</p>
      <button className={styles.addToCartBtn}>
              <ShoppingCartIcon className={styles.cartIcon}/> Add to Cart
            </button>
    </div>
  </Link>
))}

    </div>
  );
};

export default ProductList;

