import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from 'framer-motion';

const FlowerScene = () => {
  const [showFlower, setShowFlower] = useState(false);
  const [riseComplete, setRiseComplete] = useState(false);
  const [showLastShot, setShowLastShot] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const scrollProgressRef = useRef(0);
  
  const { scrollY } = useScroll();
  
  // Track scroll position
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? latest / maxScroll : 0;
      scrollProgressRef.current = progress;
      
      // Show flower starting at 94% scroll
      // We removed the upper bound check so it stays visible at the very end
      if (progress > 0.94) {
        if (!showFlower && !animationStarted) {
          console.log('[FlowerScene] Triggering flower rise at progress:', progress.toFixed(3));
          setAnimationStarted(true);
          setShowFlower(true);
        }
      } else if (progress < 0.90 && showFlower) {
        // Reset when scrolling back up past 90%
        console.log('[FlowerScene] Resetting - scrolled back up');
        setShowFlower(false);
        setRiseComplete(false);
        setShowLastShot(false);
        setGifLoaded(false);
        setAnimationStarted(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    });
    
    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scrollY, showFlower, animationStarted]);
  
  // Handle Rise Animation Timer (0.8s matches CSS transition)
  useEffect(() => {
    let timeout;
    if (showFlower) {
      timeout = setTimeout(() => {
        console.log('[FlowerScene] Rise animation complete');
        setRiseComplete(true);
      }, 800);
    } else {
      setRiseComplete(false);
    }
    return () => clearTimeout(timeout);
  }, [showFlower]);

  // Handle when GIF loads
  const handleGifLoad = () => {
    console.log('[FlowerScene] GIF loaded!');
    setGifLoaded(true);
  };
  
  // Start 9-second timer when rise is complete AND gif is loaded
  useEffect(() => {
    if (riseComplete && gifLoaded && !showLastShot && !timerRef.current) {
      console.log('[FlowerScene] Starting 9-second timer NOW');
      
      timerRef.current = setTimeout(() => {
        console.log('[FlowerScene] 9 seconds complete - showing lastshot');
        setShowLastShot(true);
      }, 9000);
    }
  }, [riseComplete, gifLoaded, showLastShot]);
  
  return (
    <div 
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none overflow-visible"
      style={{ 
        transform: showFlower ? 'translateY(0%)' : 'translateY(120%)',
        transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        opacity: showFlower ? 1 : 0,
      }}
    >
      <div className="relative grid place-items-end justify-center" style={{ lineHeight: 0 }}>
        {/* Debug indicator */}
        <div style={{ 
          position: 'absolute', 
          top: '-40px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: showLastShot ? '#22c55e' : (riseComplete ? (gifLoaded ? '#3b82f6' : '#f97316') : '#9333ea'), 
          color: 'white', 
          padding: '4px 10px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          borderRadius: '4px',
          zIndex: 100,
          whiteSpace: 'nowrap',
          opacity: 0, // Hidden for production
        }}>
          {showLastShot ? '✓ LASTSHOT' : (riseComplete ? (gifLoaded ? '▶ GIF (9s)' : '⏳ LOADING') : '⬆ RISING')}
        </div>
        
        {/* Animated GIF - Fades out after lastshot appears */}
        <img
          src="/flower.gif?v=2"
          alt="Blooming flower"
          onLoad={handleGifLoad}
          style={{ 
            maxWidth: '300px',
            width: 'auto',
            height: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.1))',
            gridArea: '1 / 1',
            opacity: showLastShot ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out 1s', // Wait 1s (while PNG fades in) then fade out
          }}
        />
        
        {/* Static lastshot.png - Fades in on top */}
        <img
          src="/lastshot.png"
          alt="Bloomed flower"
          style={{ 
            maxWidth: '300px',
            width: 'auto',
            height: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.1))',
            gridArea: '1 / 1',
            opacity: showLastShot ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};

export default FlowerScene;