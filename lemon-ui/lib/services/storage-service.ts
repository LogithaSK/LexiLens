import { OwnedProduct, SavedLookRecord } from '../types/makeup'

const INVENTORY_STORAGE_KEY = 'lemon_makeup_personal_kit_v1'
const SAVED_LOOKS_STORAGE_KEY = 'lemon_makeup_saved_looks_v1'

export function getPersonalKit(): OwnedProduct[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to parse personal kit storage:', err)
    return []
  }
}

export function savePersonalKit(kit: OwnedProduct[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(kit))
  } catch (err) {
    console.warn('Failed to save personal kit storage:', err)
  }
}

export function addProductToKit(product: Omit<OwnedProduct, 'id' | 'addedAt'>): OwnedProduct {
  const kit = getPersonalKit()
  const newProduct: OwnedProduct = {
    ...product,
    id: `kit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    addedAt: new Date().toISOString(),
  }
  const updated = [newProduct, ...kit]
  savePersonalKit(updated)
  return newProduct
}

export function removeProductFromKit(id: string): void {
  const kit = getPersonalKit()
  const updated = kit.filter((item) => item.id !== id)
  savePersonalKit(updated)
}

export function getSavedLooks(): SavedLookRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAVED_LOOKS_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to parse saved looks:', err)
    return []
  }
}

export function saveLookToStorage(record: Omit<SavedLookRecord, 'id' | 'savedAt'>): SavedLookRecord {
  const looks = getSavedLooks()
  const newRecord: SavedLookRecord = {
    ...record,
    id: `saved-look-${Date.now()}`,
    savedAt: new Date().toISOString(),
  }
  const updated = [newRecord, ...looks]
  if (typeof window !== 'undefined') {
    localStorage.setItem(SAVED_LOOKS_STORAGE_KEY, JSON.stringify(updated))
  }
  return newRecord
}

export function deleteSavedLook(id: string): void {
  const looks = getSavedLooks()
  const updated = looks.filter((item) => item.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(SAVED_LOOKS_STORAGE_KEY, JSON.stringify(updated))
  }
}
