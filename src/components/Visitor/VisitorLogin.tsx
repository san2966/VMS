import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';

interface VisitorLoginProps {
  onBack: () => void;
  onFoundVisitor: (visitorData: any) => void;
}

const VisitorLogin: React.FC<VisitorLoginProps> = ({ onBack, onFoundVisitor }) => {
  const [aadharNumber, setAadharNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call to fetch visitor details
    setTimeout(() => {
      const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
      const visitor = visitors.find((v: any) => v.aadharNumber === aadharNumber);
      
      if (visitor) {
        // Redirect to stage 2 with prefilled data
        onFoundVisitor(visitor);
      } else {
        setError('Visitor not found. Please register first.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visitor Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your Aadhar number to retrieve your details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aadhar Number
            </label>
            <input
              type="text"
              value={aadharNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 12) {
                  setAadharNumber(value);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter 12-digit Aadhar number"
              maxLength={12}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {aadharNumber.length}/12 digits
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || aadharNumber.length !== 12}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Searching...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorLogin;