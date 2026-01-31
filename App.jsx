import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useTime, AnimatePresence, useInView, animate } from 'framer-motion';
import { ArrowUpRight, X, Menu as MenuIcon, Send, Mail, Github, Heart } from 'lucide-react';
import SensorScene from './SensorScene';

// --- Components ---

// 1. The Amorphic Sun Background
const SunBackground = () => {
  const { scrollY } = useScroll();
  
  // Transform scroll position into shape morphing parameters
  const y1 = useTransform(scrollY, [0, 2000], [0, -150]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.2]);
  const rotate = useTransform(scrollY, [0, 3000], [0, 90]);
  
  const time = useTime();
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-stone-50">
      <motion.div
        style={{ 
          y: y1,
          scale: scale,
          rotate: rotate,
        }}
        className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vw] md:w-[60vw] md:h-[40vw] max-w-[800px] max-h-[600px]"
      >
        <motion.div 
           animate={{
             borderRadius: [
               "60% 40% 30% 70% / 60% 30% 70% 40%",
               "30% 60% 70% 40% / 50% 60% 30% 60%",
               "60% 40% 30% 70% / 60% 30% 70% 40%"
             ],
           }}
           transition={{
             duration: 8,
             ease: "easeInOut",
             repeat: Infinity,
             repeatType: "reverse"
           }}
           className="w-full h-full bg-gradient-to-t from-yellow-400 via-orange-300 to-yellow-100 opacity-80 blur-[80px] md:blur-[120px]"
        />
      </motion.div>
      
      {/* Subtle overlay noise/texture for premium feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply" />
    </div>
  );
};

// 2. The Morphing Brand Symbol (Top Right)
const BrandSymbol = () => {
  return (
    <div className="fixed top-6 right-6 z-50 mix-blend-multiply">
      <div className="relative w-14 h-14">
        {/* Blob 1 - Organic Jello Motion */}
        <motion.div 
          animate={{
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 60% 70% 40% / 50% 60% 30% 60%",
              "40% 80% 60% 50% / 40% 30% 60% 50%",
              "60% 40% 30% 70% / 60% 30% 70% 40%"
            ],
            scale: [1, 1.05, 0.95, 1], // Subtle breathing/squash
            rotate: [0, 5, -5, 0] // Gentle wobble, not spin
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="absolute inset-0 border border-stone-800" 
        />
        
        {/* Blob 2 - Organic Jello Motion (Offset) */}
        <motion.div 
          animate={{
            borderRadius: [
              "50% 50% 33% 67% / 55% 27% 73% 45%",
              "70% 30% 50% 50% / 30% 30% 70% 70%",
              "40% 60% 40% 60% / 40% 50% 50% 50%",
              "50% 50% 33% 67% / 55% 27% 73% 45%"
            ],
            scale: [1, 0.95, 1.05, 1], // Counter-breathing
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 7,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="absolute inset-0 border border-stone-600" 
        />
      </div>
    </div>
  );
};

// 3. Navigation Menu (Bottom Left)
const navLinks = [
  { name: "Learn", hasNew: false },
  { name: "Community", hasNew: false },
  { name: "Support Us", hasNew: false },
  { name: "About", hasNew: false },
];

const Navigation = () => {
  return (
    <nav className="fixed bottom-8 left-8 z-40 hidden md:block">
      <ul className="flex flex-col gap-3">
        {navLinks.map((link) => (
          <motion.li 
            key={link.name}
            whileHover={{ x: 5 }}
            className="group cursor-pointer flex items-center gap-2"
          >
            <span className="font-serif text-lg text-stone-600 group-hover:text-black transition-colors">
              {link.name}
            </span>
            
            {link.hasNew && (
              <span className="bg-yellow-200 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-yellow-800">
                New
              </span>
            )}
          </motion.li>
        ))}
      </ul>
    </nav>
  );
};

// --- Statistics Components ---

const Counter = ({ from, to, duration = 2, suffix = "" }) => {
  const nodeRef = useRef();
  const inView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (inView) {
      const node = nodeRef.current;
      const controls = animate(from, to, {
        duration,
        onUpdate(value) {
          node.textContent = Math.round(value).toLocaleString() + suffix;
        },
        ease: "easeOut"
      });
      return () => controls.stop();
    }
  }, [from, to, duration, inView, suffix]);

  return <span ref={nodeRef} className="font-serif text-4xl md:text-5xl text-stone-800" />;
};

const StatsBlock = ({ data }) => {
  return (
    <div className="w-full bg-white/50 backdrop-blur-sm p-6 md:p-8 rounded-sm border border-stone-200/50 shadow-sm">
      <div className="grid grid-cols-2 gap-8 mb-12">
        {data.counters.map((counter, i) => (
          <div key={i} className="flex flex-col">
            <Counter from={0} to={counter.value} suffix={counter.suffix} />
            <span className="text-xs uppercase tracking-widest text-stone-400 mt-2">{counter.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-6">Global Adoption Rate</h4>
        <div className="relative h-32 w-full">
           <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
             <line x1="0" y1="25" x2="400" y2="25" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="4 4" />
             <line x1="0" y1="50" x2="400" y2="50" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="4 4" />
             <line x1="0" y1="75" x2="400" y2="75" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="4 4" />
             
             <motion.path
               d="M0,100 C100,100 150,80 200,60 C250,40 300,20 400,5"
               fill="none"
               stroke="#ca8a04"
               strokeWidth="3"
               initial={{ pathLength: 0 }}
               whileInView={{ pathLength: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 2, ease: "easeOut" }}
             />
             <motion.path
                d="M0,100 C100,100 150,80 200,60 C250,40 300,20 400,5 L400,100 L0,100 Z"
                fill="url(#gradient)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.2 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
             />
             <defs>
               <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#eab308" />
                 <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
               </linearGradient>
             </defs>
           </svg>
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-6">Annual Earnings (Avg)</h4>
        <div className="flex flex-col gap-4">
           <div className="w-full">
             <div className="flex justify-between text-sm text-stone-500 mb-1">
               <span>Software Engineer</span>
               <span>$115k</span>
             </div>
             <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: "65%" }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-stone-300"
               />
             </div>
           </div>
           
           <div className="w-full">
             <div className="flex justify-between text-sm font-bold text-stone-800 mb-1">
               <span>AI Engineer</span>
               <span>$172k</span>
             </div>
             <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: "95%" }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                 className="h-full bg-yellow-500"
               />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Horizontal Carousel Component ---

const HorizontalScrollCarousel = ({ content }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-55%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-stone-50">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        <div className="absolute top-12 left-6 md:left-24 z-10 pointer-events-none mix-blend-multiply">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="font-serif text-3xl md:text-5xl text-stone-800 mb-2"
             >
               {content.title}
             </motion.h2>
             <motion.p 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="font-sans text-stone-500 text-sm tracking-widest uppercase"
             >
               {content.subtitle}
             </motion.p>
        </div>

        <motion.div style={{ x }} className="flex gap-8 md:gap-16 px-6 md:px-24 pt-24 md:pt-0 items-center">
          
          <div className="min-w-[1rem] md:min-w-[0rem]" />

          {content.items.map((item, i) => (
             <div key={i} className="group relative min-w-[300px] w-[80vw] md:w-[450px] aspect-[3/4] md:aspect-[4/5] bg-white flex-shrink-0 border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                <div className="h-2/3 overflow-hidden bg-stone-200 relative">
                   <img 
                     src={item.img} 
                     alt={item.title} 
                     className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="h-1/3 p-6 flex flex-col justify-center bg-white relative z-20">
                   <h3 className="font-serif text-2xl text-stone-800 mb-3">{item.title}</h3>
                   <p className="font-sans text-stone-500 text-sm leading-relaxed">
                     {item.body}
                   </p>
                </div>
             </div>
          ))}
          
          <div className="min-w-[80vw] md:min-w-[50vw] flex items-center justify-center p-8">
              <motion.p 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="font-serif text-2xl md:text-4xl text-stone-800 text-center leading-relaxed"
              >
                {content.tagline}
              </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


// 4. Content Blocks
const ContentBlock = ({ align = "right", type = "text", content, index }) => {
  if (type === "carousel") {
    return <HorizontalScrollCarousel content={content} />;
  }

  if (type === "partnership") {
     return (
        <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`mb-32 md:mb-64 flex ${align === "left" ? "justify-start" : align === "center" ? "justify-center" : "justify-end"} px-6 md:px-24`}
      >
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className={`relative group overflow-hidden rounded-sm order-1 ${align === "right" ? "md:order-2" : "md:order-1"}`}>
                <div className="bg-stone-200 aspect-[4/3] w-full relative overflow-hidden">
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      src={content.src} 
                      alt="Microcontroller" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                    />
                </div>
            </div>

            {/* Content Side */}
            <div className={`order-2 ${align === "right" ? "md:order-1 md:text-right" : "md:order-2"}`}>
                <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-6 leading-tight">
                    {content.heading}
                </h2>
                <p className="font-sans text-stone-500 leading-relaxed mb-6">
                    {content.body}
                </p>
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Supported By</p>
                    <p className="font-serif text-stone-700">{content.supporters}</p>
                </div>
                <button className="px-8 py-3 rounded-sm font-serif text-lg bg-stone-800 text-stone-50 hover:bg-stone-700 transition-all border border-stone-800">
                    {content.cta}
                </button>
            </div>
        </div>
      </motion.div>
     )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`mb-32 md:mb-64 flex ${align === "left" ? "justify-start" : align === "center" ? "justify-center" : "justify-end"} px-6 md:px-24`}
    >
      <div className={`max-w-xl ${align === "center" ? "text-center w-full" : ""}`}>
        {type === "cta" ? (
             <div className="flex flex-col gap-6">
                 <div className="relative group overflow-hidden rounded-sm shadow-sm">
                    <div className="bg-stone-200 aspect-[4/3] w-full relative overflow-hidden">
                       <motion.img 
                         whileHover={{ scale: 1.05 }}
                         transition={{ duration: 0.6 }}
                         src={content.src} 
                         alt="CTA Visual" 
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                       />
                    </div>
                 </div>
                 <div className={`flex flex-wrap gap-4 ${align === 'left' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end'}`}>
                   {content.buttons.map((btn, i) => (
                     <button key={i} className={`px-8 py-3 rounded-sm font-serif text-lg transition-all border ${btn.primary ? 'bg-stone-800 border-stone-800 text-stone-50 hover:bg-stone-700' : 'border-stone-300 text-stone-600 hover:border-stone-800 hover:text-stone-900 bg-transparent'}`}>
                       {btn.label}
                     </button>
                   ))}
                 </div>
             </div>
        ) : type === "stats" ? (
          <StatsBlock data={content} />
        ) : (
          <div className="prose prose-lg prose-stone">
             <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-6 leading-tight">
               {content.heading}
             </h2>
             <p className="font-sans text-stone-500 leading-relaxed">
               {content.body}
             </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Footer Component ---

const Footer = () => {
    return (
        <footer className="bg-transparent text-stone-600 py-24 px-6 md:px-24 relative z-20 border-t border-stone-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                
                {/* 1. Newsletter */}
                <div className="flex flex-col gap-6">
                    <h3 className="font-serif text-2xl text-stone-900">Newsletter</h3>
                    <p className="text-sm text-stone-500">
                        Get the latest ML Systems insights & updates delivered to your inbox.
                    </p>
                    <div className="flex flex-col gap-2">
                        <input 
                            type="email" 
                            placeholder="email@address.com" 
                            className="bg-white/50 border border-stone-300 p-3 rounded-sm text-stone-900 focus:outline-none focus:border-stone-800 transition-colors placeholder:text-stone-400"
                        />
                        <button className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-stone-50 p-3 rounded-sm font-serif transition-colors">
                            <span>Subscribe</span>
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider">Powered by Buttondown</span>
                </div>

                {/* 2. Contact Form */}
                <div className="flex flex-col gap-6">
                    <h3 className="font-serif text-2xl text-stone-900">Contact Us</h3>
                    <form className="flex flex-col gap-4">
                        <input 
                            type="text" 
                            placeholder="Name" 
                            className="bg-transparent border-b border-stone-300 py-2 text-stone-900 focus:outline-none focus:border-stone-800 transition-colors placeholder:text-stone-400"
                        />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            className="bg-transparent border-b border-stone-300 py-2 text-stone-900 focus:outline-none focus:border-stone-800 transition-colors placeholder:text-stone-400"
                        />
                        <textarea 
                            rows="2"
                            placeholder="Message" 
                            className="bg-transparent border-b border-stone-300 py-2 text-stone-900 focus:outline-none focus:border-stone-800 transition-colors resize-none placeholder:text-stone-400"
                        />
                        <button type="button" className="self-start text-sm text-stone-500 hover:text-stone-900 flex items-center gap-2 transition-colors mt-2">
                            Send Message <Send size={14} />
                        </button>
                    </form>
                </div>

                {/* 3. Secondary Links */}
                <div className="flex flex-col gap-6 md:items-end">
                    <h3 className="font-serif text-2xl text-stone-900">Links</h3>
                    <ul className="flex flex-col gap-4 md:items-end">
                        <li>
                            <a href="#" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
                                <Github size={18} /> GitHub
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
                                <Heart size={18} /> Open Collective
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-stone-500 hover:text-stone-900 transition-colors">
                                Mission
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-stone-500 hover:text-stone-900 transition-colors">
                                Privacy Policy
                            </a>
                        </li>
                    </ul>
                </div>

            </div>

            <div className="mt-24 pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400 gap-4">
                <span>&copy; 2026 TinyML 4D. All rights reserved.</span>
                <span className="font-serif italic text-stone-500">Built for the future of AI.</span>
            </div>
        </footer>
    );
}

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header at top of page
      if (currentScrollY < 50) {
        setIsVisible(true);
        setHasScrolled(false);
        lastScrollY.current = currentScrollY;
        return;
      }
      
      setHasScrolled(true);
      
      // Determine scroll direction
      const scrollDelta = currentScrollY - lastScrollY.current;
      
      // Scrolling down - hide header
      if (scrollDelta > 0 && isVisible) {
        setIsVisible(false);
      }
      // Scrolling up - show header
      else if (scrollDelta < 0 && !isVisible) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  return (
    <motion.header
      initial={{ opacity: 1, y: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -20
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="fixed top-8 left-8 z-40 pointer-events-none"
    >
      <motion.div
        animate={{
          opacity: hasScrolled && isVisible ? 1 : 1
        }}
        className="pointer-events-auto"
      >
        <h1 className="font-serif text-xl text-stone-700 tracking-wide">
          TinyML 4D
        </h1>
        <p className="text-xs font-sans text-stone-400 mt-1 tracking-widest uppercase">
          Learn. Build. Share. Together.
        </p>
      </motion.div>
    </motion.header>
  );
};

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 border-t border-stone-100 md:hidden z-50 flex justify-between items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-serif text-stone-800"
        >
          {isOpen ? <X size={18} /> : <MenuIcon size={18} />}
          <span>{isOpen ? 'Close' : 'Menu'}</span>
        </button>
        
        {!isOpen && (
           <div className="flex gap-4">
             <span className="text-stone-500 text-sm">Learn</span>
             <span className="text-stone-500 text-sm">Community</span>
           </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-stone-50 md:hidden pt-24 px-8 pb-32 flex flex-col justify-end"
          >
            <ul className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-serif text-stone-800"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App Component ---

export default function App() {
  const sections = [
    {
      type: "text",
      align: "center",
      content: {
        heading: "Expanding global access to AI engineering through shared knowledge and hands-on learning.",
        body: "This platform provides open-access textbooks, hardware kits, and software tools to help people learn how to build and deploy machine learning systems. It supports a global community of students and educators through hands-on workshops and monthly forums where members share their real-world AI projects."
      }
    },
    {
      type: "cta",
      align: "right",
      content: {
        src: "https://i.pinimg.com/736x/6c/da/de/6cdadea588409703c9931191c4a99da2.jpg",
        buttons: [
          { label: "Start Learning", primary: true },
          { label: "Join the Community", primary: false }
        ]
      }
    },
    {
      type: "text",
      align: "left",
      content: {
        heading: "Educate a million AI Engineers by 2030.",
        body: "We are democratizing access to high-performance computing education. By providing open tools and curriculum, we aim to bridge the skills gap and empower a new generation of builders to solve global challenges using TinyML."
      }
    },
    {
      type: "stats",
      align: "center",
      content: {
        counters: [
          { label: "Github Stars", value: 18000, suffix: "+" },
          { label: "Countries", value: 22, suffix: "" }
        ]
      }
    },
    {
      type: "carousel",
      content: {
        title: "How to Participate",
        subtitle: "The Three Pillars",
        tagline: "Shared knowledge, collective effort: Democratizing AI systems for everyone, everywhere.",
        items: [
          {
            title: "Learn",
            body: (
              <>
                Access the <a href="https://mlsysbook.ai" target="_blank" rel="noopener noreferrer" className="underline decoration-stone-300 hover:decoration-stone-800 transition-all text-stone-600 hover:text-stone-900">MLSysBook Textbook</a>, hardware kits (Arduino, Seeed, Raspberry Pi), and <a href="https://mlsysbook.ai/tinytorch/" target="_blank" rel="noopener noreferrer" className="underline decoration-stone-300 hover:decoration-stone-800 transition-all text-stone-600 hover:text-stone-900">TinyTorch labs: rebuild PyTorch and learn the foundations of AI</a>.
              </>
            ),
            img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop&sat=-100"
          },
          {
            title: "Participate",
            body: "Join global Applied AI Engineering Workshops or present your work at our monthly Show & Tell.",
            img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop&sat=-100"
          },
          {
            title: "Support",
            body: "Help us expand access to practical AI education in under-resourced regions.",
            img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2670&auto=format&fit=crop&sat=-100"
          }
        ]
      }
    },
    {
      type: "partnership",
      align: "left",
      content: {
        src: "https://images.unsplash.com/photo-1553406830-ef2513450d76?q=80&w=2670&auto=format&fit=crop&sat=-100",
        heading: "Partnerships & Sponsorships",
        body: "We are grateful for the support of our partners who make this global ecosystem possible.",
        supporters: "Edge AI Foundation, ICTP, Seeed",
        cta: "Support our mission"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-yellow-200 selection:text-yellow-900 font-sans relative flex flex-col">
      
      {/* 1. Background Layer */}
      <SunBackground />

      {/* 2. Fixed UI Layer */}
      <Header />
      <BrandSymbol />
      <Navigation />
      <MobileMenu />

      {/* 3. Scrollable Content Layer */}
      <main className="relative z-10 pt-[40vh] flex-grow">
        {sections.map((section, idx) => (
          <ContentBlock 
            key={idx} 
            index={idx}
            type={section.type}
            align={section.align}
            content={section.content}
          />
        ))}
      </main>

      {/* 4. Footer Layer */}
      <Footer />

      {/* 5. Sensor Scene Layer */}
      <SensorScene />
      
    </div>
  );
}
