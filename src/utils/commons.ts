export const numberEnumToArray = (
  numberEnum: Record<string, number | string>
) => {
  return Object.values(numberEnum).filter(
    (value) => typeof value === 'number'
  ) as number[]
}
