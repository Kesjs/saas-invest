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
      price: 100,
      badge: 'Parfait pour débuter',
      icon: Zap,
      popular: false,
      features: [
        'Retour sur investissement garanti',
        'Support prioritaire',
        'Accès à la plateforme',
        'Rapports mensuels'
      ]
    },
    {
      name: 'Croissance',
      price: 225,
      badge: 'Meilleur choix',
      icon: TrendingUp,
      popular: true,
      features: [
        'Tout dans Starter, plus:',
        'Retour sur investissement supérieur',
        'Support 24/7',
        'Analyse personnalisée',
        'Rapports hebdomadaires'
      ]
    },
    {
      name: 'Premium',
      price: 999,
      fee: 30,
      badge: 'Investisseur avancé',
      icon: Award,
      popular: false,
      features: [
        'Tout dans Croissance, plus:',
        'Gestion de portefeuille personnalisée',
        'Rencontres trimestrielles',
        'Accès anticipé aux opportunités',
        'Rapports détaillés',
        'Assistance VIP dédiée'
      ]
    },
    {
      name: 'Élite',
      price: 1999,
      fee: 30,
      badge: 'Investisseur professionnel',
      icon: Flame,
      popular: false,
      features: [
        'Tout dans Premium, plus:',
        'Stratégie d\'investissement sur mesure',
        'Rencontres mensuelles',
        'Accès exclusif aux opportunités',
        'Rapports personnalisés',
        'Conseiller personnel dédié',
        'Invitations aux événements VIP'
      ]
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
                
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <span className="text-sm text-primary">{plan.badge}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      {plan.fee && (
                        <span className="text-gray-400"> + ${plan.fee} de frais</span>
                      )}
                      <span className="block text-sm text-gray-400 mt-1">Investissement unique</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6 text-sm text-gray-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mt-auto ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Souscrire {plan.name}
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
