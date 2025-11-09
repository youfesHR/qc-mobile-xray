import Dexie, { Table } from 'dexie';

export interface QCSession {
  id?: number;
  hospital: string;
  room: string;
  model: string;
  serial: string;
  tubeSerial: string;
  detectorSerial: string;
  techName: string;
  date: string;
  kvTest: {
    nominalKv: number;
    readings: number[];
    mean: number;
    sd: number;
    cv: number;
    deviation: number;
    passed: boolean;
  };
  repeatabilityTest: {
    nominalMas: number;
    readings: number[];
    mean: number;
    sd: number;
    cv: number;
    passed: boolean;
  };
  linearityTest: {
    data: Array<{ mas: number; dose: number }>;
    slope: number;
    rSquared: number;
    passed: boolean;
  };
  createdAt: number;
}

export interface Settings {
  id?: number;
  hospitalLogo: string;
  kvDeviationLimit: number;
  kvAbsoluteLimit: number;
  repeatabilityCvLimit: number;
  linearityRSquaredLimit: number;
}

export class QCDatabase extends Dexie {
  sessions!: Table<QCSession, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('XRayQCDatabase');
    this.version(1).stores({
      sessions: '++id, hospital, date, techName, createdAt',
      settings: '++id'
    });
  }
}

export const db = new QCDatabase();

export const getSettings = async (): Promise<Settings> => {
  let settings = await db.settings.get(1);
  if (!settings) {
    settings = {
      id: 1,
      hospitalLogo: '',
      kvDeviationLimit: 10,
      kvAbsoluteLimit: 5,
      repeatabilityCvLimit: 0.05,
      linearityRSquaredLimit: 0.98
    };
    await db.settings.put(settings);
  }
  return settings;
};

export const updateSettings = async (settings: Settings): Promise<void> => {
  await db.settings.put({ ...settings, id: 1 });
};
