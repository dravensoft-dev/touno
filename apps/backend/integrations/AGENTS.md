# apps/backend/integrations: one service per third party

Reserved. Each directory here is a separate deployment with a single job: **speak a third party's
protocol, and answer Touno's own contract**. Nothing is here yet, and this page is what the first
commit answers to.

| Service                                      | What it stands in front of               |
| -------------------------------------------- | ---------------------------------------- |
| [`libelula/AGENTS.md`](./libelula/AGENTS.md) | mobile wallet QR collection, per empresa |

**One third party is one directory, and the list is the whole of it.** Touno decides everything else
itself, inside the monolith, which is why [`../api/AGENTS.md`](../api/AGENTS.md) is where almost
every question about behaviour goes.

## What an integration is not allowed to be

- **It stores nothing the monolith owns.** It answers a result. What is kept, and under which key it
  is encrypted, is decided by the module that owns the subject, which is what keeps the retention
  promise in one place instead of two.
- **It never becomes the place a rule lives.** What a third party's answer means to Touno is decided
  by the module that asked, never by the service that fetched it.
- **It never leaks the third party's shape upward.** A field named the way somebody else's system
  names it, crossing into the monolith, is how a vendor change becomes a migration.
- **It fails as an answer, not as an outage.** Unreachable is a state the caller handles, and
  everything that does not depend on that third party keeps working.

## What each of them states on its own page

What it stands in front of, the minimum it returns, what it must never store, and the credential
scope it holds. A page here is short on purpose: the thing being described belongs to somebody else,
and everything true of it is true until they change it.
