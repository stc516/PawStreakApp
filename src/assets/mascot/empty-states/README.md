# empty-states/

Mascot scenes for emotional empty states — the moments where a user has not yet
done anything on a given screen.

The job of these illustrations is **never** to scold. They should make the user
feel like the dog is patiently and warmly waiting for the next adventure.

## Suggested scenes

See `src/content/mascotScenes.ts → emptyStateScenes`. Highlights include:

- Bailey staring out the window, leash in mouth (no adventures today)
- Meiomi curled up with a small thought bubble of a paw print (no recent story
  chapters yet)
- Bailey sitting next to an unrolled map (no packs in progress)

## Pairing with copy

These illustrations work in tandem with the `data-testid="empty-state"` blocks
on Dashboard, PacksPage, and StoryPage. When adding a new empty state, prefer
sentences like:

- "{Dog}'s story starts today."
- "Today's waiting."
- "Pick a pack — the first walk earns the first chapter."
