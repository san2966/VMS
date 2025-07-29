import React, { useState, useEffect } from 'react';
import { Visitor, Employee, Organization } from '../../types';

interface VisitDetailsProps {
  data: Partial<Visitor>;
  onComplete: (data: Partial<Visitor>) => void;
  onBack: () => void;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({ data, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    department: data.department || '',
    officerName: data.officerName || '',
    purposeToMeet: data.purposeToMeet || '',
    description: data.description || ''
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const purposeOptions = [
    'Meeting',
    'Proposal Submit',
    'Presentation',
    'Tender',
    'On-Duty',
    'Official',
    'Personal',
    'Other'
  ];

  useEffect(() => {
    const savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    // Filter employees by selected organization only
    // Don't filter by createdBy here since visitors should see all employees in the organization
    const organizationEmployees = data.organizationId 
      ? savedEmployees.filter((emp: Employee) => emp.organizationId === data.organizationId)
      : savedEmployees;
    
    setEmployees(organizationEmployees);
  }, [data.organizationId]);

  useEffect(() => {
    if (formData.department) {
      const filtered = employees.filter(emp => emp.department === formData.department);
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  }, [formData.department, employees]);

  const departments = [...new Set(employees.map(emp => emp.department))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const visitData = {
      ...formData,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: new Date().toLocaleTimeString(),
      id: Date.now().toString()
    };

    onComplete(visitData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Visit Details
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department Name *
          </label>
          <select
            value={formData.department}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                department: e.target.value,
                officerName: '' // Reset officer when department changes
              }));
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Officer/Employee Name *
          </label>
          <select
            value={formData.officerName}
            onChange={(e) => setFormData(prev => ({ ...prev, officerName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
            disabled={!formData.department}
          >
            <option value="">Select Officer/Employee</option>
            {filteredEmployees.map(emp => (
              <option key={emp.id} value={emp.name}>
                {emp.name} - {emp.designation}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Purpose to Meet *
          </label>
          <select
            value={formData.purposeToMeet}
            onChange={(e) => setFormData(prev => ({ ...prev, purposeToMeet: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Purpose</option>
            {purposeOptions.map(purpose => (
              <option key={purpose} value={purpose}>{purpose}</option>
            ))}
          </select>
        </div>

        {formData.purposeToMeet === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Please describe the purpose of your visit"
              required
            />
          </div>
        )}

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Save & Next
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitDetails;