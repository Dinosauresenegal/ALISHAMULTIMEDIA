
import React, { useState } from 'react';
import { ServiceDefinition } from '../types';
import { X, Save, Plus, Trash2, DollarSign } from 'lucide-react';

interface ServiceConfigModalProps {
  services: ServiceDefinition[];
  onSave: (services: ServiceDefinition[]) => void;
  onClose: () => void;
  isDark: boolean;
}

const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({ services, onSave, onClose, isDark }) => {
  const [localServices, setLocalServices] = useState<ServiceDefinition[]>(JSON.parse(JSON.stringify(services)));
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const handlePriceChange = (id: string, newPrice: string) => {
    setLocalServices(prev => prev.map(s => s.id === id ? { ...s, price: parseInt(newPrice) || 0 } : s));
  };

  const handleAdd = () => {
    if (!newServiceName || !newServicePrice) return;
    const newService: ServiceDefinition = {
      id: `S${Date.now()}`,
      name: newServiceName,
      price: parseInt(newServicePrice),
      category: 'office'
    };
    setLocalServices([...localServices, newService]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleDelete = (id: string) => {
    setLocalServices(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onSave(localServices);
    onClose();
  };

  const bgClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = `px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-alisha-blue ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${bgClass}`}>
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className="font-bold text-lg flex items-center"><DollarSign size={20} className="mr-2"/> Tarifs Services</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow space-y-4">
          <div className="space-y-3">
            {localServices.map(service => (
              <div key={service.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-gray-50'}`}>
                <span className="font-medium text-sm flex-grow">{service.name}</span>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    value={service.price} 
                    onChange={(e) => handlePriceChange(service.id, e.target.value)}
                    className={`w-20 text-right font-bold ${inputClass}`}
                  />
                  <span className="text-xs font-mono opacity-60">FCFA</span>
                  <button onClick={() => handleDelete(service.id)} className="text-red-500 p-2 hover:bg-red-100 rounded-full">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 className="text-xs font-bold uppercase opacity-60 mb-2">Ajouter un service</h3>
            <div className="grid grid-cols-1 gap-2">
              <input 
                placeholder="Nom (ex: Reliure GM)" 
                value={newServiceName}
                onChange={e => setNewServiceName(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Prix" 
                  value={newServicePrice}
                  onChange={e => setNewServicePrice(e.target.value)}
                  className={`${inputClass} flex-grow`}
                />
                <button 
                  onClick={handleAdd}
                  disabled={!newServiceName || !newServicePrice}
                  className="px-4 bg-green-500 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  <Plus />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-alisha-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
          >
            ENREGISTRER TARIFS
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigModal;
