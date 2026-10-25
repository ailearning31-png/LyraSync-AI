// Wrapper IndexedDB tanpa dependensi eksternal. Setiap operasi membuka
// transaksinya sendiri; penulisan baru dianggap selesai saat transaksi complete.
const DB_NAME = 'lyrasync-ai'
const DB_VERSION = 1
export const PROJECT_STORE = 'projects'

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('Gagal membuka IndexedDB'))
  })
}

export function getAllRecords<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const request = tx.objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result as T[])
    tx.onerror = () => reject(tx.error ?? new Error('Gagal membaca data'))
    tx.onabort = () => reject(tx.error ?? new Error('Transaksi dibatalkan'))
  })
}

export function getRecord<T>(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const request = tx.objectStore(storeName).get(key)
    request.onsuccess = () => resolve(request.result as T | undefined)
    tx.onerror = () => reject(tx.error ?? new Error('Gagal membaca data'))
    tx.onabort = () => reject(tx.error ?? new Error('Transaksi dibatalkan'))
  })
}

export function putRecord(
  db: IDBDatabase,
  storeName: string,
  value: unknown,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(value)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Gagal menyimpan data'))
    tx.onabort = () => reject(tx.error ?? new Error('Transaksi dibatalkan'))
  })
}

export function deleteRecord(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Gagal menghapus data'))
    tx.onabort = () => reject(tx.error ?? new Error('Transaksi dibatalkan'))
  })
}
