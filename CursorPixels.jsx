import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CURSOR_PIXEL_COLORS = [
  '#facc15', // yellow-400
  '#fdba74', // orange-300
  '#fef08a', // yellow-200
  '#fb923c', // orange-400
  '#fde047', // yellow-300
  '#fed7aa', // orange-200
  '#fbbf24', // amber-400
  '#f59e0b', // amber-500
];

const CursorPixels = () => {
  const [pixels, setPixels] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const pixelIdRef = React.useRef(0);

  const createPixel = useCallback((x, y) => {
    const id = pixelIdRef.current++;
    const size = Math.random() * 8 + 4; // 4-12px
    const color = CURSOR_PIXEL_COLORS[Math.floor(Math.random() * CURSOR_PIXEL_COLORS.length)];
    const offsetX = (Math.random() - 0.5) * 60; // -30 to 30px
    const offsetY = (Math.random() - 0.5) * 60;
    const duration = Math.random() * 0.8 + 0.4; // 0.4-1.2s
    
    return {
      id,
      x: x + offsetX,
      y: y + offsetY,
      size,
      color,
      duration,
    };
  }, []);

  useEffect(() => {
    let throttleTimer = null;
    let lastTime = 0;
    
    const handleMouseMove = (e) => {
      const now = Date.now();
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Throttle pixel creation to every 30ms for performance
      if (now - lastTime < 30) return;
      lastTime = now;
      
      // Create 2-4 pixels per mouse move
      const numPixels = Math.floor(Math.random() * 3) + 2;
      const newPixels = Array.from({ length: numPixels }, () => 
        createPixel(e.clientX, e.clientY)
      );
      
      setPixels(prev => [...prev, ...newPixels].slice(-50)); // Keep max 50 pixels
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [createPixel]);

  // Clean up old pixels
  useEffect(() => {
    const cleanup = setInterval(() => {
      setPixels(prev => {
        if (prev.length > 0) {
          return prev.slice(1);
        }
        return prev;
      });
    }, 100);
    
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {pixels.map((pixel) => (
          <motion.div
            key={pixel.id}
            initial={{ 
              opacity: 0.8, 
              scale: 0,
              x: pixel.x,
              y: pixel.y,
            }}
            animate={{ 
              opacity: 0,
              scale: 1,
              x: pixel.x + (Math.random() - 0.5) * 20,
              y: pixel.y + (Math.random() - 0.5) * 20,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: pixel.duration,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              width: pixel.size,
              height: pixel.size,
              backgroundColor: pixel.color,
              borderRadius: '1px',
              boxShadow: `0 0 ${pixel.size}px ${pixel.color}40`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CursorPixels;