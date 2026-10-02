const INSTAGRAM_URL = 'https://www.instagram.com/xanolascage?stkn=MXBwdTNlNHI5NTUzcw%3D%3D&utm_source=qr';

export default function InstagramCTA() {
  return (
    <aside className="xp-instagram">
      <h2>Follow along on Instagram</h2>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow XANDERR on Instagram"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.25" />
          <circle className="xp-instagram-dot" cx="17.4" cy="6.7" r="1" />
        </svg>
        <span>@xanolascage</span>
      </a>
    </aside>
  );
}
