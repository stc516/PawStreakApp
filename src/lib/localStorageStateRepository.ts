import { loadPawstreakState, savePawstreakState } from './pawstreakState'
import type { AppStateRepository } from './stateRepository'

export const localStorageStateRepository: AppStateRepository = {
  load: () => loadPawstreakState(),
  save: (nextState) => savePawstreakState(nextState),
}
