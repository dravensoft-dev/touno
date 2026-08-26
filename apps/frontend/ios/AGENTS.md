# apps/frontend/ios: the iOS app

Reserved. SwiftUI, consuming the same API as every other surface. Nothing is here yet, and this
page is what the first commit answers to.

## What lives here when it arrives

The SwiftUI application, its Xcode project, and nothing that another surface also needs. The API
client is generated rather than written:
[`../../../packages/contracts/AGENTS.md`](../../../packages/contracts/AGENTS.md) is the source it is
generated from.

## What binds it before a line exists

- **The client is hostile by definition**, for the same reason the Android one is: the binary runs
  on a device its owner controls. No secret in the bundle, and no rule enforced only here.
- **A credential lives in the Keychain**, never in a plist, a constant or a cache file.
- **MASVS is this surface's catalogue and only this surface's**, and the API list is the contract
  between it and what the server answers to.
- **The vocabulary is the tree's**, stated once in [`../../AGENTS.md`](../../AGENTS.md).
- **Spanish is for what a person reads**, and everything else is English.
