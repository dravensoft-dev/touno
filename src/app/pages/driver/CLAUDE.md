# src/app/pages/driver — the driver's panel

Seven screens, and the one lane where a person is using the app while doing something else.

| Screen                  | Route                                          |
| ----------------------- | ---------------------------------------------- |
| Turno                   | `/conductor/turno`                             |
| Carrera entrante        | `/conductor/carreras`                          |
| Recojo verificado       | `/conductor/carreras/:id/recojo`               |
| Entrega en oficina      | `/conductor/carreras/:id/entrega`              |
| Ganancias               | `/conductor/ganancias`                         |
| Ofertas de contratación | `/conductor/ofertas`, `/conductor/ofertas/:id` |

## The rules of this lane

- **One decision per screen, and the money before the yes.** The incoming ride puts the earnings
  in an `arena-stat-card` above the accept button, never under it.
- **The photo is the proof, and it gates the step.** "Recogido, voy a sucursal" stays disabled
  until the pickup photo is taken. That photo is the evidence nobody has today when a parcel is
  lost, so it is a hard gate rather than a suggestion.
- **The drop-off works with no signal, and the screen says so.** The four-digit code is the
  handover; the alert states that it syncs later. That is the handoff the brief says to show
  working, because it is the one that replaces the branch's paper notebook.
- **A hiring offer is answered here and nowhere else.** A business sends one from its own panel;
  `Hiring.accept()` throws if the driver answering is not the one it names, and only a `pendiente`
  offer transitions. The loop closes across two panels over one service.
