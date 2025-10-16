import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/70 border-b border-white/10 z-50">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="text-gray-400 hover:text-white focus:outline-none lg:hidden"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex-1 flex justify-between items-center">
          <div className="flex-1 flex items-center justify-end space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
            >
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800">
                  <span className="sr-only">New notifications</span>
                </span>
              </div>
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold shadow-glow">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-200 hidden md:block">
                    {user?.firstName || 'Utilisateur'}
                  </span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 bg-black/80 backdrop-blur border border-white/10 focus:outline-none z-50">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/profile"
                        className={`${active ? 'bg-white/10' : ''} block px-4 py-2 text-sm text-gray-200`}
                      >
                        Mon Profil
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/settings"
                        className={`${active ? 'bg-white/10' : ''} block px-4 py-2 text-sm text-gray-200`}
                      >
                        Paramètres
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${active ? 'bg-white/10' : ''} w-full text-left block px-4 py-2 text-sm text-red-400`}
                      >
                        Déconnexion
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
