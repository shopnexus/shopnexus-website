import React, { ReactNode, useEffect, useRef } from "react";

interface HorizontalScrollProps {
  children: ReactNode;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Ngăn chặn hành vi cuộn dọc mặc định
      e.preventDefault();
      // Chuyển đổi cuộn dọc thành cuộn ngang
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className="overflow-x-auto">
      {children}
    </div>
  );
};

export default HorizontalScroll;
