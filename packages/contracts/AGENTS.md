# packages/contracts: the API, stated once

Reserved. Nothing is here yet, and this page is what the first commit answers to.

## The specification is the source, and the clients are output

An OpenAPI document, written by hand and versioned, is the single statement of what the API offers.
The TypeScript client the site uses, the Kotlin client Android uses and the Swift client iOS uses are
**generated from it**, and none of them is edited.

The reason is the failure it forces: an endpoint that changes shape breaks the compilation of all
three clients at once, in the commit that changed it. The alternative is a divergence that appears at
runtime, on one surface, in front of one user, long after the change that caused it.

The .NET side is held to the same document rather than being the author of it: what it serves is
compared against the specification, and a difference is a failure rather than a new truth.

## What is written by the generator here

The three clients, and nothing else. They sit under a `generated` directory, which is how this tree
announces machine ownership when a generator emits a tree rather than a file:
[`../../GENERATED.md`](../../GENERATED.md) states that rule and is the page to read before editing
anything under one.

The specification itself is hand written and is the input. An edit to a client survives until the
next generation and then goes, with nothing failing in between, which is the failure every generated
path in this tree is named to prevent.

## What binds a change to the specification

- **A breaking change is a new version, and the old one has an end date.** A route left answering
  because one surface still calls it, with nobody maintaining it, is the quiet way an audited API
  stops being audited.
- **A response declares every field it returns.** A shape that says "and whatever else the entity
  carries" publishes the fields somebody assumed the client would hide.
- **An identifier in a path belongs to somebody**, and the specification says whose. Authorization is
  part of the contract rather than an implementation detail of one handler.
