import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const featureTags = [
  { name: "Sneakers", href: "/tags/sneakers" },
  { name: "Running", href: "/tags/running" },
  { name: "Athletic", href: "/tags/athletic" },
  { name: "Boots", href: "/tags/boots" },
  { name: "Sandals", href: "/tags/sandals" },
  { name: "Heels", href: "/tags/heels" },
  { name: "School Shoes", href: "/tags/school" },
  { name: "Sports", href: "/tags/sports" },
];

const CategoryIcon = ({ name }) => {
  const icons = {
    Sneakers: "👟",
    Running: "🏃‍♂️",
    Athletic: "🏋️‍♂️",
    Boots: "🥾",
    Sandals: "🩴",
    Heels: "👠",
    "School Shoes": "🎒",
    Sports: "⚽️",
  };

  return <span className="text-3xl">{icons[name]}</span>;
};

export const FeatureCategory = () => {
  const [visibleTags, setVisibleTags] = useState(featureTags);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
    
        setVisibleTags(featureTags.slice(0, 4));

      }
        else if (window.innerWidth < 768) {
            setVisibleTags(featureTags.slice(0, 4));
        } else if (window.innerWidth < 1024) {
            setVisibleTags(featureTags.slice(0, 6));
        } 
      else {
        setVisibleTags(featureTags);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize); 

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="w-full py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
          Feature Categories
        </h2>
        <div className="flex items-center justify-between gap-4">
          {visibleTags.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="flex flex-col items-center min-w-[100px] group"
            >
              <div className="rounded-full shadow-md p-4 transform transition-transform duration-300 group-hover:scale-110 hover:rotate-12">
                <CategoryIcon name={category.name} />
              </div>
              <span className="mt-2 text-sm text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
