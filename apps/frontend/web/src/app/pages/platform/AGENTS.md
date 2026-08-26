# src/app/pages/platform: the operator's lane

Three screens for the operador de Touno, who holds no `companyId`, no `branchId` and no `riderId`.
He answers for the platform rather than for a record, which is why his rail carries no `type` and
`destinationsFor()` never filters him.

**The prefix is `/plataforma` and not `/touno`.** The reason is the Pages build and it is stated
where the code is, in [`../../layout/AGENTS.md`](../../layout/AGENTS.md).

| Screen    | Route                 | What it sets                                                                                                              |
| --------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `fees`    | `/plataforma/tarifas` | Touno's commission, the delivery-fee floor and the reputation floor                                                       |
| `weather` | `/plataforma/clima`   | which cities are in adverse weather, which is what makes the weather branch of a fare reachable without editing a fixture |
| `network` | `/plataforma/red`     | who currently clears the reputation floor, riders and sucursales together                                                 |

## Every value here is a floor, never a stored decision

**A floor is read at the question and never written onto a record.** That is what makes moving one
here block or release everyone below it in the same update, with nothing to migrate and no row to
rewrite. `network` fills and empties on the spot while `fees` is edited, and that is the demonstration
the screen exists for.

The two floors behave the same way and the mechanism is stated once, in
[`../../domain/AGENTS.md`](../../domain/AGENTS.md): a service that reads a floor clamps with
`Math.max`, and one that writes a value under it throws.

## This lane operates nothing

No pedido, no rider, no catalogue. The operator sets what the platform charges and what it requires,
and reads who meets it. Anything that reaches into a business's records belongs to that business's
lane.
