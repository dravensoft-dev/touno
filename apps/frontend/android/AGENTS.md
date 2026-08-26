# apps/frontend/android: the Android app

Reserved. Jetpack Compose, consuming the same API as every other surface. Nothing is here yet, and
this page is what the first commit answers to.

## What lives here when it arrives

The Compose application, its Gradle build, and nothing that another surface also needs. The API
client is generated rather than written:
[`../../../packages/contracts/AGENTS.md`](../../../packages/contracts/AGENTS.md) is the source it is
generated from.

## What binds it before a line exists

- **The client is hostile by definition.** The binary runs on a device its owner controls, so no
  secret is embedded in it and no business rule is enforced only by it. A refusal a person can
  bypass by editing an APK is a refusal Touno does not have.
- **A credential lives in the Android Keystore**, never in a file, a preference or a constant.
- **MASVS is this surface's catalogue and only this surface's.** The server and the browser answer
  to ASVS instead, and applying either standard to the other's surface is the common way to spend
  the effort and cover nothing. The contract between them is the API list.
- **The vocabulary is the tree's.** An empresa, a sucursal, a rider, a reclutamiento and an order
  code mean here exactly what [`../../AGENTS.md`](../../AGENTS.md) says they mean.
- **Spanish is for what a person reads.** Every identifier, every file name and every commit message
  is English.
