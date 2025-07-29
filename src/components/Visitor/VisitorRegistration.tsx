import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, Building, Receipt } from 'lucide-react';
import PersonalDetails from './PersonalDetails';
import VisitDetails from './VisitDetails';
import VisitorReceipt from './VisitorReceipt';
import { Visitor } from '../../types';

interface VisitorRegistrationProps {
  onBack: () => void;
  existingVisitorData?: any;
}

const VisitorRegistration: React.FC<VisitorRegistrationProps> = ({ onBack, existingVisitorData }) => {
  const [currentStage, setCurrentStage] = useState(existingVisitorData ? 2 : 1);
  const [visitorData, setVisitorData] = useState<Partial<Visitor>>(existingVisitorData || {});

  const stages = [
    { id: 1, title: 'Personal Details', icon: User },
    { id: 2, title: 'Visit Details', icon: Building },
    { id: 3, title: 'Receipt', icon: Receipt }
  ];

  const handleStageComplete = (data: Partial<Visitor>) => {
    setVisitorData(prev => ({ ...prev, ...data }));
    if (currentStage < 3) {
      setCurrentStage(currentStage + 1);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {existingVisitorData ? 'Continue Visit' : 'Visitor Registration'}
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = currentStage === stage.id;
            const isCompleted = currentStage > stage.id;
            
            return (
              <div key={stage.id} className="flex items-center">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  <Icon size={20} />
                  <span className="font-medium">{stage.title}</span>
                </div>
                {index < stages.length - 1 && (
                  <ArrowRight className="mx-4 text-gray-400" size={20} />
                )}
              </div>
            );
          })}
        </div>

        {/* Stage Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {currentStage === 1 && (
            <PersonalDetails
              data={visitorData}
              onComplete={handleStageComplete}
              onCancel={onBack}
            />
          )}
          {currentStage === 2 && (
            <VisitDetails
              data={visitorData}
              onComplete={handleStageComplete}
              onBack={() => setCurrentStage(1)}
            />
          )}
          {currentStage === 3 && (
            <VisitorReceipt
              visitorData={visitorData as Visitor}
              onNewVisitor={() => {
                setCurrentStage(1);
                setVisitorData({});
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorRegistration;