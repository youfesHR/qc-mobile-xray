import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { db, getSettings } from '../db/database';
import type { QCSession } from '../db/database';

export const ExportPDF: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<QCSession[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const allSessions = await db.sessions.orderBy('createdAt').reverse().toArray();
    setSessions(allSessions);
  };

  const toggleSession = (id: number) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSessions(newSelected);
  };

  const handleExportSelected = async () => {
    if (selectedSessions.size === 0) {
      alert('Please select at least one session to export');
      return;
    }

    const html2canvas = (window as any).html2canvas;
    const jsPDF = (window as any).jspdf.jsPDF;

    if (!html2canvas || !jsPDF) {
      alert('PDF export libraries not loaded. Please check your internet connection and refresh the page.');
      return;
    }

    const settings = await getSettings();
    const pdf = new jsPDF('p', 'mm', 'a4');
    let isFirstPage = true;

    for (const sessionId of Array.from(selectedSessions)) {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) continue;

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      const reportContent = generateReportHTML(session, settings);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = reportContent;
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '20mm';
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`QC-Reports-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateReportHTML = (session: QCSession, settings: any): string => {
    const allPassed = session.kvTest.passed && session.repeatabilityTest.passed && session.linearityTest.passed;

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        ${settings.hospitalLogo ? `<img src="${settings.hospitalLogo}" style="height: 60px; margin-bottom: 20px;" />` : ''}
        <h1 style="text-align: center; font-size: 28px; margin-bottom: 8px;">X-Ray QC Report</h1>
        <p style="text-align: center; color: #666; margin-bottom: 32px;">Mobile X-Ray Machine Quality Control</p>

        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #ccc;">Machine Information</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
          <div><p style="color: #666; font-size: 12px; margin: 0;">Hospital</p><p style="font-weight: 600; margin: 4px 0 0 0;">${session.hospital}</p></div>
          <div><p style="color: #666; font-size: 12px; margin: 0;">Room</p><p style="font-weight: 600; margin: 4px 0 0 0;">${session.room}</p></div>
          <div><p style="color: #666; font-size: 12px; margin: 0;">Model</p><p style="font-weight: 600; margin: 4px 0 0 0;">${session.model}</p></div>
          <div><p style="color: #666; font-size: 12px; margin: 0;">Serial Number</p><p style="font-weight: 600; margin: 4px 0 0 0;">${session.serial}</p></div>
          <div><p style="color: #666; font-size: 12px; margin: 0;">Technician</p><p style="font-weight: 600; margin: 4px 0 0 0;">${session.techName}</p></div>
          <div><p style="color: #666; font-size: 12px; margin: 0;">Test Date</p><p style="font-weight: 600; margin: 4px 0 0 0;">${session.date}</p></div>
        </div>

        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #ccc;">kV Accuracy & Repeatability</h2>
        <p style="margin-bottom: 8px;"><strong>Nominal kV:</strong> ${session.kvTest.nominalKv} kV</p>
        <p style="margin-bottom: 16px;"><strong>Mean:</strong> ${session.kvTest.mean.toFixed(2)} kV | <strong>SD:</strong> ${session.kvTest.sd.toFixed(2)} | <strong>CV:</strong> ${session.kvTest.cv.toFixed(4)} | <strong>Deviation:</strong> ${session.kvTest.deviation.toFixed(2)}%</p>
        <div style="display: inline-block; padding: 8px 16px; border-radius: 8px; font-weight: 600; background-color: ${session.kvTest.passed ? '#dcfce7' : '#fee2e2'}; color: ${session.kvTest.passed ? '#166534' : '#991b1b'}; margin-bottom: 32px;">
          ${session.kvTest.passed ? 'PASS' : 'FAIL'}
        </div>

        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #ccc;">Output Repeatability</h2>
        <p style="margin-bottom: 8px;"><strong>Nominal mAs:</strong> ${session.repeatabilityTest.nominalMas} mAs</p>
        <p style="margin-bottom: 16px;"><strong>Mean:</strong> ${session.repeatabilityTest.mean.toFixed(2)} μGy | <strong>SD:</strong> ${session.repeatabilityTest.sd.toFixed(3)} | <strong>CV:</strong> ${session.repeatabilityTest.cv.toFixed(4)}</p>
        <div style="display: inline-block; padding: 8px 16px; border-radius: 8px; font-weight: 600; background-color: ${session.repeatabilityTest.passed ? '#dcfce7' : '#fee2e2'}; color: ${session.repeatabilityTest.passed ? '#166534' : '#991b1b'}; margin-bottom: 32px;">
          ${session.repeatabilityTest.passed ? 'PASS' : 'FAIL'}
        </div>

        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #ccc;">Output Linearity</h2>
        <p style="margin-bottom: 16px;"><strong>Slope:</strong> ${session.linearityTest.slope.toFixed(4)} | <strong>R²:</strong> ${session.linearityTest.rSquared.toFixed(4)}</p>
        <div style="display: inline-block; padding: 8px 16px; border-radius: 8px; font-weight: 600; background-color: ${session.linearityTest.passed ? '#dcfce7' : '#fee2e2'}; color: ${session.linearityTest.passed ? '#166534' : '#991b1b'}; margin-bottom: 32px;">
          ${session.linearityTest.passed ? 'PASS' : 'FAIL'}
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 2px solid #ccc; margin-top: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Overall Result</h2>
          <div style="display: inline-block; padding: 16px 32px; border-radius: 8px; font-size: 20px; font-weight: bold; background-color: ${allPassed ? '#dcfce7' : '#fee2e2'}; color: ${allPassed ? '#166534' : '#991b1b'};">
            ${allPassed ? 'ALL TESTS PASSED' : 'ONE OR MORE TESTS FAILED'}
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => navigate('/')} variant="secondary">
            ← Back to Dashboard
          </Button>
        </div>

        <Card>
          <h1 className="text-3xl font-bold mb-6">Export Reports to PDF</h1>

          {sessions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No sessions available to export</p>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">Select the sessions you want to export as a single PDF document.</p>
                <div className="flex gap-4 mb-4">
                  <Button
                    onClick={() => setSelectedSessions(new Set(sessions.map(s => s.id!)))}
                    variant="secondary"
                  >
                    Select All
                  </Button>
                  <Button onClick={() => setSelectedSessions(new Set())} variant="secondary">
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {sessions.map((session) => {
                  const allPassed = session.kvTest.passed && session.repeatabilityTest.passed && session.linearityTest.passed;
                  return (
                    <div
                      key={session.id}
                      onClick={() => toggleSession(session.id!)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSessions.has(session.id!)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedSessions.has(session.id!)}
                            onChange={() => {}}
                            className="w-5 h-5"
                          />
                          <div>
                            <p className="font-semibold">
                              {session.hospital} - {session.model}
                            </p>
                            <p className="text-sm text-gray-600">
                              {session.date} | {session.techName}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            allPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {allPassed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button onClick={handleExportSelected} disabled={selectedSessions.size === 0}>
                Export Selected ({selectedSessions.size}) to PDF
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
