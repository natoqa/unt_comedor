import { ValidationError } from './errors';

/** Normaliza req.params de Express (@types/express v5: string | string[]) */
export function routeParam(
  value: string | string[] | undefined,
  name: string
): string {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) throw new ValidationError(`Parámetro "${name}" inválido`);
  return id;
}
