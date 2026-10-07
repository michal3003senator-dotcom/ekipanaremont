/** Rejestr pól (S) wypełniany przy budowie konfiguracji – źródło dla rotacji klucza i testów. */
export type EncryptedField = { collection: string; field: string }

const fields = new Map<string, EncryptedField>()

export function registerEncryptedField(collection: string, field: string) {
  fields.set(`${collection}.${field}`, { collection, field })
}

export const encryptedFields = (): EncryptedField[] => [...fields.values()]
