# infra: how this tree runs in containers

`compose.yaml` is the development stack, and `bun run dev` at the root is what starts it. This page
owns containerisation; what each app _is_ belongs to that app's own page.

## What is declared today

One service, `web`, built from `../apps/frontend/web/Dockerfile` at its `dev` target, publishing
4200, with the repository mounted so an edit on the host reloads in the container, and each
`node_modules` kept in a named volume so the host's copy does not shadow the one the image
installed. There is one volume per workspace, because a Bun workspace resolves through both.

**The container runs as the host's own user, and that line is the difference between a working tree
and one you need a superuser to clean.** A container writing into a bind mount writes with its own
identity: as root, every cache file and every generated stylesheet it touches becomes root's on the
host, and the next `bun start` outside the container fails on a directory it cannot remove. The
image therefore builds and runs as an unprivileged user, and the compose passes the host's own
identifiers through, defaulting to the first ordinary user.

**Nothing else is a named volume, and that is deliberate.** Docker creates a missing mount point as
root even when the container is unprivileged, so a volume over a path the host does not already have
puts a root-owned directory in the working tree to solve a problem that no longer exists once the
container runs as you. The build cache and the output land on the bind mount, owned by you, shared
with the host's own toolchain.

**The Dockerfile has more targets than the compose uses.** `build` runs the prerender, and `serve`
puts the built site on 4173 behind nginx, which is the containerised twin of `bun run serve:static`.
They exist because a static artefact is worth being able to produce and serve from an image, not
because the development loop needs them.

`nginx.conf` is short and every line in it is load-bearing. It resolves a request to a prerendered
directory's own `index.html`, because that is the shape `outputMode: "static"` writes, and it serves
`404.html` from the root on a miss, because a static host has no router to fall back on. **The
development server and nginx must agree about both**, and they are the two places a route can appear
to exist in one and not the other.

**Its redirects are relative, and that line is not decoration.** A path without a trailing slash is
answered with a redirect to the directory, and nginx writes that redirect against the port it is
listening on rather than the port it was published as. Behind any port mapping, an absolute redirect
sends a browser to a port nothing answers on, and the failure looks like a broken route rather than
like a container setting.

## What each app adds when it arrives

Written here rather than left as commented YAML, because a service nothing runs is a service whose
settings rot in silence, while a sentence that has gone false is a sentence somebody reads:

- **The API** adds a service on 8080, built from `apps/backend/api`, depending on the database and
  reading its secrets from the environment rather than from a file in the image.
- **The database** adds Postgres, with a named volume for its data and one schema per module of the
  monolith, which is where the module boundary becomes something the database itself enforces.
- **The cache** adds Redis when there is something worth caching, and not before.
- **Each integration** adds one service of its own, reachable only from the API's network and never
  published to the host, because a service holding a third party's credentials should not be
  reachable from a laptop's browser.

## What stays out, and why

**The overflow sweep is not a service.** It drives a real browser through `playwright-core` and
belongs on a machine that already has one; putting it in the compose would pull a browser image into
every developer's first `bun run dev` to serve a command most runs never invoke. It runs on the host,
against a running static build, and [`../apps/frontend/web/tools/overflow-sweep/AGENTS.md`](../apps/frontend/web/tools/overflow-sweep/AGENTS.md)
says what it sees.

**The gates are not a service either.** They read the tree from the repository root and need no
runtime at all.
