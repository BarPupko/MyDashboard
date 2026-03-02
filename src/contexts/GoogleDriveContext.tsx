/**
 * Google Drive Sync Context
 *
 * Each user enters their own Google OAuth Client ID in Settings → Google Drive Sync.
 * No developer setup needed — each person sets up their own free Google Cloud project.
 *
 * HOW TO GET A CLIENT ID (each user does this once):
 * 1. Go to https://console.cloud.google.com and create a free project.
 * 2. Enable the "Google Drive API".
 * 3. Go to "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID".
 * 4. Choose "Web application".
 * 5. Under "Authorized JavaScript origins" add the URL where you run this app,
 *    e.g. https://barpupko.github.io  and  http://localhost:5173
 * 6. Copy the Client ID and paste it into Settings → Google Drive Sync.
 */

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const BACKUP_FILENAME = "MyDashboard-backup.json";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

/** localStorage keys that get synced to Google Drive */
const SYNC_KEYS = [
  "todos",
  "workDayEntries",
  "work-hours-summary",
  "workHoursSettings",
  "theme",
  "app-language",
  "dashboard-user-name",
];

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface GoogleDriveContextType {
  isConnected: boolean;
  syncStatus: SyncStatus;
  lastSynced: Date | null;
  userEmail: string | null;
  clientId: string;
  clientIdMissing: boolean;
  setClientId: (id: string) => void;
  connect: () => void;
  disconnect: () => void;
  syncNow: () => void;
}

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

const GoogleDriveContext = createContext<GoogleDriveContextType | null>(null);

export function useGoogleDrive() {
  const ctx = useContext(GoogleDriveContext);
  if (!ctx)
    throw new Error("useGoogleDrive must be used inside GoogleDriveProvider");
  return ctx;
}

/* ─── helpers ─────────────────────────────────────────── */

function collectData(): Record<string, unknown> {
  const data: Record<string, unknown> = {
    _version: 1,
    _savedAt: new Date().toISOString(),
  };
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return data;
}

function restoreData(data: Record<string, unknown>) {
  for (const key of SYNC_KEYS) {
    if (key in data) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  }
}

async function findBackupFile(token: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${BACKUP_FILENAME}' and trashed=false`);
  const res = await fetch(
    `${DRIVE_API}/files?q=${q}&fields=files(id,name,modifiedTime)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json.files?.[0]?.id ?? null;
}

async function downloadBackup(
  token: string,
  fileId: string,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function uploadBackup(
  token: string,
  data: Record<string, unknown>,
  existingFileId: string | null,
): Promise<string | null> {
  const content = JSON.stringify(data, null, 2);
  const metadata = { name: BACKUP_FILENAME, mimeType: "application/json" };

  const boundary = "drive_backup_boundary";
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: application/json",
    "",
    content,
    `--${boundary}--`,
  ].join("\r\n");

  const url = existingFileId
    ? `${DRIVE_UPLOAD_API}/files/${existingFileId}?uploadType=multipart`
    : `${DRIVE_UPLOAD_API}/files?uploadType=multipart`;

  const res = await fetch(url, {
    method: existingFileId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.id ?? null;
}

/* ─── provider ────────────────────────────────────────── */

export function GoogleDriveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(() => {
    const saved = localStorage.getItem("gdrive-last-synced");
    return saved ? new Date(saved) : null;
  });
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("gdrive-user-email"),
  );
  const [clientId, setClientIdState] = useState<string>(
    () => localStorage.getItem("gdrive-client-id") ?? "",
  );

  const tokenRef = useRef<string | null>(null);
  const fileIdRef = useRef<string | null>(
    localStorage.getItem("gdrive-file-id"),
  );
  const tokenClientRef = useRef<{
    requestAccessToken(opts?: { prompt?: string }): void;
  } | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clientIdMissing = clientId.trim() === "";

  const setClientId = useCallback((id: string) => {
    const trimmed = id.trim();
    localStorage.setItem("gdrive-client-id", trimmed);
    setClientIdState(trimmed);
  }, []);

  /* ── perform one sync push ── */
  const performSync = useCallback(async () => {
    if (!tokenRef.current) return;
    setSyncStatus("syncing");
    try {
      const data = collectData();
      const id = await uploadBackup(tokenRef.current, data, fileIdRef.current);
      if (id) {
        fileIdRef.current = id;
        localStorage.setItem("gdrive-file-id", id);
        const now = new Date();
        setLastSynced(now);
        localStorage.setItem("gdrive-last-synced", now.toISOString());
        setSyncStatus("synced");
      } else {
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    }
  }, []);

  /* ── debounced sync trigger ── */
  const syncNow = useCallback(() => {
    if (!isConnected) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => performSync(), 3000);
  }, [isConnected, performSync]);

  /* ── auto-sync every 30 s when connected ── */
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => performSync(), 30_000);
    return () => clearInterval(interval);
  }, [isConnected, performSync]);

  /* ── handle token response after OAuth ── */
  const handleTokenResponse = useCallback(
    async (accessToken: string, email: string) => {
      tokenRef.current = accessToken;
      setUserEmail(email);
      localStorage.setItem("gdrive-user-email", email);
      setIsConnected(true);

      // Check for existing backup
      setSyncStatus("syncing");
      try {
        const existingId = await findBackupFile(accessToken);
        if (existingId) {
          fileIdRef.current = existingId;
          localStorage.setItem("gdrive-file-id", existingId);
          const backup = await downloadBackup(accessToken, existingId);
          if (backup && backup._version) {
            const savedAt = backup._savedAt as string | undefined;
            const dateStr = savedAt
              ? new Date(savedAt).toLocaleString()
              : "unknown date";
            const restore = window.confirm(
              `Found existing backup from ${dateStr}.\n\nRestore it? (OK = restore, Cancel = keep current data and overwrite backup)`,
            );
            if (restore) {
              restoreData(backup);
              window.location.reload();
              return;
            }
          }
        }
        // No backup found or user chose not to restore — push current data
        await performSync();
      } catch {
        setSyncStatus("error");
      }
    },
    [performSync],
  );

  /* ── initialise Google Identity Services token client ── */
  useEffect(() => {
    if (clientIdMissing) return;
    const init = () => {
      if (!window.google?.accounts?.oauth2) return;
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DRIVE_SCOPE,
        callback: async (resp) => {
          if (resp.error || !resp.access_token) {
            setSyncStatus("error");
            return;
          }
          // Decode email from id_token isn't available here; use Drive "about" endpoint
          try {
            const res = await fetch(`${DRIVE_API}/about?fields=user`, {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            });
            const info = await res.json();
            const email = info.user?.emailAddress ?? "Google Account";
            handleTokenResponse(resp.access_token, email);
          } catch {
            handleTokenResponse(resp.access_token, "Google Account");
          }
        },
      });
    };

    // Script might already be loaded
    if (window.google?.accounts?.oauth2) {
      init();
    } else {
      // Wait for script to load
      const script = document.getElementById("gsi-script");
      if (script) script.addEventListener("load", init);
    }
  }, [clientId, clientIdMissing, handleTokenResponse]);

  const connect = useCallback(() => {
    if (clientIdMissing) {
      alert(
        "Please enter your Google Client ID in Settings → Google Drive Sync.\n\nGet one free at https://console.cloud.google.com",
      );
      return;
    }
    tokenClientRef.current?.requestAccessToken({ prompt: "" });
  }, [clientIdMissing]);

  const disconnect = useCallback(() => {
    if (tokenRef.current) {
      window.google?.accounts?.oauth2?.revoke(tokenRef.current, () => {});
    }
    tokenRef.current = null;
    fileIdRef.current = null;
    setIsConnected(false);
    setSyncStatus("idle");
    setUserEmail(null);
    localStorage.removeItem("gdrive-user-email");
    localStorage.removeItem("gdrive-file-id");
    localStorage.removeItem("gdrive-last-synced");
  }, []);

  return (
    <GoogleDriveContext.Provider
      value={{
        isConnected,
        syncStatus,
        lastSynced,
        userEmail,
        clientId,
        clientIdMissing,
        setClientId,
        connect,
        disconnect,
        syncNow,
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  );
}
