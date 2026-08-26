# libelula: mobile wallet collection

Reserved. Stands in front of the Libélula service, operated by Todotix, which issues the QR codes
buyers pay with.

## How the money moves

**Touno is an intermediary and never a destination.** Each empresa completes its own production
credential process with Libélula and nominates its own bank account; Touno holds those credentials
and uses them to generate that empresa's codes. Everything an empresa collects lands in the account
the empresa configured, and Touno's own commission is a separate settlement rather than a cut taken
in transit.

## What binds it

- **Credentials are per empresa and are the most sensitive material this tree holds.** They are
  encrypted with an envelope key from a managed store, scoped so that this service is the only thing
  that can decrypt one, and never written to a log, a trace or an error body.
- **It records what was paid, not how it was paid.** Libélula's own panel is authoritative for the
  detail, and an empresa can read it there; duplicating that record here creates a second truth that
  drifts.
- **A payment is confirmed by what the service says, never by what the buyer's screen says.** A
  client reporting success is a claim, and Money treats it as one.
