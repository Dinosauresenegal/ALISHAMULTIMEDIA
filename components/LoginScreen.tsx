
import React, { useState } from 'react';
import { User, NotificationType, NotificationState } from '../types';
import { Lock, User as UserIcon, ChevronRight, Delete } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  setNotification: (n: NotificationState) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, setNotification }) => {
  const [pin, setPin] = useState('');

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = () => {
    const user = users.find(u => u.pin === pin);
    if (user) {
      onLogin(user);
    } else {
      setNotification({
        message: "Code PIN Incorrect",
        type: NotificationType.ERROR,
        timestamp: Date.now()
      });
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-alisha-orange flex flex-col items-center justify-center p-6 text-white">
      <div className="mb-8 text-center">
        <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-md">
          <Lock size={48} />
        </div>
        <h1 className="text-3xl font-black tracking-tight">ALISHASHOP</h1>
        <p className="opacity-80">Manager Mobile</p>
      </div>

      <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl">
        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 border-gray-300 transition-all ${pin.length > i ? 'bg-alisha-orange border-alisha-orange' : 'bg-transparent'}`}
              />
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mb-2">Entrez votre code PIN</p>
          <div className="text-center text-xs text-gray-300">Admin: 1234 | Staff: 0000</div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="h-16 rounded-xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center">
             <UserIcon className="text-gray-300" />
          </div>
          <button
            onClick={() => handleNumClick('0')}
            className="h-16 rounded-xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all shadow-sm"
          >
            <Delete size={24} />
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={pin.length !== 4}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg transition-all ${pin.length === 4 ? 'bg-alisha-blue text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          CONNEXION <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
