# apps/backend/api: the modular monolith

Reserved. C# on .NET, one deployment, five modules. Nothing is here yet, and this page is what the
first commit answers to.

## The five modules

Each owns its own schema, exposes its own contract, and is reached by that contract alone.

| Module        | What it owns                                                                                |
| ------------- | ------------------------------------------------------------------------------------------- |
| **Identity**  | the person, the profile, the session, and the rider's vehicle and plate                     |
| **Commerce**  | the empresa, the sucursal, the catalogue, per sucursal stock and price, the cart, geography |
| **Logistics** | the order and its code, custody, milestones, the truck load, tracking, the chat thread      |
| **Trust**     | the recruitment, the free agent llamado and its cupos, staffing, reputation                 |
| **Money**     | the fare, the rider's pay, the commission, the settlement, the cards, the platform plan     |

**A module never reads another module's tables.** It asks, through an interface, in process. The
boundary is enforced by the schema each module owns rather than by convention, so a query that
crosses it does not compile against anything.

## The dependency rules, which are older than this service

They are the domain's own, already stated and already held by specs on the web side. Restating them
in C# does not make them new, and breaking one here breaks the product rather than the code:

- **Money is a leaf.** The platform plan reads nothing and must stay that way, because Commerce and
  Trust both read it. A service that reads a floor clamps with a maximum on the way out; a service
  that writes one below the floor refuses.
- **Trust reads Logistics, and nothing Trust reads may read Trust back.** Reputation reads orders,
  loads and llamados; an edge in the other direction is a cycle. The question travels the other way,
  as a gate on the request.
- **Logistics asks Trust for the bond.** Assigning a rider goes through staffing, which is the only
  thing that knows whether a rider is bound by an accepted recruitment or by a claimed cupo, and
  refuses a rider bound by neither.
- **An assignment records the mode it was handed under** and never derives it afterwards, so a
  recruitment that later completes cannot move an old delivery from one compliance figure to
  another.
- **A rider's compliance is split by mode and merged by counts**, never averaged, so a mode with
  four carreras cannot weigh what a mode with four hundred weighs.

The manual is not a module. It is content the site prerenders, and the API never serves it.

## What this service answers to

- **Every endpoint is an authorization decision before it is a query.** An object read by id
  belongs to somebody, and the first question is whether it belongs to the caller. It is the failure
  that dominates every API list worth reading, and it is invisible in a test that only signs in as
  the owner.
- **A response carries the fields the contract declares and no more.** Returning an entity and
  trusting the client to hide half of it publishes the half it hid.
- **A stored personal field is encrypted with an authenticated cipher and an envelope key**, and the
  key lives in a managed store rather than in configuration. A perfect cipher with the key beside it
  protects nothing.
- **A password is hashed, never encrypted**, with a function chosen to be slow.
- **A version that is still answering is a version that is still maintained.** An old route left
  alive for one surface is the quiet way an audited API stops being audited.
