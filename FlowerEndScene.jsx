import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

const FlowerEndScene = () => {
  const containerRef = useRef(null);
  
  // Track scroll progress of this specific section relative to the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Fade in opacity from 0 to 1 as the section enters the view
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full pointer-events-none"
    >
      {/* Fixed Background Layer that fades in */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{
          opacity,
          background: 'linear-gradient(to top, #bae6fd, #3b82f6)'
        }}
      />
    </section>
  );
};

export default FlowerEndScene;