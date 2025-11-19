
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Scan, Upload, Save, X } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  isDark: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel, isDark }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Autre');
  const [refId, setRefId] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setCategory(product.category || 'Autre');
      setRefId(product.id);
    } else {
      // New product defaults
      setRefId(`P${Math.floor(Math.random() * 10000)}`);
    }
  }, [product]);

  const handleScan = () => {
    // Simulation de scan
    const randomCode = `SCAN-${Math.floor(Math.random() * 100000)}`;
    setRefId(randomCode);
    alert(`Code scanné : ${randomCode}`);
  };

  const handleImport = () => {
    // Simulation import
    setName("Produit Importé (Exemple)");
    setPrice("5000");
    setStock("10");
    setCategory("Import");
    alert("Données importées depuis le fichier dummy.csv");
  };

  const handleSubmit = () => {
    if (!name || !price || !stock) return;

    onSave({
      id: refId,
      name,
      price: parseInt(price),
      stock: parseInt(stock),
      category
    });
  };

  const inputClass = `block w-full py-3 px-3 rounded-xl border font-medium outline-none focus:ring-2 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:ring-alisha-orange' : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-alisha-blue'}`;
  const labelClass = `text-xs font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className="font-bold text-lg">{product ? 'Modifier Article' : 'Nouvel Article'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Scan / Import Actions */}
          {!product && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={handleScan}
                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-alisha-orange hover:bg-orange-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-all"
              >
                <Scan className="mb-1 text-alisha-orange" size={24} />
                <span className="text-xs font-bold">Scanner</span>
              </button>
              <button 
                onClick={handleImport}
                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-alisha-blue hover:bg-blue-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-all"
              >
                <Upload className="mb-1 text-alisha-blue" size={24} />
                <span className="text-xs font-bold">Importer Fichier</span>
              </button>
            </div>
          )}

          <div>
            <label className={labelClass}>Référence (ID)</label>
            <input type="text" value={refId} readOnly className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </div>

          <div>
            <label className={labelClass}>Nom du produit</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Ex: Carte Mémoire" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className={labelClass}>Prix de Vente</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Stock Initial</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} className={inputClass} placeholder="0" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Catégorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              <option value="High-Tech">High-Tech</option>
              <option value="Bureautique">Bureautique</option>
              <option value="Stockage">Stockage</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} bg-opacity-50`}>
          <button 
            onClick={handleSubmit}
            className="w-full py-3 bg-alisha-orange text-white rounded-xl font-bold flex justify-center items-center shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
          >
            <Save size={20} className="mr-2" /> ENREGISTRER
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
