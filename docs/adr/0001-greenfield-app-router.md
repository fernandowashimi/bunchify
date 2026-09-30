# Greenfield App Router only

Bunchify v2 replaces the Pages Router tree with a greenfield `src/app/` layout on Next.js 16: root layout, `/` (Home), `/authorize` (Authorize), and Route Handlers for auth, Spotify BFF, and story image. Dual Pages/App coexistence is rejected so there is one routing model, one metadata path, and no leftover Next 10 primitives (`_app`, `_document`, `getStaticProps`, Pages API).
