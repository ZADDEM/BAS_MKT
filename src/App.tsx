import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Instagram, 
  MapPin, 
  Phone, 
  Calendar, 
  ChevronRight, 
  Star, 
  Menu, 
  X,
  Clock,
  CheckCircle2,
  Heart
} from 'lucide-react';

// --- Components ---

const GlitterBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random();
        this.color = `rgba(224, 191, 184, ${this.opacity})`; // Rose gold light
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;

        this.opacity += (Math.random() - 0.5) * 0.05;
        if (this.opacity < 0) this.opacity = 0;
        if (this.opacity > 1) this.opacity = 1;
        this.color = `rgba(224, 191, 184, ${this.opacity})`;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  );
};

const Logo = () => (
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="relative w-48 h-48 mx-auto mb-8"
  >
    {/* Outer Ring */}
    <div className="absolute inset-0 rounded-full border-4 border-rosegold shadow-[0_0_20px_rgba(183,110,121,0.5)] bg-wine/40 backdrop-blur-sm" />
    
    {/* Glittery Inner Circle */}
    <div className="absolute inset-2 rounded-full bg-wine overflow-hidden glitter-bg">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        {/* Wings Icon */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 60" className="w-20 h-auto fill-white mb-2">
            <path d="M50 50 C20 50 10 20 10 10 C30 20 40 40 50 50 Z M50 50 C80 50 90 20 90 10 C70 20 60 40 50 50 Z" />
          </svg>
        </motion.div>
        
        <h1 className="font-serif text-lg leading-tight text-rosegold-light">
          Beauty Art Studio
        </h1>
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-rosegold opacity-80 mt-1">
          PMU & Skin Lab
        </p>
      </div>
    </div>
    
    {/* Shine Effect */}
    <motion.div 
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
    />
  </motion.div>
);

const ServiceCard = ({ title, description, price, icon: Icon }: { title: string, description: string, price: string, icon: any }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-wine/40 backdrop-blur-md border border-rosegold/20 rounded-2xl p-6 mb-4"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-rosegold/10 text-rosegold">
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3 className="font-serif text-xl text-rosegold-light mb-1">{title}</h3>
        <p className="text-sm text-white/60 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-rosegold font-semibold">{price}</span>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="text-xs uppercase tracking-widest text-rosegold-light flex items-center gap-1"
          >
            Detalles <ChevronRight size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans selection:bg-rosegold/30">
      <GlitterBackground />
      
      {/* Background Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03]">
        <svg viewBox="0 0 100 60" className="w-[150%] h-auto fill-rosegold rotate-[-15deg]">
          <path d="M50 50 C20 50 10 20 10 10 C30 20 40 40 50 50 Z M50 50 C80 50 90 20 90 10 C70 20 60 40 50 50 Z" />
        </svg>
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-wine/80 backdrop-blur-lg border-b border-rosegold/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-rosegold flex items-center justify-center">
            <span className="text-[10px] font-serif text-rosegold">BAS</span>
          </div>
          <span className="font-serif text-sm tracking-wider text-rosegold-light">Beauty Art Studio</span>
        </div>
        
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-rosegold p-1"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-wine flex flex-col items-center justify-center gap-8"
          >
            {['Inicio', 'Servicios', 'Skin Lab', 'Testimonios', 'Contacto'].map((item) => (
              <button 
                key={item}
                onClick={() => setIsMenuOpen(false)}
                className="font-serif text-3xl text-rosegold-light hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-24 pb-12 px-6 max-w-md mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Logo />
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-serif text-4xl md:text-5xl mb-4 leading-tight"
          >
            Realza tu <span className="glitter-text">Belleza Natural</span>
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/70 mb-10 text-lg font-light"
          >
            Especialistas en PMU y Skin Lab con estándares de lujo y precisión artística.
          </motion.p>
          
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group overflow-hidden bg-rosegold text-wine font-bold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(183,110,121,0.4)] transition-all"
          >
            <div className="relative z-10 flex items-center gap-2">
              <Calendar size={20} />
              RESERVAR AHORA
            </div>
            {/* Button Shine Animation */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
            />
          </motion.button>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl text-rosegold-light">Nuestros Servicios</h2>
            <Sparkles className="text-rosegold animate-pulse" size={20} />
          </div>
          
          <div className="space-y-4">
            <ServiceCard 
              title="Microblading"
              description="Cejas perfectas pelo a pelo con acabado hiper-realista."
              price="Desde $250"
              icon={CheckCircle2}
            />
            <ServiceCard 
              title="Lip Blush"
              description="Color y definición natural para tus labios 24/7."
              price="Desde $300"
              icon={Heart}
            />
            <ServiceCard 
              title="Skin Lab Facial"
              description="Tratamientos avanzados de rejuvenecimiento y limpieza profunda."
              price="Desde $120"
              icon={Sparkles}
            />
            <ServiceCard 
              title="Powder Brows"
              description="Efecto sombreado elegante para una mirada definida."
              price="Desde $280"
              icon={Star}
            />
          </div>
        </section>

        {/* Why Us Section */}
        <section className="mb-16 bg-rosegold/5 rounded-3xl p-8 border border-rosegold/10">
          <h2 className="font-serif text-2xl text-rosegold-light mb-6 text-center">¿Por qué elegirnos?</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-wine/60 rounded-full flex items-center justify-center mx-auto mb-3 text-rosegold">
                <Clock size={24} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Experiencia</h4>
              <p className="text-[10px] text-white/50">+5 años de trayectoria</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-wine/60 rounded-full flex items-center justify-center mx-auto mb-3 text-rosegold">
                <Star size={24} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Calidad</h4>
              <p className="text-[10px] text-white/50" >Pigmentos Premium</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-rosegold-light mb-8 text-center">Lo que dicen nuestras clientas</h2>
          <div className="relative bg-wine/20 p-6 rounded-2xl border-l-4 border-rosegold italic text-sm text-white/80">
            "Increíble experiencia. Mis cejas nunca se vieron tan naturales y hermosas. El estudio es un oasis de lujo."
            <div className="mt-4 flex items-center gap-2 not-italic">
              <div className="w-8 h-8 rounded-full bg-rosegold/20" />
              <div>
                <p className="text-xs font-bold text-rosegold-light">Elena Rodríguez</p>
                <div className="flex text-rosegold">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer / Contact */}
        <footer className="text-center pt-8 border-t border-rosegold/10">
          <div className="flex justify-center gap-6 mb-8">
            <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-rosegold"><Instagram /></motion.a>
            <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-rosegold"><Phone /></motion.a>
            <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-rosegold"><MapPin /></motion.a>
          </div>
          
          <p className="text-rosegold-light font-serif text-xl mb-2">Beauty Art Studio</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-8">Luxury PMU & Skin Lab</p>
          
          <div className="text-[10px] text-white/30 space-y-1">
            <p>© 2026 Beauty Art Studio. Todos los derechos reservados.</p>
            <p>Diseñado para la excelencia estética.</p>
          </div>
        </footer>
      </main>

      {/* Floating Action Button for Mobile */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-rosegold text-wine rounded-full shadow-2xl flex items-center justify-center"
      >
        <Phone size={24} />
      </motion.button>
    </div>
  );
}
