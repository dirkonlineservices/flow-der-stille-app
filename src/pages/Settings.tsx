import React from 'react';
import { motion } from 'motion/react';
import { Moon, Bell, User, Shield, LogOut, Trash2, Download, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await fetch('/api/user/delete', { method: 'POST' });
        window.location.href = '/';
      } catch (err) {
        alert('Failed to delete account');
      }
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/user/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data.json';
      a.click();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const handleUpgrade = async () => {
    try {
      await fetch('/api/user/upgrade', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      alert('Failed to upgrade');
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <header className="mb-8">
        <h1 className="text-4xl font-serif text-[var(--color-accent-olive)] mb-4">{t('settings.title')}</h1>
        <p className="text-stone-500">
          {t('settings.subtitle')}
        </p>
      </header>

      {user && (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-warm)] flex items-center justify-center text-2xl font-serif text-[var(--color-accent-olive)]">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-medium text-stone-800">{user.username}</h2>
                <p className="text-stone-500 text-sm">Member since {new Date().getFullYear()}</p>
                {user.is_premium && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full mt-1">
                    <Star size={10} fill="currentColor" /> Premium
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {!user.is_premium && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">Unlock Premium Features</h3>
                  <p className="text-sm text-amber-700">Get access to exclusive content and advanced tracking.</p>
                </div>
                <button 
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                >
                  Upgrade Now
                </button>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-4">Data & Privacy (GDPR)</h3>
              
              <button 
                onClick={handleExportData}
                className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors text-stone-600"
              >
                <Download size={20} />
                <div className="text-left">
                  <span className="block font-medium">Export My Data</span>
                  <span className="text-xs text-stone-400">Download a copy of all your stored data</span>
                </div>
              </button>

              <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-colors text-red-600"
              >
                <Trash2 size={20} />
                <div className="text-left">
                  <span className="block font-medium">Delete Account</span>
                  <span className="text-xs text-red-400">Permanently remove all your data</span>
                </div>
              </button>
            </div>

            <div className="pt-6 border-t border-stone-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors text-stone-600 font-medium"
              >
                <LogOut size={18} />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <SettingSection title={t('settings.sleep.title')}>
          <div className="grid grid-cols-2 gap-4">
            <TimeInput label={t('settings.sleep.bedtime')} defaultValue="22:00" />
            <TimeInput label={t('settings.sleep.wakeup')} defaultValue="07:00" />
          </div>
          <p className="text-xs text-stone-400 mt-3">
            {t('settings.sleep.desc')}
          </p>
        </SettingSection>

        <div className="h-px bg-stone-100" />

        <SettingSection title={t('settings.notifications.title')}>
          <Toggle label={t('settings.notifications.daily')} defaultChecked />
          <Toggle label={t('settings.notifications.breathing')} defaultChecked />
          <Toggle label={t('settings.notifications.winddown')} defaultChecked />
        </SettingSection>

        <div className="h-px bg-stone-100" />

        <SettingSection title={t('settings.environment.title')}>
          <Toggle label={t('settings.environment.darkmode')} />
          <Toggle label={t('settings.environment.nature')} defaultChecked />
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-8">
      <h3 className="text-xl font-serif text-stone-800 mb-6">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function TimeInput({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">{label}</label>
      <input 
        type="time" 
        defaultValue={defaultValue}
        className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] text-stone-800 font-medium outline-none"
      />
    </div>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-600">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-accent-olive)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-olive)]"></div>
      </label>
    </div>
  );
}

