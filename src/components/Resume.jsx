import { useRef, useEffect } from 'react';
import { RESUME_GUIDE } from '../../shared/roadmap.js';
import { useStored } from '../lib/util.js';
import { storeFile, downloadStoredFile, idbDel, ensureStored } from '../lib/idb.js';

export default function Resume() {
  // files: { art: {name, type, when, size, blobId}, career: {...} }
  // File bytes live in IndexedDB (keyed by blobId); only metadata is here.
  const [files, setFiles] = useStored('viol_resume', {});

  // One-time migration: move any legacy inline base64 (dataUrl) into IndexedDB.
  useEffect(() => {
    let active = true;
    (async () => {
      const legacy = Object.entries(files).filter(([, f]) => f && f.dataUrl && !f.blobId);
      if (legacy.length === 0) return;
      const migrated = {};
      for (const [id, f] of legacy) migrated[id] = await ensureStored(f);
      if (active) setFiles((prev) => ({ ...prev, ...migrated }));
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen">
      <h2>Résumé</h2>
      <p className="muted">Two résumés to keep handy — one for the art world, one for everything else. Write it, upload it here, and download it whenever an application asks. 📄</p>

      <div className="pf-tips">
        <strong>✍️ Writing tips</strong>
        <ul>{RESUME_GUIDE.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </div>

      <div className="cards two">
        {RESUME_GUIDE.slots.map((slot) => (
          <ResumeSlot key={slot.id} slot={slot} file={files[slot.id]} setFiles={setFiles} maxBytes={RESUME_GUIDE.maxBytes} />
        ))}
      </div>
    </div>
  );
}

function ResumeSlot({ slot, file, setFiles, maxBytes }) {
  const inputRef = useRef(null);

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxBytes) {
      alert(`That file is too big to store in the browser (max ~${Math.round(maxBytes / (1024 * 1024) * 10) / 10} MB). Try saving the résumé as a compact PDF.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const meta = await storeFile({ name: f.name, type: f.type, dataUrl: reader.result });
        setFiles((prev) => ({ ...prev, [slot.id]: meta }));
      } catch {
        alert('Could not save that file to browser storage. It may be too large, or storage is full.');
      }
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  function download() {
    if (file) downloadStoredFile(file.blobId, file.name || `${slot.id}-resume`, file.dataUrl);
  }

  function clear() {
    if (file?.blobId) idbDel(file.blobId);
    setFiles((prev) => {
      const next = { ...prev };
      delete next[slot.id];
      return next;
    });
  }

  return (
    <div className="card resume-slot">
      <div className="card-head">
        <h3>{slot.emoji} {slot.label}</h3>
      </div>
      <p className="deliverable">{slot.blurb}</p>
      <p className="micro" style={{ display: 'block', marginBottom: 4 }}>What to include</p>
      <ul className="resume-list">{slot.include.map((x, i) => <li key={i}>{x}</li>)}</ul>

      <div className="cost-box">
        {file ? (
          <>
            <div className="kv"><span>Uploaded</span><strong>{file.name}</strong></div>
            <div className="kv"><span>Saved</span><strong>{file.when}</strong></div>
            <div className="editor-actions">
              <button className="btn small" onClick={download}>⬇ Download</button>
              <button className="btn small ghost" onClick={() => inputRef.current?.click()}>Replace</button>
              <button className="btn small danger" onClick={clear}>Remove</button>
            </div>
          </>
        ) : (
          <>
            <p className="muted small" style={{ margin: '4px 0 8px' }}>No file yet. Upload a PDF (or DOC) to keep it safe here.</p>
            <button className="btn small" onClick={() => inputRef.current?.click()}>⬆ Upload résumé</button>
          </>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,application/pdf" style={{ display: 'none' }} onChange={onPick} />
      </div>
    </div>
  );
}
