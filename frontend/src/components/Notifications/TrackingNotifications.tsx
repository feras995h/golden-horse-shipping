import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock, Ship } from 'lucide-react';

interface TrackingNotification {
  id: string;
  type: 'status_change' | 'milestone' | 'delay' | 'arrival';
  title: string;
  message: string;
  timestamp: Date;
  trackingNumber?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface TrackingNotificationsProps {
  trackingNumber?: string;
  currentStatus?: string;
  milestones?: any[];
}

const TrackingNotifications: React.FC<TrackingNotificationsProps> = ({
  trackingNumber,
  currentStatus,
  milestones = []
}) => {
  const [notifications, setNotifications] = useState<TrackingNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastStatus, setLastStatus] = useState<string>('');

  // Mock notifications for demonstration
  useEffect(() => {
    if (trackingNumber && currentStatus && currentStatus !== lastStatus) {
      const newNotification: TrackingNotification = {
        id: Date.now().toString(),
        type: 'status_change',
        title: 'تحديث حالة الشحنة',
        message: `تم تحديث حالة الشحنة ${trackingNumber} إلى: ${currentStatus}`,
        timestamp: new Date(),
        trackingNumber,
        isRead: false,
        priority: 'medium'
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
      setLastStatus(currentStatus);

      // Auto-show notifications panel for new updates
      setShowNotifications(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setShowNotifications(false), 5000);
    }
  }, [trackingNumber, currentStatus, lastStatus]);

  // Generate milestone notifications
  useEffect(() => {
    if (milestones.length > 0) {
      const completedMilestones = milestones.filter(m => m.status === 'completed');
      const latestMilestone = completedMilestones[completedMilestones.length - 1];
      
      if (latestMilestone && trackingNumber) {
        const milestoneNotification: TrackingNotification = {
          id: `milestone-${Date.now()}`,
          type: 'milestone',
          title: 'مرحلة جديدة مكتملة',
          message: `${latestMilestone.event} في ${latestMilestone.location}`,
          timestamp: new Date(latestMilestone.date),
          trackingNumber,
          isRead: false,
          priority: 'low'
        };

        setNotifications(prev => {
          const exists = prev.some(n => n.id === milestoneNotification.id);
          if (!exists) {
            return [milestoneNotification, ...prev.slice(0, 9)];
          }
          return prev;
        });
      }
    }
  }, [milestones, trackingNumber]);

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className={`h-5 w-5 ${priority === 'high' ? 'text-red-500' : 'text-blue-500'}`} />;
      case 'milestone':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'delay':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'arrival':
        return <Ship className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleString('ar-LY')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setNotifications([])}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                مسح جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingNotifications;
