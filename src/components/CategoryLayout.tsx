import React from 'react';

interface CategoryLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const CategoryLayout: React.FC<CategoryLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-gray-300">{description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
};

export default CategoryLayout; 