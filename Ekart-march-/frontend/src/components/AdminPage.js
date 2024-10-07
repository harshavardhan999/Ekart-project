import React, { useState, useEffect } from 'react';
import axios from 'axios';


const UploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    brandName: '',
    productCost: '',
    description: '',
    category: '',
    image: null,
    rating: '',
    quantity: '',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [productData, setProductData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showStock, setShowStock] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/adminproducts');
      setProductData(response.data);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataForUpload = new FormData();
    for (const key in formData) {
      formDataForUpload.append(key, formData[key]);
    }

    try {
      await axios.post('http://localhost:8800/upload', formDataForUpload);

      setFormData({
        title: '',
        brandName: '',
        productCost: '',
        description: '',
        category: '',
        image: null,
        rating: '',
        quantity: '',
      });

      setShowSuccessPopup(true);

      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);

      fetchData(); // Fetch data after submission
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleUpdateProductClick = () => {
    setShowForm(true);
    setShowStock(false);
  };

  const handleStockClick = () => {
    setShowForm(false);
    setShowStock(true);
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []); // Empty dependency array ensures the effect runs once on mount


  return (
    <div className="container mt-5">
    {/* Navigation Bar */}
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <div className="navbar-brand">
          {/* <Logo /> */}
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <button className="btn btn-primary me-2" onClick={handleUpdateProductClick}>
                Update Product
              </button>
            </li>

            <li className="nav-item">
              <button className="btn btn-primary" onClick={handleStockClick}>
                Stock
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    {showForm && (
        <form onSubmit={handleSubmit} style={{ width: "50%" }}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title:</label>
          <input type="text" className="form-control" id="title" name="title" value={formData.title} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="brandName" className="form-label">Brand Name:</label>
          <input type="text" className="form-control" id="brandName" name="brandName" value={formData.brandName} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="productCost" className="form-label">Product Cost:</label>
          <input type="text" className="form-control" id="productCost" name="productCost" value={formData.productCost} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category:</label>
          <input type="text" className="form-control" id="category" name="category" value={formData.category} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image:</label>
          <input type="file" className="form-control" id="image" name="image" onChange={handleFileChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="rating" className="form-label">Rating:</label>
          <input type="text" className="form-control" id="rating" name="rating" value={formData.rating} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="quantity" className="form-label">Quantity:</label>
          <input type="text" className="form-control" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
)}

{showSuccessPopup && (
        <div className="alert alert-success mt-3">
          Product added successfully!
        </div>
      )}

{showStock && (
        <div style={{ width: "50%" }}>
          <h2 className="mt-5">Stock Quantity and Availability</h2>
          <ul className="list-group">
            {productData.map((product, index) => (
              <li key={index} className="list-group-item">
                Product Name: {product.title}, Quantity: {product.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadForm;