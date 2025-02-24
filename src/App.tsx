import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './app/Home/Home';
import Login from './app/Login_Resigter/Login';
import Register from './app/Login_Resigter/Register';
import Cart from './app/Cart/Cart';
import FeaturedProducts from './app/Product/FeaturedProducts';
import ProductDetail from './app/Product/ProductDetail';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/products" element={<FeaturedProducts />} />
      <Route path='/product/:id' element={<ProductDetail/>}/>
    </Routes>
  );
};

export default App;
