import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isLowStock = product.stock <= 4;

  return (
    <div className={`relative p-4 rounded-lg border shadow-sm flex justify-between items-center transition-colors duration-300 ${isLowStock ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${isLowStock ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-alisha-blue'}`}>
          {isLowStock ? <AlertTriangle size={20} /> : <Package size={20} />}
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{product.name}</h3>
          <p className="text-xs text-gray-500">Réf: {product.id}</p>
          <p className="text-sm font-medium text-alisha-orange mt-1">{product.price.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
          {product.stock}
        </span>
        <p className="text-xs text-gray-500">en stock</p>
      </div>
    </div>
  );
};

export default ProductCard;