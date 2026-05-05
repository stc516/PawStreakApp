import { PATH_REGIONS, type PathNodeModel, type PathNodeState } from '../../data/adventurePath'

interface VerticalAdventurePathProps {
  nodes: PathNodeModel[]
  states: PathNodeState[]
  nextRegionTease: { title: string; preview: string; nodesAway: number } | null
}

export function VerticalAdventurePath({ nodes, states, nextRegionTease }: VerticalAdventurePathProps) {
  const sections = PATH_REGIONS.map((region, ri) => {
    const offset = PATH_REGIONS.slice(0, ri).reduce((sum, r) => sum + r.count, 0)
    return {
      region,
      slice: nodes.slice(offset, offset + region.count),
      stateSlice: states.slice(offset, offset + region.count),
    }
  })

  const totalNodes = nodes.length

  return (
    <div className='path-column'>
      {nextRegionTease ? (
        <div className='path-region-tease' role='status'>
          <span className='path-region-tease-k'>Next world</span>
          <span className='path-region-tease-title'>{nextRegionTease.title}</span>
          <span className='path-region-tease-sub'>
            {nextRegionTease.nodesAway} adventure{nextRegionTease.nodesAway === 1 ? '' : 's'} away · {nextRegionTease.preview}
          </span>
        </div>
      ) : null}

      {sections.map(({ region, slice, stateSlice }) => (
        <section key={region.id} className={`path-region ${region.themeClass}`}>
          <div className='path-region-header'>
            <h2 className='path-region-title'>{region.title}</h2>
            <p className='path-region-preview'>{region.preview}</p>
          </div>
          <div className='path-region-nodes'>
            {slice.map((node, i) => {
              const st = stateSlice[i]
              const globalIdx = node.globalIndex
              const isGlobalLast = globalIdx >= totalNodes - 1
              const isCurrent = st.status === 'current'
              return (
                <div
                  key={globalIdx}
                  className={`path-node-slot ${i % 2 === 0 ? 'path-node-slot--a' : 'path-node-slot--b'}`}
                >
                  <button
                    type='button'
                    className={[
                      'path-node',
                      `path-node--${st.status}`,
                      node.variant === 'rare' ? 'path-node--kind-rare' : '',
                      node.variant === 'milestone' ? 'path-node--kind-milestone' : '',
                      st.rareGlow ? 'path-node--rare-glow' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={st.status === 'locked'}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={
                      st.status === 'done'
                        ? `Checkpoint ${globalIdx + 1} complete`
                        : st.status === 'current'
                          ? `Current checkpoint ${globalIdx + 1}`
                          : `Locked checkpoint ${globalIdx + 1}`
                    }
                  >
                    <span className='path-node-inner'>
                      {st.status === 'done' ? (
                        <span className='path-node-icon'>✓</span>
                      ) : st.status === 'locked' ? (
                        <span className='path-node-icon path-node-icon--lock'>🔒</span>
                      ) : (
                        <span className='path-node-icon path-node-icon--pulse'>●</span>
                      )}
                    </span>
                  </button>
                  {!isGlobalLast ? <div className='path-connector' aria-hidden /> : null}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
