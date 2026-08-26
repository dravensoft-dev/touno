# apps/frontend: the three surfaces

Touno is one product reached three ways. The three are separate apps rather than one codebase with
branches in it, because a phone and a browser disagree about almost everything that matters:
navigation, storage, background work, and what happens when the network goes.

| Surface                            | Built with                     | Page                                       |
| ---------------------------------- | ------------------------------ | ------------------------------------------ |
| the site at `touno.dravensoft.org` | Angular, prerendered to static | [`web/AGENTS.md`](./web/AGENTS.md)         |
| the Android app                    | Jetpack Compose                | [`android/AGENTS.md`](./android/AGENTS.md) |
| the iOS app                        | SwiftUI                        | [`ios/AGENTS.md`](./ios/AGENTS.md)         |

## What the three share, and what they must not

**They share the contract and the vocabulary.** Every one of them talks to the same API through a
client generated from the same specification, which is
[`../../packages/contracts/AGENTS.md`](../../packages/contracts/AGENTS.md). A surface that hand
writes a request is a surface that will disagree with the other two in a way nothing catches until a
user sees it.

**They share the demo walk.** The fixtures that make a screen reachable are
[`../../packages/fixtures/AGENTS.md`](../../packages/fixtures/AGENTS.md), so a scenario a reviewer
walks on the web is the same one they walk on a phone.

**They do not share rendering, routing, or state.** No cross-platform layer sits between them, and
none should arrive: the cost of one is paid on every screen, and the thing it saves is the part that
is cheapest to write twice.

**No surface holds a business rule the API does not also hold.** A phone is a device its owner
controls, so a rule enforced only in a client is a rule that is not enforced. A client may refuse
early to be kind; the API refuses to be correct.

## The design language, and where its tokens live

The palettes, the type and the Arena style plugin sit inside the web app, at
[`web/design/AGENTS.md`](./web/design/AGENTS.md), because `arena-to-prod` resolves a style plugin
from the web's own `arena.config.json` and writes the web's own stylesheets.

**That placement has a date on it.** The day Android or iOS needs the same tokens, the token file
moves up into a package of its own, and the move is only safe once `arena-to-prod` is confirmed to
resolve a style plugin outside the project root. Confirm it before moving the file, not after: a
plugin the tool cannot see fails by drawing an unskinned page rather than by refusing to build.
