import { motion } from 'framer-motion';
import { TrendingUp, Zap, Award, Flame } from 'lucide-react';

const PricingSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  const plans = [
    {
      name: 'Starter',
      capital: 32,
      daily: 0.48,
      monthly: 9.6,
      total: 96,
      badge: 'Débutant',
      icon: Zap,
      popular: false
    },
    {
      name: 'Croissance',
      capital: 75,
      daily: 1.12,
      monthly: 22.5,
      total: 225,
      badge: 'Populaire',
      icon: TrendingUp,
      popular: true
    },
    {
      name: 'Premium',
      capital: 999,
      daily: 14.99,
      monthly: 299.8,
      total: 2997,
      badge: 'Avancé',
      icon: Award,
      popular: false
    },
    {
      name: 'Elite',
      capital: 1999,
      daily: 29.99,
      monthly: 599.8,
      total: 5997,
      badge: 'VIP',
      icon: Flame,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-black/80 to-black/50 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px 0px" }}
          variants={fadeInUp}
        >
          <span className="inline-block px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
            Nos offres
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Choisissez votre plan d'investissement
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Sélectionnez le forfait qui correspond à vos objectifs financiers et commencez à générer des revenus dès aujourd'hui.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px 0px" }}
                variants={fadeInUp}
                className={`relative rounded-2xl overflow-hidden border ${
                  plan.popular 
                    ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5' 
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Populaire
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <span className="text-sm text-gray-400">{plan.badge}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.capital}</span>
                    <span className="text-gray-400"> / investissement</span>
                  </div>
                  
                  <div className="space-y-3 mb-8 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Retour quotidien:</span>
                      <span className="font-medium">${plan.daily}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retour mensuel:</span>
                      <span className="font-medium">${plan.monthly}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total après 100 jours:</span>
                      <span className="font-medium">${plan.total}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Choisir {plan.name}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div 
          className="mt-16 text-center text-gray-400 text-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px 0px" }}
          variants={fadeInUp}
        >
          <p>Vous avez besoin d'une solution personnalisée ? <a href="/contact" className="text-primary hover:underline">Contactez-nous</a></p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
