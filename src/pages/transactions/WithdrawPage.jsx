import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

// Options de méthode de retrait
const withdrawalMethods = [
  { id: 'crypto', name: 'Crypto-monnaie', icon: '🪙' },
  { id: 'bank', name: 'Virement bancaire', icon: '🏦' },
];

// Cryptomonnaies supportées pour le retrait
const cryptocurrencies = [
  { id: 'btc', name: 'Bitcoin (BTC)', icon: '₿' },
  { id: 'eth', name: 'Ethereum (ETH)', icon: 'Ξ' },
  { id: 'usdt', name: 'Tether (USDT)', icon: '₮', network: ['TRC20', 'ERC20'] },
  { id: 'usdc', name: 'USD Coin (USDC)', icon: 'ⓤ', network: ['TRC20', 'ERC20'] },
];

const WithdrawPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState('usdt');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Récupérer le solde du portefeuille
  const { data: walletBalance = { balance: 0, pending: 0 }, isLoading: isLoadingBalance } = useQuery(
    ['walletBalance'],
    async () => {
      const response = await api.get('/api/wallet/balance');
      return response.data;
    },
    {
      onError: (error) => {
        console.error('Error fetching wallet balance:', error);
      },
    }
  );

  // Récupérer l'historique des retraits
  const { data: withdrawalHistory = [], isLoading: isLoadingHistory } = useQuery(
    ['withdrawalHistory'],
    async () => {
      const response = await api.get('/api/transactions/withdrawals');
      return response.data;
    },
    {
      onError: (error) => {
        console.error('Error fetching withdrawal history:', error);
      },
    }
  );

  // Récupérer les adresses de retrait enregistrées
  const { data: savedAddresses = [] } = useQuery(
    ['savedWithdrawalAddresses'],
    async () => {
      const response = await api.get('/api/wallet/withdrawal-addresses');
      return response.data;
    },
    {
      onError: (error) => {
        console.error('Error fetching saved addresses:', error);
      },
    }
  );

  // Mutation pour soumettre une demande de retrait
  const withdrawMutation = useMutation(
    (withdrawalData) => api.post('/api/transactions/withdraw', withdrawalData),
    {
      onSuccess: () => {
        // Invalider et rafraîchir les requêtes
        queryClient.invalidateQueries(['walletBalance']);
        queryClient.invalidateQueries(['withdrawalHistory']);
        setSuccess('Votre demande de retrait a été soumise avec succès');
        setAmount('');
        setWalletAddress('');
      },
      onError: (error) => {
        console.error('Withdrawal error:', error);
        setError(error.response?.data?.message || 'Une erreur est survenue lors du retrait');
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    }
  );

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    const minWithdrawal = selectedMethod === 'crypto' ? 20 : 50; // 20€ pour crypto, 50€ pour virement bancaire
    
    // Validation
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }
    
    if (withdrawalAmount < minWithdrawal) {
      setError(`Le montant minimum de retrait est de ${minWithdrawal}€`);
      return;
    }
    
    if (withdrawalAmount > walletBalance.balance) {
      setError('Solde insuffisant pour effectuer ce retrait');
      return;
    }
    
    if (selectedMethod === 'crypto' && !walletAddress) {
      setError('Veuillez entrer une adresse de portefeuille valide');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await withdrawMutation.mutateAsync({
        amount: withdrawalAmount,
        method: selectedMethod,
        currency: selectedMethod === 'crypto' ? selectedCrypto : 'EUR',
        address: selectedMethod === 'crypto' ? walletAddress : undefined,
        network: selectedMethod === 'crypto' ? selectedNetwork : undefined,
      });
    } catch (err) {
      console.error('Withdrawal submission error:', err);
    }
  };

  // Calculer les frais de retrait
  const calculateFees = () => {
    if (!amount) return { amount: 0, total: 0 };
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return { amount: 0, total: 0 };
    
    let feeRate = 0.02; // 2% par défaut
    let minFee = 1; // 1€ de frais minimum
    
    if (selectedMethod === 'crypto') {
      feeRate = 0.01; // 1% pour les cryptos
      minFee = 2; // 2€ de frais minimum pour les cryptos
    }
    
    const fee = Math.max(amountNum * feeRate, minFee);
    return {
      amount: fee,
      total: amountNum - fee,
    };
  };

  const fees = calculateFees();

  if (isLoadingBalance || isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Retrait de fonds</h1>
        <p className="mt-1 text-gray-400">
          Retirez vos fonds vers votre portefeuille ou votre compte bancaire
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de retrait */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-white mb-2">Solde disponible</h2>
              <p className="text-3xl font-bold text-purple-400">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(walletBalance.balance)}
              </p>
              {walletBalance.pending > 0 && (
                <p className="mt-1 text-sm text-gray-400">
                  {walletBalance.pending.toFixed(2)} € en attente de retrait
                </p>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium text-white mb-4">Méthode de retrait</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {withdrawalMethods.map((method) => (
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
            </div>

            {selectedMethod === 'crypto' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Sélectionnez une cryptomonnaie</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cryptocurrencies.map((crypto) => (
                    <button
                      key={crypto.id}
                      type="button"
                      onClick={() => {
                        setSelectedCrypto(crypto.id);
                        // Réinitialiser le réseau si non supporté pour la crypto sélectionnée
                        if (crypto.network && !crypto.network.includes(selectedNetwork)) {
                          setSelectedNetwork(crypto.network[0]);
                        }
                      }}
                      className={`flex items-center p-3 rounded-lg border ${
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

                {cryptocurrencies.find(c => c.id === selectedCrypto)?.network && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Réseau</h4>
                    <div className="flex flex-wrap gap-2">
                      {cryptocurrencies
                        .find(c => c.id === selectedCrypto)
                        ?.network.map(network => (
                          <button
                            key={network}
                            type="button"
                            onClick={() => setSelectedNetwork(network)}
                            className={`px-3 py-1.5 text-sm rounded-md ${
                              selectedNetwork === network
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {network}
                          </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-yellow-400">
                      ⚠️ Assurez-vous de sélectionner le bon réseau pour éviter toute perte de fonds.
                    </p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit}>
              {selectedMethod === 'crypto' && (
                <div className="mb-4">
                  <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-1">
                    Adresse de portefeuille {selectedCrypto.toUpperCase()}
                  </label>
                  <div className="mt-1">
                    {savedAddresses.length > 0 && (
                      <select
                        className="w-full mb-2 bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        onChange={(e) => setWalletAddress(e.target.value)}
                        value={walletAddress}
                      >
                        <option value="">Sélectionner une adresse enregistrée</option>
                        {savedAddresses.map((address) => (
                          <option key={address.id} value={address.address}>
                            {address.label} ({address.address.substring(0, 6)}...{address.address.substring(address.address.length - 4)})
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="text"
                      id="walletAddress"
                      name="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder={`Entrez votre adresse ${selectedCrypto.toUpperCase()}`}
                      className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      required={selectedMethod === 'crypto'}
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Montant à retirer (EUR)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 sm:text-sm">€</span>
                  </div>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="block w-full pl-8 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-xs text-purple-400 hover:text-purple-300"
                      onClick={() => setAmount(walletBalance.balance.toFixed(2))}
                    >
                      Max
                    </button>
                  </div>
                </div>
                {amount && (
                  <p className="mt-1 text-xs text-gray-400">
                    Vous recevrez: {fees.total.toFixed(2)} {selectedMethod === 'crypto' ? selectedCrypto.toUpperCase() : 'EUR'} (frais: {fees.amount.toFixed(2)}€)
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

              <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Montant du retrait:</span>
                  <span className="text-white">{amount || '0.00'} €</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Frais de retrait ({selectedMethod === 'crypto' ? '1%' : '2%'}):</span>
                  <span className="text-red-400">-{fees.amount.toFixed(2)} €</span>
                </div>
                <div className="h-px bg-gray-700 my-2"></div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Vous recevrez:</span>
                  <span className="text-purple-400">
                    {fees.total.toFixed(2)} {selectedMethod === 'crypto' ? selectedCrypto.toUpperCase() : 'EUR'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement en cours...' : 'Demander un retrait'}
              </button>
            </form>
          </div>

          {/* Informations sur les retraits */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">Informations importantes</h2>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Les retraits en crypto-monnaie nécessitent une confirmation par email pour des raisons de sécurité.</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Les retraits en crypto sont traités dans les 24 heures. Les virements bancaires peuvent prendre 1 à 3 jours ouvrés.</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Les frais de retrait sont de 1% pour les cryptos et 2% pour les virements bancaires, avec un minimum de 2€.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Historique des retraits */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Derniers retraits</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {withdrawalHistory.length > 0 ? (
                withdrawalHistory.slice(0, 5).map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {withdrawal.amount} {withdrawal.currency.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          withdrawal.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : withdrawal.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : withdrawal.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {withdrawal.status === 'completed'
                          ? 'Terminé'
                          : withdrawal.status === 'pending'
                          ? 'En attente'
                          : withdrawal.status === 'processing'
                          ? 'En cours'
                          : 'Échoué'}
                      </span>
                    </div>
                    {withdrawal.txHash && (
                      <div className="mt-2">
                        <a
                          href={`https://blockexplorer.com/tx/${withdrawal.txHash}`}
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
                  <p className="text-sm text-gray-400">Aucun retrait récent</p>
                </div>
              )}
            </div>
            {withdrawalHistory.length > 0 && (
              <div className="px-6 py-3 bg-gray-800 text-right border-t border-gray-700">
                <a
                  href="/transactions/withdrawals"
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
                <h4 className="text-sm font-medium text-gray-300">Quand vais-je recevoir mon argent ?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Les retraits en crypto sont généralement traités dans les 24 heures. Les virements bancaires prennent 1 à 3 jours ouvrés.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300">Y a-t-il des frais de retrait ?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Oui, les frais sont de 1% pour les cryptos et 2% pour les virements bancaires, avec un minimum de 2€.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300">Comment suivre mon retrait ?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Une fois approuvé, vous recevrez un email de confirmation avec un lien pour suivre votre transaction sur la blockchain ou les détails du virement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
