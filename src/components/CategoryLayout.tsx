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
      <div className="relative bg-gray-50 shadow-xl text-black py-20">
        <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Text content */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              <p className="text-lg text-gray-700">{description}</p>
            </div>

<img
  src="/gif_placeholder.gif" 
  alt="Category GIF"
  className="rounded-lg shadow-xl max-w-full h-auto object-cover"
/>
            </div>

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