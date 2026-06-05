import { DAD_NOTE, STUDENT } from '../../shared/roadmap.js';

// Render **bold** and *italic* inline markers as real elements.
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    return <span key={i}>{p}</span>;
  });
}

export default function Note() {
  return (
    <div className="screen">
      <h2>A Note From Dad</h2>
      <p className="muted">For {STUDENT.name} — read this whenever you need a reminder of why we’re doing all this. 💜</p>

      <div className="letter">
        <p className="letter-greeting">{DAD_NOTE.greeting}</p>
        {DAD_NOTE.paragraphs.map((para, i) => (
          <p key={i} className="letter-p">{renderInline(para)}</p>
        ))}
        <p className="letter-signoff">{renderInline(DAD_NOTE.signoff)}</p>
      </div>
    </div>
  );
}
