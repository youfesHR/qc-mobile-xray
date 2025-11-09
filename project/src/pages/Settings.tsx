import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { db, getSettings, updateSettings } from '../db/database';
import type { Settings } from '../db/database';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({
    hospitalLogo: '',
    kvDeviationLimit: 10,
    kvAbsoluteLimit: 5,
    repeatabilityCvLimit: 0.05,
    linearityRSquaredLimit: 0.98
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings({ ...settings, hospitalLogo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await updateSettings(settings);
    alert('Settings saved successfully');
  };

  const handleDeleteAllData = async () => {
    if (confirm('Are you sure you want to delete ALL QC session data? This cannot be undone!')) {
      if (confirm('This is your final warning. Delete ALL data?')) {
        await db.sessions.clear();
        alert('All data has been deleted');
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => navigate('/')} variant="secondary">
            ← Back to Dashboard
          </Button>
        </div>

        <Card>
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Hospital Logo</h2>
            {settings.hospitalLogo && (
              <div className="mb-4">
                <img src={settings.hospitalLogo} alt="Hospital Logo" className="h-20 object-contain border border-gray-300 rounded p-2" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-600 mt-2">Upload your hospital logo (will be shown on reports)</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Tolerance Limits</h2>
            <p className="text-sm text-gray-600 mb-4">
              Default values are based on IEC standards. Modify with caution.
            </p>

            <Input
              label="kV Deviation Limit (%)"
              value={settings.kvDeviationLimit}
              onChange={(v) => setSettings({ ...settings, kvDeviationLimit: parseFloat(v) || 0 })}
              type="number"
              min={0}
              step={0.1}
            />

            <Input
              label="kV Absolute Limit (kV)"
              value={settings.kvAbsoluteLimit}
              onChange={(v) => setSettings({ ...settings, kvAbsoluteLimit: parseFloat(v) || 0 })}
              type="number"
              min={0}
              step={0.1}
            />

            <Input
              label="Repeatability CV Limit"
              value={settings.repeatabilityCvLimit}
              onChange={(v) => setSettings({ ...settings, repeatabilityCvLimit: parseFloat(v) || 0 })}
              type="number"
              min={0}
              step={0.01}
            />

            <Input
              label="Linearity R² Limit"
              value={settings.linearityRSquaredLimit}
              onChange={(v) => setSettings({ ...settings, linearityRSquaredLimit: parseFloat(v) || 0 })}
              type="number"
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <div className="mb-8">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>

          <div className="pt-6 border-t-2 border-gray-300">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            <p className="text-gray-600 mb-4">
              Permanently delete all QC session data from this device. This action cannot be undone.
            </p>
            <Button onClick={handleDeleteAllData} variant="danger">
              Delete All Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
