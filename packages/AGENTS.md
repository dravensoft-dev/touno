# packages: what more than one app needs

A **package** is shared and is never deployed. Nothing here answers a port or renders a screen; each
one exists because two or more apps would otherwise state the same thing twice and drift.

| Package                                        | What it holds                                               |
| ---------------------------------------------- | ----------------------------------------------------------- |
| [`contracts/AGENTS.md`](./contracts/AGENTS.md) | the API specification, and the clients generated from it    |
| [`fixtures/AGENTS.md`](./fixtures/AGENTS.md)   | the demo walk: the records that make every screen reachable |

## The bar for adding one

**A package is justified by a second consumer, not by an intuition that one will arrive.** Code that
one app uses stays inside that app, where it can change without a negotiation. Moving it out later
costs an afternoon; moving it out early costs every change from now until the second consumer shows
up, and sometimes the second consumer never does.

**A package carries no framework.** Angular, Compose and SwiftUI stop at their app's boundary: a
package that imports one of them is a package exactly one surface can use, which is the definition of
something that should have stayed where it was.
