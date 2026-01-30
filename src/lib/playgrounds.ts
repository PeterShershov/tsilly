import { encodeWorkspace, decodeWorkspace, type SharedWorkspace } from "./share";

export interface SavedPlayground {
  id: string;
  name: string;
  shareUrl: string;
  createdAt: number;
}

const DB_NAME = "tsilly-db";
const DB_VERSION = 1;
const STORE_NAME = "playgrounds";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

export async function getPlaygrounds(): Promise<SavedPlayground[]> {
  if (typeof window === "undefined") return [];
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("createdAt");
      const request = index.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result as SavedPlayground[];
        // Sort by createdAt descending (newest first)
        results.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
    });
  } catch {
    return [];
  }
}

export async function savePlayground(
  name: string,
  workspace: SharedWorkspace
): Promise<SavedPlayground> {
  const db = await openDB();
  const encoded = encodeWorkspace(workspace);

  const newPlayground: SavedPlayground = {
    id: crypto.randomUUID(),
    name,
    shareUrl: encoded,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(newPlayground);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(newPlayground);
  });
}

export async function updatePlayground(
  id: string,
  workspace: SharedWorkspace
): Promise<void> {
  const db = await openDB();
  const encoded = encodeWorkspace(workspace);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const existing = getRequest.result as SavedPlayground | undefined;
      if (!existing) {
        reject(new Error("Playground not found"));
        return;
      }

      const updated: SavedPlayground = {
        ...existing,
        shareUrl: encoded,
        createdAt: Date.now(),
      };

      const putRequest = store.put(updated);
      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve();
    };
  });
}

export async function deletePlayground(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function loadPlayground(id: string): Promise<SharedWorkspace | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const playground = request.result as SavedPlayground | undefined;
      if (!playground) {
        resolve(null);
        return;
      }
      resolve(decodeWorkspace(playground.shareUrl));
    };
  });
}
