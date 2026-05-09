import type { PawstreakState } from '../types'

export interface AppStateRepository {
  /** Synchronous initial snapshot — used for first render. */
  load(): PawstreakState
  /** Persist locally; remote write may be async/fire-and-forget. */
  save(nextState: PawstreakState): void
  /**
   * Optional: pull the latest remote-authoritative state after mount.
   * Returning null means "nothing remote yet — keep local snapshot as-is".
   */
  hydrate?(): Promise<PawstreakState | null>
}
