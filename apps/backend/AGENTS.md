# apps/backend: what answers a port

Two shapes live here, and the difference between them is not size:

| Directory                                            | What it is                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| [`api/AGENTS.md`](./api/AGENTS.md)                   | the modular monolith: everything Touno itself decides               |
| [`integrations/AGENTS.md`](./integrations/AGENTS.md) | one service per third party, each speaking somebody else's protocol |

## Why the monolith is one deployment

Touno's domain is small and deeply connected: a fare reads a plan, an assignment reads a bond, a
reputation figure reads orders, loads and llamados together. Splitting that into services buys
independent deployment and pays for it in distributed transactions across rules that must not
disagree. **The monolith keeps those rules in one process and one transaction**, and the module
boundary inside it does the work a service boundary would, without the network in the middle.

## Why an integration is not a module

An integration is separated for reasons that belong to the third party rather than to the domain:

- **Its downtime is its own.** A third party that cannot be reached stops what depends on it and
  nothing else, and the order a buyer is already tracking is not what depends on it.
- **Its credentials are its own scope.** Libélula credentials are per empresa and are the most
  sensitive material Touno holds; a service that touches nothing else is a far smaller thing to
  audit.
- **Its schedule is its own.** A state integration is enabled when the state enables it, and that
  date is not a release date anybody here picks.
- **Its protocol is its own.** The shape a third party answers in is never the shape Touno stores,
  and the translation deserves a wall around it.

## What binds both

- **The domain vocabulary is the tree's**, and the model both implement is
  [`../frontend/web/src/app/domain/AGENTS.md`](../frontend/web/src/app/domain/AGENTS.md).
- **The contract is generated, not described.** What the clients may call is
  [`../../packages/contracts/AGENTS.md`](../../packages/contracts/AGENTS.md), and a handler that
  answers a shape the specification does not carry is a bug in one of the two.
- **ASVS is this side's catalogue**, together with the browser. The phones answer to MASVS, and the
  API list is the contract between the two.
- **The comment ban reaches here**, with one admitted shape: an XML documentation line on a public
  member, because the specification generator reads it. Loose prose inside a method fails like any
  other comment, and `bun run check:docs` holds both halves.
