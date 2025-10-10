export const toCOP = (value: number): number => {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0
  }

  const rounded = Math.round(value * 100) / 100
  return rounded < 0 ? 0 : rounded
}
