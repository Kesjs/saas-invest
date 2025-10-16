import { motion } from 'framer-motion';

const HeroSection = ({ scrollTo }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              Investissez dans l'<span className="text-primary">énergie du futur</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto md:mx-0">
              Rejoignez la révolution énergétique et générez des revenus passifs grâce à nos solutions d'investissement innovantes dans le secteur gazier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-primary/30"
                onClick={() => scrollTo('pricing')}
              >
                Commencer maintenant
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold text-lg transition-all duration-300 backdrop-blur-sm"
                onClick={() => scrollTo('features')}
              >
                En savoir plus
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-1 backdrop-blur-sm">
              <div className="bg-black/50 rounded-xl overflow-hidden border border-white/10">
                <img 
                  src="/images/hero-image.jpg" 
                  alt="Investissement dans l'énergie" 
                  className="w-full h-auto object-cover opacity-90"
                />
              </div>
            </div>
            
            {/* Éléments flottants décoratifs */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full filter blur-xl animate-float"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/20 rounded-full filter blur-xl animate-float animation-delay-2000"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
