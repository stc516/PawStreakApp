import type { PawstreakState } from '../types'

export interface AppStateRepository {
  load(): PawstreakState
  save(nextState: PawstreakState): void
}
