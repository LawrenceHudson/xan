import { useState, useEffect } from 'react';
import { QUOTES } from '../../shared/roadmap.js';

export default function Motivation() {
  const [i, setI] = useState(() => Math.floor(Math.random() * QUOTES.length));
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % QUOTES.length), 9000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="motivation" onClick={() => setI((n) => (n + 1) % QUOTES.length)} title="Tap for another">
      <span className="spark">✨</span> {QUOTES[i]}
    </div>
  );
}
