import React, { useEffect, useRef } from 'react';
import { Printer, UserPlus, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Visitor, Organization, Employee } from '../../types';

interface VisitorReceiptProps {
  visitorData: Visitor;
  onNewVisitor: () => void;
}

const VisitorReceipt: React.FC<VisitorReceiptProps> = ({ visitorData, onNewVisitor }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate QR Code
    if (qrCanvasRef.current) {
      // Get organization and employee details for complete receipt data
      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const organization = organizations.find((org: Organization) => org.id === visitorData.organizationId);
      const employee = employees.find((emp: Employee) => emp.name === visitorData.officerName);
      
      // Create comprehensive visitor receipt data for QR code
      const visitDateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      
      const qrData = `═══════════════════════════════
        VISITOR MANAGEMENT SYSTEM
        Official Visitor Receipt
═══════════════════════════════

ORGANIZATION: ${organization?.name || 'Unknown Organization'}
${organization?.address ? `Address: ${organization.address}` : ''}

VISITOR INFORMATION:
• Full Name: ${visitorData.fullName}
• Mobile Number: ${visitorData.mobileNumber}
• Aadhar Number: ${visitorData.aadharNumber}
• Number of Visitors: ${visitorData.numberOfVisitors}
${visitorData.teamMemberNames ? `• Team Members: ${visitorData.teamMemberNames}` : ''}

VISIT DETAILS:
• Department: ${visitorData.department}
• Officer/Employee: ${visitorData.officerName}
${employee?.designation ? `• Designation: ${employee.designation}` : ''}
${employee?.location ? `• Location: ${employee.location}` : ''}
• Purpose: ${visitorData.purposeToMeet}
${visitorData.description ? `• Description: ${visitorData.description}` : ''}

VISIT DATE & TIME:
${visitDateTime}

RECEIPT ID: ${visitorData.id}

═══════════════════════════════
Please carry this receipt during your visit.
Thank you for visiting!
═══════════════════════════════`;
      
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'L' // Lower error correction for more data capacity
      });
    }
  }, [visitorData]);

  const saveVisitorData = () => {
    // Save visitor data to localStorage
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    
    // Get the organization creator info for proper data attribution
    const selectedOrgCreator = localStorage.getItem('selectedOrgCreator');
    
    const newVisitor = {
      ...visitorData,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: new Date().toLocaleTimeString(),
      // Store which admin user's organization this visitor is registered under
      registeredUnder: selectedOrgCreator || visitorData.organizationId
    };
    
    // Check if visitor already exists to prevent duplicates
    const existingVisitor = visitors.find((v: any) => v.id === newVisitor.id);
    if (!existingVisitor) {
      visitors.push(newVisitor);
      localStorage.setItem('visitors', JSON.stringify(visitors));
    }
    
    // Clear the selected organization creator after successful registration
    localStorage.removeItem('selectedOrgCreator');
    
    return !existingVisitor; // Return true if new visitor was saved
  };

  const handlePrint = () => {
    // Save visitor data first
    const wasNewVisitor = saveVisitorData();

    // Get employee location for receipt
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const employee = employees.find((emp: Employee) => emp.name === visitorData.officerName);
    const location = employee?.location || 'Not specified';

    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Visitor Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .qr-section { text-align: center; margin-top: 30px; }
            .footer { text-align: center; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>VISITOR MANAGEMENT SYSTEM</h2>
            <p>Official Visitor Receipt</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">Full Name:</span> <span>${visitorData.fullName}</span></div>
            <div class="row"><span class="label">Mobile Number:</span> <span>${visitorData.mobileNumber}</span></div>
            <div class="row"><span class="label">Aadhar Number:</span> <span>${visitorData.aadharNumber}</span></div>
            <div class="row"><span class="label">Number of Visitors:</span> <span>${visitorData.numberOfVisitors}</span></div>
            ${visitorData.teamMemberNames ? `<div class="row"><span class="label">Team Members:</span> <span>${visitorData.teamMemberNames}</span></div>` : ''}
            <div class="row"><span class="label">Department:</span> <span>${visitorData.department}</span></div>
            <div class="row"><span class="label">Officer/Employee:</span> <span>${visitorData.officerName}</span></div>
            <div class="row"><span class="label">Location:</span> <span>${location}</span></div>
            <div class="row"><span class="label">Purpose:</span> <span>${visitorData.purposeToMeet}</span></div>
            ${visitorData.description ? `<div class="row"><span class="label">Description:</span> <span>${visitorData.description}</span></div>` : ''}
            <div class="row"><span class="label">Visit Date & Time:</span> <span>${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</span></div>
          </div>
          <div class="footer">
            <p>Thank you for visiting. Please carry this receipt during your visit.</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
    
    if (wasNewVisitor) {
      alert('Receipt printed and visitor data saved successfully!');
    } else {
      alert('Receipt printed successfully! (Visitor data was already saved)');
    }
  };

  const handleNewVisitor = () => {
    // Save visitor data first
    const wasNewVisitor = saveVisitorData();
    
    if (wasNewVisitor) {
      alert('Visitor data saved successfully! Ready for new registration.');
    } else {
      alert('Visitor data was already saved. Ready for new registration.');
    }
    
    // Then proceed with new visitor flow
    onNewVisitor();
  };

  // Get organization and employee details for display
  const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  const organization = organizations.find((org: Organization) => org.id === visitorData.organizationId);
  const employee = employees.find((emp: Employee) => emp.name === visitorData.officerName);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Visitor Receipt
      </h2>

      <div className="bg-white dark:bg-gray-50 border-2 border-gray-200 dark:border-gray-300 rounded-lg p-8 print:shadow-none print:border-black">
        {/* Header */}
        <div className="text-center mb-8 border-b border-gray-300 pb-6">
          {organization?.logo ? (
            <img src={organization.logo} alt="Organization Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">VMS</span>
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {organization?.name || 'VISITOR MANAGEMENT SYSTEM'}
          </h3>
          <p className="text-gray-600">Official Visitor Receipt</p>
        </div>

        {/* Visitor Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Full Name
              </label>
              <p className="text-lg text-gray-900 font-medium">
                {visitorData.fullName}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Mobile Number
              </label>
              <p className="text-lg text-gray-900">
                {visitorData.mobileNumber}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Aadhar Number
              </label>
              <p className="text-lg text-gray-900">
                {visitorData.aadharNumber}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Number of Visitors
              </label>
              <p className="text-lg text-gray-900">
                {visitorData.numberOfVisitors}
              </p>
            </div>
            
            {visitorData.teamMemberNames && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Team Members
                </label>
                <p className="text-lg text-gray-900">
                  {visitorData.teamMemberNames}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Department
              </label>
              <p className="text-lg text-gray-900 font-medium">
                {visitorData.department}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Officer/Employee
              </label>
              <p className="text-lg text-gray-900">
                {visitorData.officerName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Location
              </label>
              <p className="text-lg text-gray-900">
                {employee?.location || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Purpose
              </label>
              <p className="text-lg text-gray-900">
                {visitorData.purposeToMeet}
              </p>
            </div>
            
            {visitorData.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Description
                </label>
                <p className="text-lg text-gray-900">
                  {visitorData.description}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Visit Date & Time
              </label>
              <p className="text-lg text-gray-900">
                {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="text-center border-t border-gray-300 pt-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode size={20} />
            <span className="font-medium text-gray-700">Digital Receipt</span>
          </div>
          <canvas ref={qrCanvasRef} className="mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            Scan QR code to view digital receipt
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-300">
          <p className="text-sm text-gray-500">
            Thank you for visiting. Please carry this receipt during your visit.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
        >
          <Printer size={20} />
          Print Receipt
        </button>
        <button
          onClick={handleNewVisitor}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all"
        >
          <UserPlus size={20} />
          New Visitor
        </button>
      </div>
    </div>
  );
};

export default VisitorReceipt;