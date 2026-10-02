const INSTAGRAM_URL = 'https://www.instagram.com/xanolascage?stkn=MXBwdTNlNHI5NTUzcw%3D%3D&utm_source=qr';

function validSpotifyUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const isSpotify = host === 'spotify.com' || host.endsWith('.spotify.com') || host === 'spotify.link';
    return url.protocol === 'https:' && isSpotify ? url.href : '';
  } catch {
    return '';
  }
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.25" /><circle className="xp-social-dot" cx="17.4" cy="6.7" r="1" /></svg>;
}

function SpotifyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M7.5 9.4c3.3-1 7.4-.7 10.2.8M8.2 12.5c2.8-.8 6.3-.5 8.8.7M8.8 15.4c2.3-.6 5-.4 7.1.6" /></svg>;
}

export default function SocialPresence({ spotifyUrl = '' }) {
  const spotifyHref = validSpotifyUrl(spotifyUrl);

  return (
    <aside className={`xp-social-presence ${spotifyHref ? 'has-spotify' : ''}`} aria-label={spotifyHref ? 'Follow and listen to XANDERR' : 'Follow XANDERR'}>
      <section>
        <h2>Follow along on Instagram</h2>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Follow XANDERR on Instagram">
          <InstagramIcon />
          <span>@xanolascage</span>
        </a>
      </section>
      {spotifyHref && (
        <section>
          <h2>Listen while you look</h2>
          <a href={spotifyHref} target="_blank" rel="noopener noreferrer" aria-label="Open XANDERR's studio playlist on Spotify">
            <SpotifyIcon />
            <span>XANDERR&rsquo;s studio playlist</span>
          </a>
        </section>
      )}
    </aside>
  );
}
