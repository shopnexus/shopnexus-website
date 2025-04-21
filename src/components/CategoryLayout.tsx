import React from "react";

interface CategoryLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const CategoryLayout: React.FC<CategoryLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl text-white py-24">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="animate-fade-in-up">
              <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                {title}
              </h1>
              <p className="text-xl text-gray-100 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Right side - Image */}
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src="/gif_placeholder.gif"
                alt="Category GIF"
                className="rounded-2xl shadow-2xl max-w-full h-auto object-cover border-4 border-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">{children}</div>
      </div>
    </div>
  );
};

export default CategoryLayout;
