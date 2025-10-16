import { motion } from 'framer-motion';
import { DollarSign, Shield, Zap, Users, Clock, Globe } from 'lucide-react';

const FeaturesSection = () => {
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

  const features = [
    {
      icon: DollarSign,
      title: 'Revenus quotidiens',
      description: 'Recevez vos gains automatiquement chaque jour'
    },
    {
      icon: Shield,
      title: 'Sécurité blockchain',
      description: 'Vos transactions sont cryptées et vérifiables'
    },
    {
      icon: Zap,
      title: 'Retours rapides',
      description: 'Générez des rendements compétitifs sur vos investissements'
    },
    {
      icon: Users,
      title: 'Équipe expérimentée',
      description: 'Notre équipe gère vos investissements avec expertise'
    },
    {
      icon: Clock,
      title: 'Disponible 24/7',
      description: 'Accédez à votre compte et gérez vos investissements à tout moment'
    },
    {
      icon: Globe,
      title: 'Accès mondial',
      description: 'Investissez depuis n\'importe où dans le monde'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-black/50 to-black/80 relative overflow-hidden">
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
            Nos atouts
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pourquoi choisir Gazoduc Invest ?
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Découvrez les avantages de notre plateforme d'investissement innovante
            conçue pour maximiser vos rendements tout en minimisant les risques.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px 0px" }}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
