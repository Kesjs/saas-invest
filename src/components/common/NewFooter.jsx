import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const NewFooter = () => {
  const currentYear = new Date().getFullYear();
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, 
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  const footerLinks = [
    {
      title: "Investissement",
      links: [
        { name: "Comment ça marche", to: "/#how-it-works" },
        { name: "Nos offres", to: "/invest" },
        { name: "Témoignages", to: "/#testimonials" },
        { name: "FAQ", to: "/faq" }
      ]
    },
    {
      title: "Entreprise",
      links: [
        { name: "À propos", to: "/about" },
        { name: "Notre équipe", to: "/team" },
        { name: "Carrières", to: "/careers" },
        { name: "Blog", to: "/blog" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Centre d'aide", to: "/help" },
        { name: "Contactez-nous", to: "/contact" },
        { name: "Statut du service", to: "/status" },
        { name: "Assistance 24/7", to: "/support" }
      ]
    },
    {
      title: "Légal",
      links: [
        { name: "Politique de confidentialité", to: "/privacy" },
        { name: "Conditions d'utilisation", to: "/terms" },
        { name: "Mentions légales", to: "/legal" },
        { name: "Politique de cookies", to: "/cookies" }
      ]
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, to: "https://facebook.com" },
    { icon: <Twitter className="w-5 h-5" />, to: "https://twitter.com" },
    { icon: <Instagram className="w-5 h-5" />, to: "https://instagram.com" },
    { icon: <Linkedin className="w-5 h-5" />, to: "https://linkedin.com" }
  ];

  return (
    <motion.footer 
      className="bg-gradient-to-t from-gray-900 to-black border-t border-white/10 pt-16 pb-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Logo et description */}
          <motion.div 
            className="lg:col-span-2"
            custom={0}
            variants={fadeInUp}
          >
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-primary to-indigo-500 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Gazoduc Invest
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Plateforme d'investissement innovante dans le Gaz Naturel Liquéfié (GNL). 
              Profitez de rendements attractifs et sécurisés.
            </p>
            
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  custom={index}
                  variants={fadeInUp}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            {/* Coordonnées */}
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-400 text-sm">
                  123 Rue de l'Innovation<br />
                  75001 Paris, France
                </p>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <a href="mailto:contact@gazoduc-invest.com" className="text-gray-400 hover:text-white text-sm transition-colors">
                  contact@gazoduc-invest.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <a href="tel:+33123456789" className="text-gray-400 hover:text-white text-sm transition-colors">
                  +33 1 23 45 67 89
                </a>
              </div>
            </div>
          </motion.div>

          {/* Liens de navigation */}
          {footerLinks.map((section, index) => (
            <motion.div 
              key={section.title}
              custom={index + 1}
              variants={fadeInUp}
            >
              <h4 className="font-semibold text-white mb-4 text-lg">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.to}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Bas de page */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.p 
            className="text-gray-500 text-sm mb-4 md:mb-0"
            custom={5}
            variants={fadeInUp}
          >
            © {currentYear} Gazoduc Invest. Tous droits réservés.
          </motion.p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
            <span className="text-gray-600">•</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <span className="text-gray-600">•</span>
            <Link to="/cookies" className="hover:text-white transition-colors">Politique des cookies</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default NewFooter;
