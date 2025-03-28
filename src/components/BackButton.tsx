import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5"; // Import icon từ react-icons
import Button from "./ui/Button";

const BackButton: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (location.pathname === "/") return null;

  return (
    <Button
      onClick={() => navigate(-1)}
      className="fixed top-4 left-4 z-50 flex items-center justify-center gap-2 
                 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 
                 rounded-full shadow-md hover:shadow-lg 
                 transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      <IoArrowBack className="text-lg" /> 
    </Button>
  );
};

export default BackButton;