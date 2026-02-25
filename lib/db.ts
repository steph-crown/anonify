"use client";

import type { MaskMapping } from "./mask-types";

const DB_NAME = "anonify";
const DB_VERSION = 1;
const SESSIONS_STORE = "sessions";
const ANON_STORE = "anonymizations";

export type StoredSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
};

export type StoredAnonymization = {
  id: string;
  sessionId: string;
  createdAt: string;
  raw: string;
  masked: string;
  mapping: MaskMapping;
};

function getId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is not available in this environment."),
    );
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const sessions = db.createObjectStore(SESSIONS_STORE, {
          keyPath: "id",
        });
        sessions.createIndex("createdAt", "createdAt", { unique: false });
        sessions.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(ANON_STORE)) {
        const anons = db.createObjectStore(ANON_STORE, { keyPath: "id" });
        anons.createIndex("sessionId", "sessionId", { unique: false });
        anons.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
  });
}

export async function createSession(title?: string): Promise<StoredSession> {
  const db = await openDB();
  const tx = db.transaction(SESSIONS_STORE, "readwrite");
  const store = tx.objectStore(SESSIONS_STORE);

  const now = new Date().toISOString();
  const session: StoredSession = {
    id: getId(),
    createdAt: now,
    updatedAt: now,
    title,
  };

  store.put(session);
  await txComplete(tx);
  db.close();
  return session;
}

export async function updateSessionTimestamp(id: string) {
  const db = await openDB();
  const tx = db.transaction(SESSIONS_STORE, "readwrite");
  const store = tx.objectStore(SESSIONS_STORE);

  const existing = await new Promise<StoredSession | undefined>(
    (resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as StoredSession | undefined);
      req.onerror = () =>
        reject(req.error ?? new Error("IndexedDB get(session) failed"));
    },
  );
  if (existing) {
    existing.updatedAt = new Date().toISOString();
    store.put(existing);
  }

  await txComplete(tx);
  db.close();
}

export async function getSession(
  id: string,
): Promise<StoredSession | undefined> {
  const db = await openDB();
  const tx = db.transaction(SESSIONS_STORE, "readonly");
  const store = tx.objectStore(SESSIONS_STORE);

  const session = await new Promise<StoredSession | undefined>(
    (resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as StoredSession | undefined);
      req.onerror = () =>
        reject(req.error ?? new Error("IndexedDB get(session) failed"));
    },
  );
  db.close();
  return session;
}

export async function addAnonymization(
  record: Omit<StoredAnonymization, "id" | "createdAt"> & { id?: string },
): Promise<StoredAnonymization> {
  const db = await openDB();
  const tx = db.transaction([ANON_STORE, SESSIONS_STORE], "readwrite");
  const anonStore = tx.objectStore(ANON_STORE);
  const sessionStore = tx.objectStore(SESSIONS_STORE);

  const now = new Date().toISOString();
  const id = record.id ?? getId();

  const full: StoredAnonymization = {
    id,
    createdAt: now,
    ...record,
  };

  anonStore.put(full);

  const session = await new Promise<StoredSession | undefined>(
    (resolve, reject) => {
      const req = sessionStore.get(record.sessionId);
      req.onsuccess = () => resolve(req.result as StoredSession | undefined);
      req.onerror = () =>
        reject(req.error ?? new Error("IndexedDB get(session) failed"));
    },
  );
  if (session) {
    session.updatedAt = now;
    sessionStore.put(session);
  }

  await txComplete(tx);
  db.close();

  return full;
}

export async function listAnonymizations(
  sessionId: string,
): Promise<StoredAnonymization[]> {
  const db = await openDB();
  const tx = db.transaction(ANON_STORE, "readonly");
  const store = tx.objectStore(ANON_STORE);
  const index = store.index("sessionId");

  const request = index.getAll(IDBKeyRange.only(sessionId));

  const results: StoredAnonymization[] = await new Promise(
    (resolve, reject) => {
      request.onsuccess = () =>
        resolve(request.result as StoredAnonymization[]);
      request.onerror = () =>
        reject(
          request.error ?? new Error("IndexedDB getAll(sessionId) failed"),
        );
    },
  );

  db.close();

  // newest first
  return results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function deleteAnonymizationsBySessionId(
  sessionId: string,
): Promise<void> {
  const items = await listAnonymizations(sessionId);
  if (items.length === 0) return;

  const db = await openDB();
  const tx = db.transaction(ANON_STORE, "readwrite");
  const store = tx.objectStore(ANON_STORE);

  for (const item of items) {
    store.delete(item.id);
  }

  await txComplete(tx);
  db.close();
}

export async function listSessions(): Promise<StoredSession[]> {
  const db = await openDB();
  const tx = db.transaction(SESSIONS_STORE, "readonly");
  const store = tx.objectStore(SESSIONS_STORE);
  const request = store.getAll();

  const sessions: StoredSession[] = await new Promise((resolve, reject) => {
    request.onsuccess = () =>
      resolve(request.result as StoredSession[]);
    request.onerror = () =>
      reject(
        request.error ?? new Error("IndexedDB getAll(sessions) failed"),
      );
  });

  db.close();
  return sessions.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function renameSession(id: string, title: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(SESSIONS_STORE, "readwrite");
  const store = tx.objectStore(SESSIONS_STORE);

  const existing = await new Promise<StoredSession | undefined>(
    (resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () =>
        resolve(req.result as StoredSession | undefined);
      req.onerror = () =>
        reject(req.error ?? new Error("IndexedDB get(session) failed"));
    },
  );

  if (existing) {
    existing.title = title;
    store.put(existing);
  }

  await txComplete(tx);
  db.close();
}

export async function deleteSession(id: string): Promise<void> {
  await deleteAnonymizationsBySessionId(id);

  const db = await openDB();
  const tx = db.transaction(SESSIONS_STORE, "readwrite");
  const store = tx.objectStore(SESSIONS_STORE);
  store.delete(id);
  await txComplete(tx);
  db.close();
}

export async function deleteSessions(ids: string[]): Promise<void> {
  for (const id of ids) {
    // sequential deletes are fine for small lists
    await deleteSession(id);
  }
}
