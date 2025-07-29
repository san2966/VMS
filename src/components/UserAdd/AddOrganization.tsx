import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Organization } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AddOrganizationProps {
  onBack: () => void;
  onComplete: () => void;
}

const AddOrganization: React.FC<AddOrganizationProps> = ({ onBack, onComplete }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    logo: '',
    type: 'government' as 'government' | 'private',
    governmentType: '' as 'state' | 'central' | '',
    ministryName: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const organization: Organization = {
        id: Date.now().toString(),
        name: formData.name,
        address: formData.address,
        logo: formData.logo,
        type: formData.type,
        governmentType: formData.governmentType || undefined,
        ministryName: formData.ministryName || undefined,
        createdBy: currentUser?.id || '',
        createdAt: new Date().toISOString()
      };

      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      organizations.push(organization);
      localStorage.setItem('organizations', JSON.stringify(organizations));

      onComplete();
    } catch (error) {
      alert('Failed to create organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Organization
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type of Organization *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'government' | 'private',
                    governmentType: '',
                    ministryName: ''
                  }));
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="government">Government</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {formData.type === 'government' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type of Government *
                </label>
                <select
                  value={formData.governmentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, governmentType: e.target.value as 'state' | 'central' }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Government Type</option>
                  <option value="state">State</option>
                  <option value="central">Central</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name of Ministry *
                </label>
                <input
                  type="text"
                  value={formData.ministryName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ministryName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Logo
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                <Upload size={20} />
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {formData.logo && (
                <img src={formData.logo} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg" />
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganization;