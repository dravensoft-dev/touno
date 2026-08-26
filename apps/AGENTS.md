# apps: everything that gets deployed

An **app** is a surface someone runs: a site a browser loads, a binary a phone installs, a service
that answers a port. Everything else in this tree exists to serve one of them.

| Group                                        | What is under it                                                     |
| -------------------------------------------- | -------------------------------------------------------------------- |
| [`frontend/AGENTS.md`](./frontend/AGENTS.md) | the three surfaces a person uses: the web, Android and iOS           |
| [`backend/AGENTS.md`](./backend/AGENTS.md)   | the modular monolith, and one service per third party Touno talks to |

## The rule that keeps them apart

**An app never imports another app's source.** Not the web reading a backend model, not Android
reading the web's fixtures. What two apps both need becomes a package, and
[`../packages/AGENTS.md`](../packages/AGENTS.md) is where it goes; what only one needs stays inside
it and is nobody else's business.

The reason is not tidiness. Each app compiles on its own toolchain and ships on its own schedule, so
a reach across the boundary binds two release cycles together in a way no gate can see until the
day one of them cannot ship.

**An app owns its own build, its own dependencies and its own test command.** The root delegates and
does not reimplement: `bun run build` at the root builds the surfaces that have a build, and each
app's page says what its own does.

## What every app answers to

- **The domain vocabulary is the same everywhere.** An empresa is an empresa in C#, in Kotlin and in
  Swift; a rider is bound by a recruitment both sides accepted whatever language states it. The
  model is [`frontend/web/src/app/domain/AGENTS.md`](./frontend/web/src/app/domain/AGENTS.md) and
  what the business promises is [`../TOUNO_STRUC.md`](../TOUNO_STRUC.md).
- **An order's code belongs to the buyer**, and no surface may present it as anything else.
- **Spanish is for route paths and for what a person reads.** Everything else is English, including
  every identifier in every language here.
