import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, AlertCircle } from 'lucide-react';
import { Visitor, Organization } from '../../types';

interface PersonalDetailsProps {
  data: Partial<Visitor>;
  onComplete: (data: Partial<Visitor>) => void;
  onCancel: () => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ data, onComplete, onCancel }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [formData, setFormData] = useState({
    organizationId: data.organizationId || '',
    fullName: data.fullName || '',
    mobileNumber: data.mobileNumber || '',
    aadharNumber: data.aadharNumber || '',
    numberOfVisitors: data.numberOfVisitors || 1,
    teamMemberNames: data.teamMemberNames || '',
    photo: data.photo || ''
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load organizations - for visitors, show all available organizations
    // But the selection is controlled by the header dropdown
    const savedOrganizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    setOrganizations(savedOrganizations);
    
    // Get selected organization from header
    const headerSelectedOrg = localStorage.getItem('selectedOrganization');
    
    if (headerSelectedOrg && savedOrganizations.find((org: Organization) => org.id === headerSelectedOrg)) {
      setSelectedOrganization(headerSelectedOrg);
      setFormData(prev => ({ ...prev, organizationId: headerSelectedOrg }));
    } else if (savedOrganizations.length > 0) {
      // Don't auto-select - require explicit selection from header
      setSelectedOrganization('');
      setFormData(prev => ({ ...prev, organizationId: '' }));
    }
  }, []);

  const getSelectedOrganizationName = () => {
    const org = organizations.find(o => o.id === selectedOrganization);
    return org?.name || 'No Organization Selected';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        setShowPreview(false);
      }
    } catch (error) {
      alert('Camera access denied. Please allow camera access to capture photo.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, photo: photoData }));
        setShowPreview(true);
        stopCamera();
        
        // Simulate saving to cloud
        console.log('Photo saved to cloud:', photoData.substring(0, 50) + '...');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const retakePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
    setShowPreview(false);
    startCamera();
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
    setShowPreview(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrganization) {
      alert('Please select an organization from the header menu first.');
      return;
    }
    
    onComplete({ ...formData, organizationId: selectedOrganization });
  };

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-white" size={48} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Organizations Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No organizations have been set up yet. Please contact an administrator to add organizations first.
        </p>
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!selectedOrganization) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-white" size={48} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Organization Not Selected
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please select an organization from the header menu before proceeding with registration.
        </p>
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Go Back to Select Organization
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Personal Details
      </h2>

      {/* Selected Organization Display */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ORG</span>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Registering for Organization:
            </p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {getSelectedOrganizationName()}
            </p>
          </div>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
          To change organization, use the dropdown in the header menu above.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setFormData(prev => ({ ...prev, mobileNumber: value }));
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aadhar Number *
            </label>
            <input
              type="text"
              value={formData.aadharNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 12) {
                  setFormData(prev => ({ ...prev, aadharNumber: value }));
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              maxLength={12}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Visitors *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.numberOfVisitors}
              onChange={(e) => setFormData(prev => ({ ...prev, numberOfVisitors: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        {formData.numberOfVisitors > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Member Names *
            </label>
            <textarea
              value={formData.teamMemberNames}
              onChange={(e) => setFormData(prev => ({ ...prev, teamMemberNames: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Enter names separated by commas"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Visitor Photo (Optional)
          </label>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            {!formData.photo && !isCapturing && (
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Camera className="text-gray-400" size={48} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No photo captured yet
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all inline-flex items-center gap-2"
                >
                  <Camera size={20} />
                  Start Camera
                </button>
              </div>
            )}

            {isCapturing && (
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none opacity-50"></div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all inline-flex items-center gap-2"
                  >
                    <Camera size={20} />
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showPreview && formData.photo && (
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <img
                    src={formData.photo}
                    alt="Captured photo preview"
                    className="w-64 h-48 object-cover rounded-lg shadow-lg mx-auto"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                    <Camera size={16} />
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    ✓ Photo captured and saved to cloud successfully!
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                  >
                    <X size={16} />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Save & Next
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PersonalDetails;