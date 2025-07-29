import React, { useState, useEffect } from 'react';
import { UserPlus, LogIn, Sparkles, ArrowRight, Users, Shield, Building, AlertCircle } from 'lucide-react';
import VisitorRegistration from './VisitorRegistration';
import VisitorLogin from './VisitorLogin';

const VisitorMain: React.FC = () => {
  const [currentView, setCurrentView] = useState<'main' | 'register' | 'login' | 'existing-visitor'>('main');
  const [existingVisitorData, setExistingVisitorData] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  useEffect(() => {
    // Load organizations
    const savedOrganizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    setOrganizations(savedOrganizations);
    
    // Listen for organization updates
    const handleStorageChange = () => {
      const updatedOrganizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      setOrganizations(updatedOrganizations);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);
    
    // Load previously selected organization
    const savedSelection = localStorage.getItem('selectedOrganization');
    if (savedSelection && savedOrganizations.find((org: any) => org.id === savedSelection)) {
      setSelectedOrganization(savedSelection);
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleFoundVisitor = (visitorData: any) => {
    setExistingVisitorData(visitorData);
    setCurrentView('existing-visitor');
  };

  const getSelectedOrganizationName = () => {
    const org = organizations.find(o => o.id === selectedOrganization);
    return org?.name || 'No Organization Selected';
  };

  const canProceed = selectedOrganization && organizations.length > 0;

  if (currentView === 'register') {
    return <VisitorRegistration onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'login') {
    return <VisitorLogin onBack={() => setCurrentView('main')} onFoundVisitor={handleFoundVisitor} />;
  }

  if (currentView === 'existing-visitor') {
    return <VisitorRegistration onBack={() => setCurrentView('main')} existingVisitorData={existingVisitorData} />;
  }

  return (
    <div className="min-h-screen animated-bg pt-20 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl float" style={{ animationDelay: '4s' }}></div>
      
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="w-32 h-32 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-large hover-scale float">
            <Sparkles className="text-white" size={64} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome
            <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text">
              Visitor
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Experience seamless visitor management with our modern, secure, and user-friendly system
          </p>
        </div>

        {/* Organization Status */}
        {organizations.length === 0 && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass p-8 rounded-3xl border border-red-300/50 backdrop-blur-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No Organizations Available
              </h3>
              <p className="text-white/80 text-lg">
                No organizations have been set up yet. Please contact an administrator to add organizations before proceeding with visitor registration.
              </p>
            </div>
          </div>
        )}
        
        {organizations.length > 0 && !selectedOrganization && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass p-8 rounded-3xl border border-yellow-300/50 backdrop-blur-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Select Organization
              </h3>
              <p className="text-white/80 text-lg mb-6">
                Please select an organization from the header menu above to proceed with visitor registration.
              </p>
              <div className="flex items-center justify-center gap-2 text-white/70">
                <ArrowRight size={20} className="rotate-[-45deg]" />
                <span>Use the dropdown in the top navigation</span>
              </div>
            </div>
          </div>
        )}
        
        {organizations.length > 0 && selectedOrganization && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass p-6 rounded-3xl border border-green-300/50 backdrop-blur-xl text-center">
              <div className="flex items-center justify-center gap-3 text-white">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Building className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Currently Selected:</p>
                  <p className="text-xl font-bold">{getSelectedOrganizationName()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* New Registration Card */}
          <div className="group">
            <div className={`card-hover p-8 glass border border-white/20 backdrop-blur-xl ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="text-center">
                <div className="w-20 h-20 gradient-success rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium group-hover:shadow-large transition-smooth">
                  <UserPlus className="text-white" size={40} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  New Registration
                </h3>
                <p className="text-white/80 mb-8 text-lg leading-relaxed">
                  Register as a new visitor by providing your personal details and visit information
                </p>
                <button
                  onClick={() => canProceed && setCurrentView('register')}
                  disabled={!canProceed}
                  className={`w-full text-lg py-4 px-8 flex items-center justify-center gap-3 transition-bounce ${
                    canProceed 
                      ? 'btn-success group-hover:scale-105' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Users size={24} />
                  Register Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-smooth" />
                </button>
              </div>
            </div>
          </div>

          {/* Existing Visitor Card */}
          <div className="group">
            <div className={`card-hover p-8 glass border border-white/20 backdrop-blur-xl ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="text-center">
                <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium group-hover:shadow-large transition-smooth">
                  <LogIn className="text-white" size={40} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Existing Visitor
                </h3>
                <p className="text-white/80 mb-8 text-lg leading-relaxed">
                  Already registered? Continue your visit by entering your Aadhar number
                </p>
                <button
                  onClick={() => canProceed && setCurrentView('login')}
                  disabled={!canProceed}
                  className={`w-full text-lg py-4 px-8 flex items-center justify-center gap-3 transition-bounce ${
                    canProceed 
                      ? 'btn-primary group-hover:scale-105' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Shield size={24} />
                  Continue Visit
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-smooth" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass p-6 rounded-2xl border border-white/20 hover-lift">
              <div className="w-12 h-12 gradient-info rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Secure & Private</h4>
              <p className="text-white/70 text-sm">Your data is protected with enterprise-grade security</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/20 hover-lift">
              <div className="w-12 h-12 gradient-warning rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Modern Interface</h4>
              <p className="text-white/70 text-sm">Intuitive design for seamless user experience</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/20 hover-lift">
              <div className="w-12 h-12 gradient-danger rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Quick Process</h4>
              <p className="text-white/70 text-sm">Fast registration and check-in process</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/60 text-lg">
            Need assistance? Contact the reception desk for help.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisitorMain;