export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateSD = (values: number[], mean: number): number => {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};

export const calculateCV = (sd: number, mean: number): number => {
  if (mean === 0) return 0;
  return sd / mean;
};

export const calculateKvDeviation = (mean: number, nominal: number): number => {
  if (nominal === 0) return 0;
  return ((mean - nominal) / nominal) * 100;
};

export const checkKvPassed = (
  mean: number,
  nominal: number,
  percentLimit: number,
  absoluteLimit: number
): boolean => {
  const percentDeviation = Math.abs(calculateKvDeviation(mean, nominal));
  const absoluteDeviation = Math.abs(mean - nominal);
  return percentDeviation <= percentLimit && absoluteDeviation <= absoluteLimit;
};

export const calculateLinearRegression = (
  data: Array<{ mas: number; dose: number }>
): { slope: number; rSquared: number } => {
  if (data.length < 2) return { slope: 0, rSquared: 0 };

  const sumY = data.reduce((sum, d) => sum + d.dose, 0);
  const sumXY = data.reduce((sum, d) => sum + d.mas * d.dose, 0);
  const sumXX = data.reduce((sum, d) => sum + d.mas * d.mas, 0);

  const slope = sumXY / sumXX;

  const yMean = sumY / data.length;
  const ssTotal = data.reduce((sum, d) => sum + Math.pow(d.dose - yMean, 2), 0);
  const ssResidual = data.reduce((sum, d) => {
    const predicted = slope * d.mas;
    return sum + Math.pow(d.dose - predicted, 2);
  }, 0);

  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  return { slope, rSquared };
};
