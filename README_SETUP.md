Setup notes

- Edit .env based on .env.example for Firebase if needed.
- For Cloudflare Stream, obtain the HLS playback URL for a video: https://customer-<account-id>.cloudflarestream.com/<video-uid>/manifest/video.m3u8
- Paste it into the VideoPlayer in src/App.jsx.

GitHub Pages
- Create a repo named mschf.
- Push this folder as root of the repo.
- In repo Settings > Pages, set Source: GitHub Actions.

Local dev
- npm run dev

Performance tips
- Use poster images for videos; keep short looped scenes.
- Prefer AVIF/WebP for images; supply width/height to avoid layout shift.
- Consider signed URLs or hotlink protection as needed.
