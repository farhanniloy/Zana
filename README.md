This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Local preview

The project includes a separate SQLite database with sample posts, categories, and
comments so the site can be previewed without PostgreSQL. Install the dependencies
once, then run:

```bash
npm run dev
```

The first run generates the local Prisma client, creates `prisma/local.db`, and
seeds the preview content. The local database is the default when `DATABASE_URL`
is not set to PostgreSQL. Set `DATABASE_URL` to a PostgreSQL connection string to
use the existing backend instead. To recreate the local schema and re-apply the
sample content without deleting existing rows, run `npm run db:local:setup`.

The local preview keeps page data and site fonts on disk. Sign-in through Google
or GitHub, remote media, and external links still require a network connection.

## Listening room

The homepage uses Spotify's official Embed iFrame API for its compact listening-room
controls; the playlist page uses Spotify's full playlist embed. Both use Spotify's
real player and need no API credentials. The homepage controls require a network
connection to Spotify's Embed iFrame API and fall back to a visible official track
embed if the API cannot load. The
homepage defaults to the first track in the listening-room playlist. Set
`NEXT_PUBLIC_SPOTIFY_FEATURED_TRACK_URL` to choose another track there, and optionally
set `NEXT_PUBLIC_SPOTIFY_FEATURED_TRACK_TITLE` and
`NEXT_PUBLIC_SPOTIFY_FEATURED_TRACK_ARTIST` for its displayed metadata. The legacy
`NEXT_PUBLIC_SPOTIFY_FEATURED_URL` remains supported for track or playlist links.
For one or more playlist embeds, set `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URLS` to
comma-separated playlist URLs and optionally set matching labels with
`NEXT_PUBLIC_SPOTIFY_PLAYLIST_TITLES`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

The journal's typography and images are bundled locally in `public/`, so the
reading experience does not depend on a third-party font or image service.
The supplied journal photographs live in `public/images/`; the local preview
seed uses those same assets for its writing covers. Cormorant Garamond and
Special Elite are self-hosted from Google Fonts and distributed under their
respective open font licenses. Review the original image licenses and credits
before redistributing the bundled photographs outside this project.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
