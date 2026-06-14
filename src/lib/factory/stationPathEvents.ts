export function crossedPathThreshold(prevPathT: number, pathT: number, threshold: number) {
  const prev = prevPathT - Math.floor(prevPathT);
  const curr = pathT - Math.floor(pathT);
  if (prev <= curr) {
    return prev < threshold && curr >= threshold;
  }
  return prev < threshold || curr >= threshold;
}
