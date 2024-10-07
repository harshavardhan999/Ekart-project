import React from 'react';

import Header from './Header';
import SlideShow from './SlideShow';

import styles from './Home.module.css';
import ProductList from './ProductList';




const Home = () => {
 

  return (
    <div className={styles.wholehomepagecontainer}>
      <Header />
     
      <div>
    </div>
    
        <SlideShow />
        <div>
            <ProductList />
        </div>
    </div>
    
  );
};

export default Home;