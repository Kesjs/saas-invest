import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

// Options de méthode de paiement
const paymentMethods = [
  { id: 'crypto', name: 'Crypto-monnaie', icon: '🪙' },
  { id: 'bank', name: 'Virement bancaire', icon: '🏦' },
  { id: 'card', name: 'Carte bancaire', icon: '💳' },
];

// Cryptomonnaies supportées
const cryptocurrencies = [
  { id: 'btc', name: 'Bitcoin (BTC)', icon: '₿' },
  { id: 'eth', name: 'Ethereum (ETH)', icon: 'Ξ' },
  { id: 'usdt', name: 'Tether (USDT)', icon: '₮' },
  { id: 'usdc', name: 'USD Coin (USDC)', icon: 'ⓤ' },
];

const DepositPage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Récupérer l'adresse de portefeuille de l'utilisateur
  const { data: userWallet, isLoading: isLoadingWallet } = useQuery(
    ['userWallet'],
    async () => {
      const response = await api.get('/api/wallet/address');
      return response.data;
    },
    {
      onError: (error) => {
        console.error('Error fetching wallet address:', error);
      },
    }
  );

  // Récupérer l'historique des dépôts
  const { data: depositHistory = [], refetch: refetchDeposits } = useQuery(
    ['depositHistory'],
    async () => {
      const response = await api.get('/api/transactions/deposits');
      return response.data;
    },
    {
      onError: (error) => {
        console.error('Error fetching deposit history:', error);
      },
    }
  );

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Envoyer la demande de dépôt
      const response = await api.post('/api/transactions/deposit', {
        amount: depositAmount,
        method: selectedMethod,
        currency: selectedCrypto,
      });
      
      // Mettre à jour l'historique
      await refetchDeposits();
      
      // Afficher le message de succès
      setSuccess('Votre demande de dépôt a été enregistrée avec succès');
      
      // Réinitialiser le formulaire
      setAmount('');
      
    } catch (err) {
      console.error('Deposit error:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors du dépôt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Afficher un message de confirmation (à implémenter avec un toast)
    alert('Adresse copiée dans le presse-papier');
  };

  if (isLoadingWallet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dépôt de fonds</h1>
        <p className="mt-1 text-gray-400">
          Ajoutez des fonds à votre compte pour commencer à investir
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de dépôt */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">Méthode de paiement</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    selectedMethod === method.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-purple-500/50'
                  } transition-colors`}
                >
                  <span className="text-2xl mb-2">{method.icon}</span>
                  <span className="text-sm font-medium text-white">{method.name}</span>
                </button>
              ))}
            </div>

            {selectedMethod === 'crypto' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Sélectionnez une cryptomonnaie</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cryptocurrencies.map((crypto) => (
                    <button
                      key={crypto.id}
                      type="button"
                      onClick={() => setSelectedCrypto(crypto.id)}
                      className={`flex items-center justify-center p-3 rounded-lg border ${
                        selectedCrypto === crypto.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-purple-500/50'
                      } transition-colors`}
                    >
                      <span className="text-lg mr-2">{crypto.icon}</span>
                      <span className="text-sm font-medium">{crypto.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleDepositSubmit}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Montant du dépôt ({selectedMethod === 'crypto' ? 'USD' : 'EUR'})
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 sm:text-sm">
                      {selectedMethod === 'crypto' ? '$' : '€'}
                    </span>
                  </div>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="block w-full pl-8 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    aria-describedby="amount-currency"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 sm:text-sm" id="amount-currency">
                      {selectedMethod === 'crypto' ? 'USDT' : 'EUR'}
                    </span>
                  </div>
                </div>
                {amount && selectedMethod === 'crypto' && (
                  <p className="mt-1 text-xs text-gray-400">
                    ≈ {amount * 0.00002} BTC • {amount * 0.0003} ETH
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-md">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !amount}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement en cours...' : 'Procéder au paiement'}
              </button>
            </form>
          </div>

          {/* Instructions pour le dépôt */}
          {selectedMethod === 'crypto' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-medium text-white mb-4">Instructions pour le dépôt en crypto</h2>
              <ol className="space-y-4 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">1</span>
                  <span>Envoyez uniquement {cryptocurrencies.find(c => c.id === selectedCrypto)?.name} à l'adresse ci-dessous</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">2</span>
                  <span>Confirmez votre transaction dans votre portefeuille</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">3</span>
                  <span>Attendez la confirmation du réseau (généralement 2-30 minutes)</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">4</span>
                  <span>Les fonds seront crédités sur votre compte après confirmation</span>
                </li>
              </ol>
              
              {userWallet && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">Votre adresse {cryptocurrencies.find(c => c.id === selectedCrypto)?.name} :</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(userWallet[`${selectedCrypto}Address`])}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Copier
                    </button>
                  </div>
                  <div className="flex items-center">
                    <code className="text-sm bg-gray-800 p-2 rounded break-all font-mono">
                      {userWallet[`${selectedCrypto}Address`]}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(userWallet[`${selectedCrypto}Address`])}
                      className="ml-2 p-2 text-gray-400 hover:text-white"
                      title="Copier l'adresse"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-yellow-400">
                    ⚠️ N'envoyez que {cryptocurrencies.find(c => c.id === selectedCrypto)?.name} à cette adresse. L'envoi d'autres actifs pourrait entraîner une perte définitive.
                  </p>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Montant minimum de dépôt :</h3>
                <p className="text-sm text-blue-300">
                  Le montant minimum pour un dépôt en {cryptocurrencies.find(c => c.id === selectedCrypto)?.name} est de 10 USDT (ou équivalent).
                  Les montants inférieurs ne seront pas crédités.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Historique des dépôts */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Derniers dépôts</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {depositHistory.length > 0 ? (
                depositHistory.map((deposit) => (
                  <div key={deposit.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {deposit.amount} {deposit.currency.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          deposit.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : deposit.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {deposit.status === 'completed'
                          ? 'Terminé'
                          : deposit.status === 'pending'
                          ? 'En attente'
                          : 'Échoué'}
                      </span>
                    </div>
                    {deposit.txHash && (
                      <div className="mt-2">
                        <a
                          href={`https://blockexplorer.com/tx/${deposit.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                        >
                          Voir sur l'explorateur
                          <svg
                            className="w-3 h-3 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-400">Aucun dépôt récent</p>
                </div>
              )}
            </div>
            {depositHistory.length > 0 && (
              <div className="px-6 py-3 bg-gray-800 text-right border-t border-gray-700">
                <a
                  href="/transactions/deposits"
                  className="text-sm font-medium text-purple-400 hover:text-purple-300"
                >
                  Voir tout l'historique →
                </a>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Questions fréquentes</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300">Combien de temps prend un dépôt ?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Les dépôts en crypto sont généralement crédités après 1 à 6 confirmations sur le réseau (environ 5-30 minutes).
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300">Y a-t-il des frais de dépôt ?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Nous ne facturons pas de frais pour les dépôts. Cependant, des frais de réseau peuvent s'appliquer.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300">Mon dépôt n'apparaît pas, que faire ?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Vérifiez d'abord l'état de votre transaction sur l'explorateur de blocs. Si le problème persiste, contactez notre support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;
