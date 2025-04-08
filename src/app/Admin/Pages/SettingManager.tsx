import { useState } from 'react';
import { Save, Store, Mail, Bell, Globe, Shield, CreditCard } from 'lucide-react';
import Button from '../../../components/ui/Button';
import {Card} from '../../../components/ui/Card';

interface Settings {
  store: {
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    timezone: string;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    senderName: string;
    senderEmail: string;
  };
  notifications: {
    orderConfirmation: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    lowStock: boolean;
    newReviews: boolean;
  };
  payment: {
    currency: string;
    paymentMethods: string[];
    minimumOrder: number;
    taxRate: number;
  };
}

const SettingManager = () => {
  const [settings, setSettings] = useState<Settings>({
    store: {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      currency: 'USD',
      timezone: 'UTC',
    },
    email: {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      senderName: '',
      senderEmail: '',
    },
    notifications: {
      orderConfirmation: true,
      orderShipped: true,
      orderDelivered: true,
      lowStock: true,
      newReviews: true,
    },
    payment: {
      currency: 'USD',
      paymentMethods: ['credit_card', 'paypal'],
      minimumOrder: 0,
      taxRate: 0,
    },
  });

  const [activeTab, setActiveTab] = useState('store');

  const handleChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-3">
          <Card>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('store')}
                className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                  activeTab === 'store'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Store className="w-5 h-5 mr-3" />
                Store Settings
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                  activeTab === 'email'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Mail className="w-5 h-5 mr-3" />
                Email Configuration
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-5 h-5 mr-3" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                  activeTab === 'payment'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                Payment Settings
              </button>
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="col-span-9">
          <Card>
            <div className="p-6">
              {activeTab === 'store' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Store Settings</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={settings.store.name}
                        onChange={(e) => handleChange('store', 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store Email
                      </label>
                      <input
                        type="email"
                        value={settings.store.email}
                        onChange={(e) => handleChange('store', 'email', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.store.phone}
                        onChange={(e) => handleChange('store', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={settings.store.currency}
                        onChange={(e) => handleChange('store', 'currency', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Description
                    </label>
                    <textarea
                      value={settings.store.description}
                      onChange={(e) => handleChange('store', 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Address
                    </label>
                    <textarea
                      value={settings.store.address}
                      onChange={(e) => handleChange('store', 'address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Email Configuration</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpHost}
                        onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpPort}
                        onChange={(e) => handleChange('email', 'smtpPort', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpUser}
                        onChange={(e) => handleChange('email', 'smtpUser', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Notification Settings</h2>
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleChange('notifications', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Payment Settings</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={settings.payment.currency}
                        onChange={(e) => handleChange('payment', 'currency', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Order Amount
                      </label>
                      <input
                        type="number"
                        value={settings.payment.minimumOrder}
                        onChange={(e) => handleChange('payment', 'minimumOrder', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={settings.payment.taxRate}
                        onChange={(e) => handleChange('payment', 'taxRate', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingManager;