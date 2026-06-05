import { useStorageError } from '../lib/util.js';

// Shows a dismissible warning whenever a save to browser storage fails — so a
// full-storage situation can never again cause silent, invisible data loss.
export default function StorageBanner() {
  const [error, clear] = useStorageError();
  if (!error) return null;

  return (
    <div className="storage-banner" role="alert">
      <span className="storage-banner-icon" aria-hidden>⚠️</span>
      <span className="storage-banner-text">
        {error.quota
          ? 'Your browser storage is full, so the last change could not be saved. Open the Admin tab to export a backup, then remove a large uploaded file (a résumé, letter, or document) to free up space.'
          : 'The last change could not be saved to this browser. Export a backup from the Admin tab to be safe.'}
      </span>
      <button className="btn small ghost" onClick={clear}>Dismiss</button>
    </div>
  );
}
