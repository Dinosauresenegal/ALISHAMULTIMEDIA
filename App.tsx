
import React, { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, BarChart2, Play, Smartphone, FileText, Plus, Printer, Zap, Tv, Layers, LogOut, Settings, Moon, Sun, Lock, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, Calendar, DollarSign } from 'lucide-react';
import { Product, NotificationState, NotificationType, Transaction, TransactionType, User, AppTheme, TransactionFlow, ServiceDefinition } from './types';
import NotificationBanner from './components/NotificationBanner';
import ProductCard from './components/ProductCard';
import LoginScreen from './components/LoginScreen';
import ProductForm from './components/ProductForm';
import ServiceConfigModal from './components/ServiceConfigModal';

// Utilitaires
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('fr-FR') + ' FCFA';
};

const generateTransactionId = () => {
  return 'TX-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const playWarningSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

// Données Initiales
const USERS: User[] = [
  { id: 'U1', name: 'Administrateur', pin: '1234', role: 'admin' },
  { id: 'U2', name: 'Caissier 1', pin: '0000', role: 'staff' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'P001', name: 'Ecouteurs Bluetooth', stock: 12, price: 3500, category: 'High-Tech' },
  { id: 'P002', name: 'Câble USB Type-C', stock: 25, price: 1500, category: 'High-Tech' },
  { id: 'P003', name: 'Clé USB 32GB', stock: 4, price: 4500, category: 'Stockage' },
  { id: 'P004', name: 'Rame Papier A4', stock: 3, price: 3500, category: 'Bureautique' },
  { id: 'P005', name: 'Stylo Bleu', stock: 50, price: 100, category: 'Bureautique' },
];

const INITIAL_SERVICES: ServiceDefinition[] = [
  { id: 'S1', name: 'Photocopie N&B', price: 50, category: 'office' },
  { id: 'S2', name: 'Photocopie Couleur', price: 100, category: 'office' },
  { id: 'S3', name: 'Impression', price: 100, category: 'office' },
  { id: 'S4', name: 'Plastification', price: 500, category: 'office' },
  { id: 'S5', name: 'Reliure', price: 1000, category: 'office' },
  { id: 'S6', name: 'Scanner', price: 200, category: 'office' },
  { id: 'S7', name: 'Photo Identité', price: 2000, category: 'office' },
];

const App: React.FC = () => {
  // Auth & Theme State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<AppTheme>('light');

  // App Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<ServiceDefinition[]>(INITIAL_SERVICES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  // Navigation State
  const [view, setView] = useState<'sale' | 'services' | 'stock' | 'report' | 'settings'>('sale');

  // Modal States
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showServiceConfig, setShowServiceConfig] = useState(false);

  // --- State Vente Produit ---
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // --- State Services ---
  const [serviceCategory, setServiceCategory] = useState<'money' | 'bills' | 'office' | 'other'>('money');
  const [selectedOperator, setSelectedOperator] = useState<string>(''); 
  const [serviceAmount, setServiceAmount] = useState<string>(''); 
  const [serviceDetails, setServiceDetails] = useState<string>('');
  const [moneyFlow, setMoneyFlow] = useState<TransactionFlow>('IN'); // IN = Dépôt (Entrée Caisse), OUT = Retrait (Sortie Caisse)
  const [officeServiceQty, setOfficeServiceQty] = useState<number>(1);

  // Effects
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Computed
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const totalSalePrice = selectedProduct ? selectedProduct.price * quantity : 0;
  const isDark = theme === 'dark';

  // --- LOGIN ---
  if (!currentUser) {
    return <LoginScreen users={USERS} onLogin={setCurrentUser} setNotification={setNotification} />;
  }

  // --- ACTIONS ---

  const handleLogout = () => {
    setCurrentUser(null);
    setView('sale');
  };

  const recordSale = () => {
    if (!selectedProduct) return;

    if (selectedProduct.stock < quantity) {
      setNotification({
        message: "Stock insuffisant",
        details: `Seulement ${selectedProduct.stock} en stock.`,
        type: NotificationType.ERROR,
        timestamp: Date.now()
      });
      return;
    }

    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id ? { ...p, stock: p.stock - quantity } : p
    );
    setProducts(updatedProducts);

    const newTx: Transaction = {
      id: generateTransactionId(),
      type: TransactionType.SALE,
      description: `${selectedProduct.name} x${quantity}`,
      amount: totalSalePrice,
      flow: 'IN',
      quantity: quantity,
      timestamp: Date.now(),
      relatedId: selectedProduct.id,
      performerName: currentUser.name
    };
    setTransactions(prev => [newTx, ...prev]);

    const newStock = selectedProduct.stock - quantity;
    let notifType = NotificationType.SUCCESS;
    let message = "Vente OK";
    
    if (newStock <= 4) {
      notifType = NotificationType.WARNING;
      message = "STOCK FAIBLE !";
      playWarningSound();
    }

    setNotification({ message, details: `Reste: ${newStock} | +${formatCurrency(totalSalePrice)}`, type: notifType, timestamp: Date.now() });
    setQuantity(1);
  };

  const recordServiceTransaction = () => {
    let txType = TransactionType.SERVICE_OTHER;
    let desc = serviceDetails || "Service";
    let amount = parseInt(serviceAmount) || 0;
    let flow: TransactionFlow = 'IN';

    if (serviceCategory === 'money') {
      txType = TransactionType.MONEY_TRANSFER;
      flow = moneyFlow;
      // Dépôt: Client donne argent -> Caisse IN
      // Retrait: Client reçoit argent -> Caisse OUT
      desc = `${selectedOperator} - ${flow === 'IN' ? 'Dépôt' : 'Retrait'}`;
    } else if (serviceCategory === 'bills') {
      txType = TransactionType.BILL_PAYMENT;
      desc = `Paiement ${selectedOperator}`;
      flow = 'IN'; // Client paie pour une facture -> Caisse IN (puis reversement plus tard)
    } else if (serviceCategory === 'office') {
      txType = TransactionType.SERVICE_OFFICE;
      // Find service definition
      const serviceDef = services.find(s => s.name === selectedOperator);
      if (serviceDef) {
        amount = serviceDef.price * officeServiceQty;
        desc = `${selectedOperator} x${officeServiceQty}`;
      } else {
        desc = selectedOperator;
      }
      flow = 'IN';
    }

    if (!amount || amount <= 0) {
      setNotification({ message: "Montant invalide", type: NotificationType.ERROR, timestamp: Date.now() });
      return;
    }

    const newTx: Transaction = {
      id: generateTransactionId(),
      type: txType,
      description: desc,
      amount: amount,
      flow: flow,
      operator: selectedOperator,
      timestamp: Date.now(),
      performerName: currentUser.name
    };

    setTransactions(prev => [newTx, ...prev]);
    setNotification({ 
      message: "Transaction Enregistrée", 
      details: `${desc} : ${flow === 'IN' ? '+' : '-'}${formatCurrency(amount)}`, 
      type: NotificationType.SUCCESS, 
      timestamp: Date.now() 
    });
    
    setServiceAmount('');
    setServiceDetails('');
    setOfficeServiceQty(1);
  };

  const checkLowStock = () => {
    const lowStockItems = products.filter(p => p.stock <= 4);
    const count = lowStockItems.length;
    
    if (count > 0) {
      const itemNames = lowStockItems.map(p => p.name).join(', ');
      setNotification({
        message: "ALERTE STOCK",
        details: `${count} produits critiques`,
        type: NotificationType.WARNING,
        timestamp: Date.now()
      });
      playWarningSound();
    } else {
      setNotification({
        message: "Stock Sain",
        details: "Tout est en ordre.",
        type: NotificationType.SUCCESS,
        timestamp: Date.now()
      });
    }
  };

  // Stock Management (Admin only)
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (p: Product) => {
    if (currentUser.role !== 'admin') {
      setNotification({ message: "Accès Refusé", details: "Réservé à l'admin", type: NotificationType.ERROR, timestamp: Date.now() });
      return;
    }
    setEditingProduct(p);
    setShowProductForm(true);
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      setNotification({ message: "Produit Modifié", type: NotificationType.SUCCESS, timestamp: Date.now() });
    } else {
      setProducts(prev => [product, ...prev]);
      setNotification({ message: "Produit Ajouté", type: NotificationType.SUCCESS, timestamp: Date.now() });
    }
    setShowProductForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (currentUser.role !== 'admin') return;
    if (window.confirm("Supprimer cet article ?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setNotification({ message: "Produit Supprimé", type: NotificationType.INFO, timestamp: Date.now() });
    }
  };

  const handleSaveServices = (newServices: ServiceDefinition[]) => {
    setServices(newServices);
    setNotification({ message: "Tarifs mis à jour", type: NotificationType.SUCCESS, timestamp: Date.now() });
  };

  // Styling vars
  const bgMain = isDark ? 'bg-gray-900' : 'bg-gray-100';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800';

  // Calculs Rapport (Current Day)
  const today = new Date().setHours(0,0,0,0);
  const todayTransactions = transactions.filter(t => new Date(t.timestamp).setHours(0,0,0,0) === today);
  
  const todayIn = todayTransactions.filter(t => t.flow === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const todayOut = todayTransactions.filter(t => t.flow === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const todayBalance = todayIn - todayOut;

  // Report: Last 8 days
  const last8Days = Array.from({length: 8}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    return d.getTime();
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-20 transition-colors duration-300 ${bgMain} ${textMain}`}>
      
      {/* HEADER */}
      <header className="bg-alisha-orange text-white p-4 shadow-md sticky top-0 z-30">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-black text-xl tracking-tight">ALISHASHOP</h1>
            <p className="text-xs opacity-90 font-medium flex items-center">
              <UserIconSmall role={currentUser.role} /> {currentUser.name}
            </p>
          </div>
          <div className="text-right bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-wider opacity-90">Caisse Jour</div>
            <div className="font-bold text-lg leading-none">{formatCurrency(todayBalance)}</div>
          </div>
        </div>
      </header>

      <NotificationBanner notification={notification} onClose={() => setNotification(null)} />

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 max-w-md mx-auto w-full space-y-4">
        
        {/* --- VUE VENTE --- */}
        {view === 'sale' && (
          <div className="animate-fade-in space-y-4">
            <div className={`${bgCard} rounded-2xl shadow-sm p-5 border`}>
              <h2 className={`font-bold text-lg mb-4 flex items-center border-b pb-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <ShoppingCart className="mr-2 text-alisha-orange" size={20}/> Nouvelle Vente
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${textSub}`}>Sélectionner Article</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className={`block w-full py-3 pl-3 pr-10 rounded-xl font-medium outline-none focus:ring-2 focus:ring-alisha-orange transition-all ${inputBg}`}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id} className={isDark ? 'bg-gray-800' : 'bg-white'}>
                        {p.name} ({formatCurrency(p.price)})
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-between mt-2 px-1">
                     <span className={`text-xs font-mono ${textSub}`}>Réf: {selectedProduct?.id}</span>
                     <span className={`text-xs font-bold ${selectedProduct && selectedProduct.stock <= 4 ? "text-red-500 bg-red-50 px-2 py-0.5 rounded" : "text-green-600 bg-green-50 px-2 py-0.5 rounded"}`}>
                       Stock: {selectedProduct?.stock}
                     </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${textSub}`}>Qté</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className={`block w-full py-3 px-3 rounded-xl text-center text-xl font-bold outline-none focus:ring-2 focus:ring-alisha-orange ${inputBg}`}
                    />
                  </div>
                  <div className="w-2/3">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${textSub}`}>Total à payer</label>
                    <div className="w-full py-3 px-4 bg-blue-50 border border-blue-100 rounded-xl text-right text-xl font-black text-alisha-blue shadow-inner">
                      {formatCurrency(totalSalePrice)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={recordSale}
                  className="w-full py-4 bg-alisha-orange text-white rounded-xl font-bold text-lg shadow-lg hover:bg-orange-600 active:scale-95 transition-all flex justify-center items-center group"
                >
                  <Play size={24} className="mr-2 fill-current group-hover:scale-110 transition-transform" /> ENCAISSER
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VUE SERVICES --- */}
        {view === 'services' && (
          <div className="animate-fade-in space-y-4">
            {/* Tabs */}
            <div className={`flex p-1 rounded-xl shadow-sm border ${bgCard}`}>
              {['money', 'bills', 'office'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => { setServiceCategory(cat as any); setSelectedOperator(''); setServiceAmount(''); setOfficeServiceQty(1); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${serviceCategory === cat ? 'bg-alisha-blue text-white shadow' : `${textSub} hover:bg-gray-50 dark:hover:bg-gray-700`}`}
                >
                  {cat === 'money' ? 'Finance' : cat === 'bills' ? 'Factures' : 'Bureau'}
                </button>
              ))}
            </div>

            <div className={`${bgCard} rounded-2xl shadow-sm p-5 border`}>
              <div className="mb-6">
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${textSub}`}>
                   {serviceCategory === 'money' ? 'Opérateur' : serviceCategory === 'bills' ? 'Service' : 'Prestation'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {renderServiceGrid(serviceCategory, selectedOperator, setSelectedOperator, isDark, services)}
                </div>
              </div>

              <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                
                {/* Mobile Money Specifics */}
                {serviceCategory === 'money' && selectedOperator && (
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => setMoneyFlow('IN')}
                      className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center transition-all ${moneyFlow === 'IN' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                    >
                      <ArrowDownCircle className="mr-2" size={20}/> DÉPÔT
                    </button>
                    <button 
                      onClick={() => setMoneyFlow('OUT')}
                      className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center transition-all ${moneyFlow === 'OUT' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                    >
                      <ArrowUpCircle className="mr-2" size={20}/> RETRAIT
                    </button>
                  </div>
                )}

                {serviceCategory === 'office' && selectedOperator ? (
                  /* Office Services Logic (Qty * Fixed Price) */
                  <div className="flex gap-4 items-end">
                     <div className="flex-grow">
                       <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${textSub}`}>Quantité</label>
                       <div className="flex items-center">
                          <input
                            type="number"
                            min="1"
                            value={officeServiceQty}
                            onChange={(e) => setOfficeServiceQty(parseInt(e.target.value) || 1)}
                            className={`block w-full py-3 px-3 rounded-xl text-center text-xl font-bold outline-none focus:ring-2 focus:ring-alisha-blue ${inputBg}`}
                          />
                          <div className="ml-3 text-sm font-medium opacity-70 text-right">
                             x {services.find(s => s.name === selectedOperator)?.price} FCFA
                          </div>
                       </div>
                     </div>
                     <div className="w-1/3 text-right pb-3">
                        <div className="text-xl font-black text-alisha-blue">
                          {formatCurrency((services.find(s => s.name === selectedOperator)?.price || 0) * officeServiceQty)}
                        </div>
                     </div>
                  </div>
                ) : (
                  /* Standard Amount Input for Money/Bills */
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${textSub}`}>Montant Transaction</label>
                    <input
                      type="number"
                      placeholder="0 FCFA"
                      value={serviceAmount}
                      onChange={(e) => setServiceAmount(e.target.value)}
                      className={`block w-full py-3 px-3 rounded-xl text-2xl font-black outline-none focus:ring-2 focus:ring-alisha-blue ${inputBg}`}
                    />
                  </div>
                )}

                <button
                  onClick={recordServiceTransaction}
                  disabled={!selectedOperator || (serviceCategory !== 'office' && !serviceAmount)}
                  className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-md transition-all ${!selectedOperator || (serviceCategory !== 'office' && !serviceAmount) ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-alisha-blue hover:bg-blue-600 active:scale-95'}`}
                >
                  VALIDER {serviceCategory === 'money' ? (moneyFlow === 'IN' ? 'DÉPÔT' : 'RETRAIT') : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VUE STOCK --- */}
        {view === 'stock' && (
          <div className="animate-fade-in space-y-4">
            <div className={`flex justify-between items-center mb-2 p-3 rounded-xl shadow-sm ${bgCard}`}>
              <h2 className="text-lg font-bold">Inventaire</h2>
              <div className="flex gap-2">
                {currentUser.role === 'admin' && (
                  <button onClick={handleAddProduct} className="bg-alisha-blue text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-blue-600">
                    <Plus size={14} className="mr-1"/> AJOUTER
                  </button>
                )}
                <button onClick={checkLowStock} className="bg-red-50 text-red-500 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-red-100">
                  <RefreshCw size={14} className="mr-1"/> VERIFIER
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {products.map(product => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  {currentUser.role === 'admin' && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditProduct(product)} className="p-1.5 bg-blue-100 text-blue-600 rounded-full"><Edit size={14}/></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 bg-red-100 text-red-600 rounded-full"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VUE RAPPORT (8 JOURS) --- */}
        {view === 'report' && (
          <div className="animate-fade-in h-full flex flex-col space-y-4">
            <div className={`${bgCard} p-4 rounded-xl shadow-sm border mb-2`}>
               <h2 className="font-bold text-lg mb-2 flex items-center"><Calendar size={20} className="mr-2 text-alisha-orange"/> Derniers 8 Jours</h2>
               <div className="space-y-3">
                 {last8Days.map(dateTs => {
                   const dayTxs = transactions.filter(t => new Date(t.timestamp).setHours(0,0,0,0) === dateTs);
                   const dayIn = dayTxs.filter(t => t.flow === 'IN').reduce((acc, t) => acc + t.amount, 0);
                   const dayOut = dayTxs.filter(t => t.flow === 'OUT').reduce((acc, t) => acc + t.amount, 0);
                   const hasActivity = dayTxs.length > 0;

                   return (
                     <div key={dateTs} className={`flex justify-between items-center p-3 rounded-lg ${hasActivity ? (isDark ? 'bg-gray-700' : 'bg-white border border-gray-100') : 'opacity-50'}`}>
                        <div className="text-sm font-medium capitalize">{formatDate(dateTs)}</div>
                        {hasActivity ? (
                          <div className="text-right">
                            <div className="text-xs text-green-600 font-bold">+{formatCurrency(dayIn)}</div>
                            {dayOut > 0 && <div className="text-xs text-red-500 font-bold">-{formatCurrency(dayOut)}</div>}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">-</div>
                        )}
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className={`${bgCard} rounded-xl shadow-sm border flex-grow overflow-hidden flex flex-col`}>
              <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="font-bold flex items-center"><FileText size={16} className="mr-2"/> Détails (Jour J)</h3>
              </div>
              
              <div className="overflow-y-auto p-0 space-y-0 flex-grow max-h-[300px]">
                {todayTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Layers size={32} className="mb-2 opacity-20"/>
                    <p className="text-sm">Aucune transaction aujourd'hui</p>
                  </div>
                ) : (
                  todayTransactions.map(tx => (
                    <div key={tx.id} className={`flex justify-between items-center p-4 border-b last:border-0 transition-colors ${isDark ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 w-2 h-2 rounded-full ${tx.flow === 'IN' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="font-bold text-sm">{tx.description}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{tx.id}</span>
                            <span className="text-[10px] text-gray-400">{formatTime(tx.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold whitespace-nowrap ${tx.flow === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.flow === 'IN' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VUE REGLAGES --- */}
        {view === 'settings' && (
          <div className="animate-fade-in space-y-4">
            <div className={`${bgCard} rounded-2xl shadow-sm p-5 border`}>
              <h2 className="font-bold text-lg mb-4 flex items-center">Paramètres</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    {theme === 'dark' ? <Moon size={20} className="mr-3 text-purple-500"/> : <Sun size={20} className="mr-3 text-orange-500"/>}
                    <div>
                      <div className="font-bold text-sm">Thème de l'application</div>
                      <div className={`text-xs ${textSub}`}>{theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    Changer
                  </button>
                </div>

                {currentUser.role === 'admin' && (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                         <DollarSign size={20} className="mr-3 text-green-600"/>
                         <div>
                           <div className="font-bold text-sm">Tarifs Services</div>
                           <div className={`text-xs ${textSub}`}>Configurer Prix Bureautique</div>
                         </div>
                      </div>
                      <button 
                        onClick={() => setShowServiceConfig(true)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        Modifier
                      </button>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                         <Lock size={20} className="mr-3 text-red-500"/>
                         <div>
                           <div className="font-bold text-sm">Gestion Utilisateurs</div>
                           <div className={`text-xs ${textSub}`}>2 utilisateurs actifs</div>
                         </div>
                      </div>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Admin Only</span>
                    </div>
                  </>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full py-3 mt-4 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-all"
                >
                  <LogOut size={18} className="mr-2" /> Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 w-full border-t flex justify-around items-center pb-safe py-2 z-40 max-w-md left-0 right-0 mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <NavButton viewName="sale" current={view} setView={setView} icon={ShoppingCart} label="Boutique" theme={theme} />
        <NavButton viewName="services" current={view} setView={setView} icon={Smartphone} label="Services" theme={theme} />
        <NavButton viewName="stock" current={view} setView={setView} icon={BarChart2} label="Stock" theme={theme} />
        <NavButton viewName="report" current={view} setView={setView} icon={FileText} label="Rapport" theme={theme} />
        <NavButton viewName="settings" current={view} setView={setView} icon={Settings} label="Réglages" theme={theme} />
      </nav>

      {/* Modals */}
      {showProductForm && (
        <ProductForm 
          product={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => setShowProductForm(false)}
          isDark={isDark}
        />
      )}

      {showServiceConfig && (
        <ServiceConfigModal
          services={services}
          onSave={handleSaveServices}
          onClose={() => setShowServiceConfig(false)}
          isDark={isDark}
        />
      )}

    </div>
  );
};

// Components helpers
const UserIconSmall = ({ role }: { role: string }) => {
  if (role === 'admin') return <Lock size={12} className="mr-1 text-yellow-300" />;
  return <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>;
};

const NavButton = ({ viewName, current, setView, icon: Icon, label, theme }: any) => {
  const isActive = current === viewName;
  const activeColor = viewName === 'sale' || viewName === 'stock' ? 'text-alisha-orange' : 'text-alisha-blue';
  const inactiveColor = theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600';

  return (
    <button 
      onClick={() => setView(viewName)}
      className={`flex flex-col items-center p-2 w-1/5 transition-all duration-200 ${isActive ? `${activeColor} scale-110` : inactiveColor}`}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[9px] font-bold mt-1">{label}</span>
    </button>
  );
};

const renderServiceGrid = (category: string, selected: string, setSelected: any, isDark: boolean, services?: ServiceDefinition[]) => {
  const btnClass = (active: boolean, color: string) => `
    p-2 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center h-24 transition-all text-center
    ${active 
      ? `border-${color} bg-${color === 'alisha-orange' ? 'orange' : 'blue'}-50 text-${color}` 
      : `border-transparent ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`
    }
  `;

  if (category === 'money') {
    return ['Wave', 'Orange Money', 'Free Money', 'Wizall', 'Ecobank', 'Autre'].map(op => (
      <button key={op} onClick={() => setSelected(op)} className={btnClass(selected === op, 'alisha-blue')}>
        <Smartphone size={20} className="mb-2 opacity-70"/>{op}
      </button>
    ));
  }
  if (category === 'bills') {
    return ['Woyofal', 'Senelec', 'Seneau', 'Canal+', 'Rapido', 'Autre'].map(op => (
      <button key={op} onClick={() => setSelected(op)} className={btnClass(selected === op, 'alisha-orange')}>
        {op === 'Woyofal' ? <Zap size={20} className="mb-2"/> : <Tv size={20} className="mb-2"/>}
        {op}
      </button>
    ));
  }
  // Office: Display configured services with prices
  if (services) {
    return services.map(s => (
      <button key={s.id} onClick={() => setSelected(s.name)} className={btnClass(selected === s.name, 'alisha-blue')}>
        <Printer size={20} className="mb-1 opacity-70"/>
        <span className="truncate w-full">{s.name}</span>
        <span className="text-[10px] opacity-60">{s.price} F</span>
      </button>
    ));
  }
  return null;
};

export default App;
