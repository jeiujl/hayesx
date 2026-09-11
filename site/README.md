# HayesX — marketing site

A rebuild of [hayesx.net](https://hayesx.net) with the same information and a
considerably better front end. Next.js 16, Tailwind 4, statically rendered.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Structure

| Path | What it is |
|---|---|
| `content/aircraft.ts` | Every specification on the site, each cited to its Flight Manual section |
| `content/copy.ts` | All prose. Sentences marked `hayesx.net` are the company's own words |
| `components/PlanView.tsx` | Scale plan view of the aircraft, drawn in millimetres from the real dimensions |
| `components/FoldDiagram.tsx` | Folded vs unfolded width, to scale |
| `app/tech-specifications/` | Full specification tables |
| `app/api/reserve/` | Reservation enquiries |

Routes keep the existing URLs (`/` and `/tech-specifications/`, trailing slash
preserved) so inbound links and search rankings carry over.

## Before launch — needs HayesX input

The site this was rebuilt from could not be fetched directly from the build
environment, so the following could not be carried over and must be supplied:

1. **`RESERVE_WEBHOOK_URL`** — set it in the Vercel project to the endpoint that
   should receive reservation enquiries (form provider, CRM hook, or an internal
   service). Until it is set, the form tells visitors that reservations are not
   connected rather than accepting and discarding an enquiry.
2. **Contact details** — email, phone and mailing address for the footer.
3. **Social links** — none were recoverable.
4. **Photography** — the site currently uses technical drawings generated from
   the real dimensions rather than product photography. Real imagery of the
   aircraft would strengthen the hero considerably.
5. **Anything on the live site not in the search index** — pricing, team,
   press, FAQ or legal pages, and the exact footer legal wording.

## Where the numbers come from

Every figure is read from `content/aircraft.ts`, which cites
HayesX-250 Flight Manual `HayesX-250-FM-001` Revision A for each value. Change a
number there and it changes everywhere it appears.
