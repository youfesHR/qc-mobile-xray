import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { db, getSettings } from '../db/database';
import type { QCSession, Settings } from '../db/database';

export const Report: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<QCSession | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (id) {
      const sessionData = await db.sessions.get(parseInt(id));
      const settingsData = await getSettings();
      setSession(sessionData || null);
      setSettings(settingsData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  /* ----------  CLEAN MULTI-PAGE PDF  ---------- */
  const handleExportPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const html2canvas = (window as any).html2canvas;
    const jsPDF = (window as any).jspdf.jsPDF;
    if (!html2canvas || !jsPDF) { alert('PDF libs not loaded'); return; }

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`QC-Report-${session?.date}-${session?.serial}.pdf`);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <p>Loading...</p>
          </Card>
        </div>
      </div>
    );
  }

  const allPassed = session.kvTest.passed && session.repeatabilityTest.passed && session.linearityTest.passed;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex gap-4 print:hidden">
          <Button onClick={() => navigate('/')} variant="secondary">
            ← Back to Dashboard
          </Button>
          <Button onClick={handlePrint}>Print Report</Button>
          <Button onClick={handleExportPDF}>Export PDF</Button>
        </div>

        <Card id="report-content">
          <div className="mb-8">
            {settings?.hospitalLogo && (
              <div className="mb-4">
                <img src={settings.hospitalLogo} alt="Hospital Logo" className="h-20 object-contain" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-center mb-2">X-Ray QC Report</h1>
            <p className="text-center text-gray-600">Mobile X-Ray Machine Quality Control</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300">Machine Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hospital</p>
                <p className="font-semibold">{session.hospital}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room</p>
                <p className="font-semibold">{session.room}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-semibold">{session.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Serial Number</p>
                <p className="font-semibold">{session.serial}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tube Serial</p>
                <p className="font-semibold">{session.tubeSerial}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Detector Serial</p>
                <p className="font-semibold">{session.detectorSerial}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Technician</p>
                <p className="font-semibold">{session.techName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Test Date</p>
                <p className="font-semibold">{session.date}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300">kV Accuracy & Repeatability</h2>
            <p className="mb-2"><strong>Nominal kV:</strong> {session.kvTest.nominalKv} kV</p>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Exposure #</th>
                  <th className="border border-gray-300 px-4 py-2">Measured kV</th>
                </tr>
              </thead>
              <tbody>
                {session.kvTest.readings.map((reading, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{i + 1}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{reading.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Mean</p>
                <p className="font-semibold">{session.kvTest.mean.toFixed(2)} kV</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Standard Deviation</p>
                <p className="font-semibold">{session.kvTest.sd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CV</p>
                <p className="font-semibold">{session.kvTest.cv.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">% Deviation</p>
                <p className="font-semibold">{session.kvTest.deviation.toFixed(2)}%</p>
              </div>
            </div>
            <div>
              <span
                className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  session.kvTest.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {session.kvTest.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300">Output Repeatability</h2>
            <p className="mb-2"><strong>Nominal mAs:</strong> {session.repeatabilityTest.nominalMas} mAs</p>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Exposure #</th>
                  <th className="border border-gray-300 px-4 py-2">Dose (μGy)</th>
                </tr>
              </thead>
              <tbody>
                {session.repeatabilityTest.readings.map((reading, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{i + 1}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{reading.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Mean</p>
                <p className="font-semibold">{session.repeatabilityTest.mean.toFixed(2)} μGy</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Standard Deviation</p>
                <p className="font-semibold">{session.repeatabilityTest.sd.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CV</p>
                <p className="font-semibold">{session.repeatabilityTest.cv.toFixed(4)}</p>
              </div>
            </div>
            <div>
              <span
                className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  session.repeatabilityTest.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {session.repeatabilityTest.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300">Output Linearity</h2>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">mAs</th>
                  <th className="border border-gray-300 px-4 py-2">Dose (μGy)</th>
                </tr>
              </thead>
              <tbody>
                {session.linearityTest.data.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.mas.toFixed(1)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.dose.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Slope</p>
                <p className="font-semibold">{session.linearityTest.slope.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">R²</p>
                <p className="font-semibold">{session.linearityTest.rSquared.toFixed(4)}</p>
              </div>
            </div>
            <div>
              <span
                className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  session.linearityTest.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {session.linearityTest.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-gray-300">
            <h2 className="text-2xl font-bold text-center mb-4">Overall Result</h2>
            <div className="text-center">
              <span
                className={`inline-block px-8 py-4 rounded-lg text-2xl font-bold ${
                  allPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {allPassed ? 'ALL TESTS PASSED' : 'ONE OR MORE TESTS FAILED'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};