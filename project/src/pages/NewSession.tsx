import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { db, getSettings } from '../db/database';
import type { QCSession, Settings } from '../db/database';

/* ======  EMBEDDED CALCULATIONS  ====== */
const calcMean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
const calcSD     = (v: number[], m: number) => {
  if (v.length < 2) return 0;
  const sq = v.reduce((acc, x) => acc + (x - m) ** 2, 0);
  return Math.sqrt(sq / (v.length - 1));
};
const calcCV        = (sd: number, m: number) => (m === 0 ? 0 : sd / m);
const calcKvDev     = (m: number, nom: number) => (nom === 0 ? 0 : ((m - nom) / nom) * 100);
const checkKvPass   = (m: number, nom: number, pctLim: number, absLim: number) => {
  const dev = Math.abs(m - nom);
  const pctDev = (dev / nom) * 100;
  return pctDev <= pctLim && dev <= absLim;
};
const calcLinReg = (pts: { mas: number; dose: number }[]) => {
  const valid = pts.filter(p => Number.isFinite(p.mas) && Number.isFinite(p.dose) && p.mas > 0);
  if (valid.length < 2) return { slope: 0, rSquared: 0 };
  const n = valid.length;
  const sumX = valid.reduce((a, p) => a + p.mas, 0);
  const sumY = valid.reduce((a, p) => a + p.dose, 0);
  const sumXY = valid.reduce((a, p) => a + p.mas * p.dose, 0);
  const sumX2 = valid.reduce((a, p) => a + p.mas * p.mas, 0);
  const slope = sumXY / sumX2;
  const ssTot = valid.reduce((a, p) => a + (p.dose - sumY / n) ** 2, 0);
  const ssRes = valid.reduce((a, p) => a + (p.dose - slope * p.mas) ** 2, 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, rSquared };
};

export const NewSession: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [machineInfo, setMachineInfo] = useState({
    hospital: '', room: '', model: '', serial: '', tubeSerial: '', detectorSerial: '', techName: '', date: new Date().toISOString().split('T')[0]
  });

  const [kvTest, setKvTest] = useState({ nominalKv: 80, readings: ['', '', ''] as string[] });
  const [repeatabilityTest, setRepeatabilityTest] = useState({ nominalMas: 2, readings: ['', '', ''] as string[] });
  const [linearityTest, setLinearityTest] = useState({
    data: [
      { mas: '1', dose: '' },
      { mas: '2', dose: '' },
      { mas: '3', dose: '' },
      { mas: '4', dose: '' }
    ]
  });

  useEffect(() => { getSettings().then(setSettings); }, []);

  /* ---- calculators ---- */
  const kvRes   = () => {
    const r = kvTest.readings.map(parseFloat).filter(v => !isNaN(v));
    if (r.length !== 3) return null;
    const m = calcMean(r), sd = calcSD(r, m), cv = calcCV(sd, m), dev = calcKvDev(m, kvTest.nominalKv);
    const passed = checkKvPass(m, kvTest.nominalKv, settings?.kvDeviationLimit ?? 10, settings?.kvAbsoluteLimit ?? 5);
    return { readings: r, mean: m, sd, cv, deviation: dev, passed };
  };
  const repRes  = () => {
    const r = repeatabilityTest.readings.map(parseFloat).filter(v => !isNaN(v));
    if (r.length !== 3) return null;
    const m = calcMean(r), sd = calcSD(r, m), cv = calcCV(sd, m);
    const passed = cv <= (settings?.repeatabilityCvLimit ?? 0.05);
    return { readings: r, mean: m, sd, cv, passed };
  };
  const linRes  = () => {
    const pts = linearityTest.data
      .map(d => ({ mas: parseFloat(d.mas), dose: parseFloat(d.dose) }))
      .filter(p => Number.isFinite(p.mas) && Number.isFinite(p.dose) && p.mas > 0);
    if (pts.length < 2) return null;
    const { slope, rSquared } = calcLinReg(pts);
    const passed = rSquared >= (settings?.linearityRSquaredLimit ?? 0.98);
    return { data: pts, slope, rSquared, passed };
  };

  const handleSave = async () => {
    const k = kvRes(), p = repRes(), l = linRes();
    if (!k || !p || !l) { alert('Please complete all tests'); return; }
    const id = await db.sessions.add({
      ...machineInfo, kvTest: { nominalKv: kvTest.nominalKv, ...k },
      repeatabilityTest: { nominalMas: repeatabilityTest.nominalMas, ...p },
      linearityTest: l, createdAt: Date.now()
    } as QCSession);
    navigate(`/report/${id}`);
  };

  /* ---- render functions ---- */
  const step1 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Step 1: Machine Information</h2>
      <Input label="Hospital" value={machineInfo.hospital} onChange={v => setMachineInfo({ ...machineInfo, hospital: v })} required />
      <Input label="Room" value={machineInfo.room} onChange={v => setMachineInfo({ ...machineInfo, room: v })} required />
      <Input label="Model" value={machineInfo.model} onChange={v => setMachineInfo({ ...machineInfo, model: v })} required />
      <Input label="Serial Number" value={machineInfo.serial} onChange={v => setMachineInfo({ ...machineInfo, serial: v })} required />
      <Input label="Tube Serial" value={machineInfo.tubeSerial} onChange={v => setMachineInfo({ ...machineInfo, tubeSerial: v })} required />
      <Input label="Detector Serial" value={machineInfo.detectorSerial} onChange={v => setMachineInfo({ ...machineInfo, detectorSerial: v })} required />
      <Input label="Technician Name" value={machineInfo.techName} onChange={v => setMachineInfo({ ...machineInfo, techName: v })} required />
      <Input label="Date" type="date" value={machineInfo.date} onChange={v => setMachineInfo({ ...machineInfo, date: v })} required />
    </div>
  );

  const step2 = () => {
    const r = kvRes();
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Step 2: kV Accuracy & Repeatability</h2>
        <Input label="Nominal kV" type="number" min={40} value={kvTest.nominalKv} onChange={v => setKvTest({ ...kvTest, nominalKv: parseFloat(v) || 0 })} required />
        <div className="mb-6">
          <h3 className="font-semibold mb-4">3 Repeated Exposures</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead><tr className="bg-gray-100"><th className="border px-4 py-2">Exposure #</th><th className="border px-4 py-2">Measured kV</th></tr></thead>
            <tbody>
              {[0, 1, 2].map(i => (
                <tr key={i}>
                  <td className="border px-4 py-2 text-center">{i + 1}</td>
                  <td className="border px-4 py-2">
                    <input type="number" step="0.1" value={kvTest.readings[i]} onChange={e => setKvTest(s => ({ ...s, readings: s.readings.map((v, idx) => idx === i ? e.target.value : v) }))} className="w-full px-2 py-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {r && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-600">Mean</p><p className="text-lg font-semibold">{r.mean.toFixed(2)} kV</p></div>
              <div><p className="text-gray-600">SD</p><p className="text-lg font-semibold">{r.sd.toFixed(2)}</p></div>
              <div><p className="text-gray-600">CV</p><p className="text-lg font-semibold">{r.cv.toFixed(4)}</p></div>
              <div><p className="text-gray-600">% Deviation</p><p className="text-lg font-semibold">{r.deviation.toFixed(2)}%</p></div>
            </div>
            <div className="mt-4"><span className={`px-4 py-2 rounded-lg font-semibold ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.passed ? 'PASS' : 'FAIL'}</span></div>
          </div>
        )}
      </div>
    );
  };

  const step3 = () => {
    const r = repRes();
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Step 3: Output Repeatability</h2>
        <Input label="Nominal mAs" type="number" min={0.1} step={0.1} value={repeatabilityTest.nominalMas} onChange={v => setRepeatabilityTest({ ...repeatabilityTest, nominalMas: parseFloat(v) || 0 })} required />
        <div className="mb-6">
          <h3 className="font-semibold mb-4">3 Repeated Exposures</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead><tr className="bg-gray-100"><th className="border px-4 py-2">Exposure #</th><th className="border px-4 py-2">Dose (μGy)</th></tr></thead>
            <tbody>
              {[0, 1, 2].map(i => (
                <tr key={i}>
                  <td className="border px-4 py-2 text-center">{i + 1}</td>
                  <td className="border px-4 py-2">
                    <input type="number" step="0.01" value={repeatabilityTest.readings[i]} onChange={e => setRepeatabilityTest(s => ({ ...s, readings: s.readings.map((v, idx) => idx === i ? e.target.value : v) }))} className="w-full px-2 py-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {r && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Results</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-gray-600">Mean</p><p className="text-lg font-semibold">{r.mean.toFixed(2)} μGy</p></div>
              <div><p className="text-gray-600">SD</p><p className="text-lg font-semibold">{r.sd.toFixed(3)}</p></div>
              <div><p className="text-gray-600">CV</p><p className="text-lg font-semibold">{r.cv.toFixed(4)}</p></div>
            </div>
            <div className="mt-4"><span className={`px-4 py-2 rounded-lg font-semibold ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.passed ? 'PASS' : 'FAIL'}</span></div>
          </div>
        )}
      </div>
    );
  };

  const step4 = () => {
    const r = linRes();
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Step 4: Output Linearity</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-4">mAs vs Dose Measurements</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead><tr className="bg-gray-100"><th className="border px-4 py-2">mAs</th><th className="border px-4 py-2">Dose (μGy)</th></tr></thead>
            <tbody>
              {linearityTest.data.map((row, i) => (
                <tr key={i}>
                  <td className="border px-4 py-2"><input type="number" step="0.1" value={row.mas} onChange={e => setLinearityTest(s => ({ ...s, data: s.data.map((d, idx) => idx === i ? { ...d, mas: e.target.value } : d) }))} className="w-full px-2 py-1" /></td>
                  <td className="border px-4 py-2"><input type="number" step="0.01" value={row.dose} onChange={e => setLinearityTest(s => ({ ...s, data: s.data.map((d, idx) => idx === i ? { ...d, dose: e.target.value } : d) }))} className="w-full px-2 py-1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button variant="secondary" className="mt-4" onClick={() => setLinearityTest(s => ({ ...s, data: [...s.data, { mas: '', dose: '' }] }))}>Add Row</Button>
        </div>
        {r && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Results</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-600">Slope</p><p className="text-lg font-semibold">{r.slope.toFixed(4)}</p></div>
              <div><p className="text-gray-600">R²</p><p className="text-lg font-semibold">{r.rSquared.toFixed(4)}</p></div>
            </div>
            <div className="mt-4"><span className={`px-4 py-2 rounded-lg font-semibold ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.passed ? 'PASS' : 'FAIL'}</span></div>
          </div>
        )}
      </div>
    );
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
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step === currentStep
                        ? 'bg-blue-600 text-white'
                        : step < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && <div className="w-16 h-1 bg-gray-300 mx-2" />}
                </div>
              ))}
            </div>
          </div>

          {currentStep === 1 && step1()}
          {currentStep === 2 && step2()}
          {currentStep === 3 && step3()}
          {currentStep === 4 && step4()}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <Button onClick={() => setCurrentStep(s => s - 1)} variant="secondary">
                Previous
              </Button>
            )}
            {currentStep < 4 && (
              <Button onClick={() => setCurrentStep(s => s + 1)} className="ml-auto">
                Next
              </Button>
            )}
            {currentStep === 4 && (
              <Button onClick={handleSave} className="ml-auto">
                Save Session
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};