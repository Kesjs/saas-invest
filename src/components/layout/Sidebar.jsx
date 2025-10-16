import { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { 
  HomeIcon,
  CreditCardIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  UserGroupIcon, 
  CogIcon, 
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Investissements', 
    href: '/invest', 
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Nouvel investissement', href: '/invest/new' },
      { name: 'Mes investissements', href: '/invest/list' },
    ]
  },
  { 
    name: 'Transactions', 
    href: '#', 
    icon: CreditCardIcon,
    children: [
      { name: 'Dépôt', href: '/deposit' },
      { name: 'Retrait', href: '/withdraw' },
      { name: 'Historique', href: '/transactions' },
    ]
  },
  { 
    name: 'Parrainage', 
    href: '/referral', 
    icon: UserGroupIcon,
    children: [
      { name: 'Mon lien de parrainage', href: '/referral/link' },
      { name: 'Mes filleuls', href: '/referral/team' },
      { name: 'Commissions', href: '/referral/commissions' },
    ]
  },
  { 
    name: 'Rapports', 
    href: '/reports', 
    icon: ChartBarIcon,
    children: [
      { name: 'Bilan des gains', href: '/reports/earnings' },
      { name: 'Performances', href: '/reports/performance' },
    ]
  },
  { name: 'Paramètres', href: '/settings', icon: CogIcon },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-full flex-col bg-gray-800">
      <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">
          <span className="text-purple-400">Gazoduc</span> Invest
        </h1>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <Disclosure as="div" className="space-y-1">
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        className={`${
                          isActive(item.href) || item.children.some(child => isActive(child.href))
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } group w-full flex items-center pl-2 pr-1 py-2 text-left rounded-md text-sm font-medium focus:outline-none`}
                      >
                        <item.icon
                          className={`${
                            isActive(item.href) || item.children.some(child => isActive(child.href))
                              ? 'text-purple-400'
                              : 'text-gray-400 group-hover:text-gray-300'
                          } mr-3 flex-shrink-0 h-5 w-5`}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                        {open ? (
                          <ArrowUpIcon className="ml-3 h-4 w-4 text-gray-400" />
                        ) : (
                          <ArrowDownIcon className="ml-3 h-4 w-4 text-gray-400" />
                        )}
                      </Disclosure.Button>
                      <Disclosure.Panel className="space-y-1 pl-9 pr-2">
                        {item.children.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.href}
                            className="block px-2 py-1.5 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                            activeClassName="bg-gray-700 text-white"
                          >
                            {subItem.name}
                          </NavLink>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ) : (
                <NavLink
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      isActive(item.href) ? 'text-purple-400' : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
        <button
          onClick={logout}
          className="group flex-shrink-0 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500 hover:bg-opacity-10 rounded-md transition-colors duration-150"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-white" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
