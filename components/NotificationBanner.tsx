import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { NotificationState, NotificationType } from '../types';

interface NotificationBannerProps {
  notification: NotificationState | null;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  let bgColor = 'bg-gray-100';
  let borderColor = 'border-gray-300';
  let Icon = Info;

  switch (notification.type) {
    case NotificationType.SUCCESS:
      bgColor = 'bg-green-100';
      borderColor = 'border-green-500';
      Icon = CheckCircle;
      break;
    case NotificationType.ERROR:
      bgColor = 'bg-red-100';
      borderColor = 'border-red-500';
      Icon = XCircle;
      break;
    case NotificationType.WARNING:
      bgColor = 'bg-yellow-50';
      borderColor = 'border-alisha-orange';
      Icon = AlertTriangle;
      break;
    case NotificationType.INFO:
      bgColor = 'bg-blue-50';
      borderColor = 'border-alisha-blue';
      Icon = Info;
      break;
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 rounded-md border-l-4 p-4 shadow-lg transition-all duration-300 transform translate-y-0 ${bgColor} ${borderColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${
            notification.type === NotificationType.SUCCESS ? 'text-green-600' :
            notification.type === NotificationType.ERROR ? 'text-red-600' :
            notification.type === NotificationType.WARNING ? 'text-alisha-orange' :
            'text-alisha-blue'
          }`} />
        </div>
        <div className="ml-3 w-full">
          <h3 className={`text-sm font-medium ${
             notification.type === NotificationType.SUCCESS ? 'text-green-800' :
             notification.type === NotificationType.ERROR ? 'text-red-800' :
             notification.type === NotificationType.WARNING ? 'text-orange-800' :
             'text-blue-800'
          }`}>
            {notification.message}
          </h3>
          {notification.details && (
            <div className={`mt-2 text-sm ${
               notification.type === NotificationType.SUCCESS ? 'text-green-700' :
               notification.type === NotificationType.ERROR ? 'text-red-700' :
               notification.type === NotificationType.WARNING ? 'text-orange-700' :
               'text-blue-700'
            }`}>
              <p>{notification.details}</p>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              type="button"
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${bgColor} ${
                 notification.type === NotificationType.SUCCESS ? 'text-green-500 hover:bg-green-200 focus:ring-green-600' :
                 notification.type === NotificationType.ERROR ? 'text-red-500 hover:bg-red-200 focus:ring-red-600' :
                 'text-gray-500 hover:bg-gray-200 focus:ring-gray-600'
              }`}
            >
              <span className="sr-only">Fermer</span>
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;