# src/app/pages/restaurant — the restaurant owner's panel

The second vertical, and the one modelled on what a merchant already expects from a food-delivery
app. Four module groups, eleven screens.

| Group          | Screens                        |
| -------------- | ------------------------------ |
| Operating core | live orders, history, settings |
| Menu           | carta, product editor          |
| Money          | metrics, finance               |
| Reputation     | promotions, reviews            |

Plus the hiring lane it shares with the import shop.

## The rules of this lane

- **Live orders is a board, not a list.** Four columns, one per state, and a card moves right as
  the kitchen works. `minColumn` is set to `15rem` so four columns fit a laptop beside the rail.
- **An order card's actions live in its body.** `ArenaCard`'s `action` slot sits beside the title
  and is built for one control; two of them wrap into the heading.
- **Rejecting is a confirmation, and it is destructive.** `ArenaConfirmDialog` with `destructive`,
  because rejecting leaves a buyer with no food and money committed.
- **Removing a product from the menu needs the word typed.** `requireText` on the confirm dialog,
  because it stops being sold immediately.
- **A chart carries identity or meaning, never both.** The metrics charts use the `cat-*` ramp for
  identity. Status colours never become series colours.
- **The switch owns nothing.** `ArenaSwitch` reports `requestChange` with no payload; the page
  flips the value it already holds.
