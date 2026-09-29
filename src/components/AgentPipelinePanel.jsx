import { AgentStatusLabel } from './StatusPill'
import './AgentPipelinePanel.css'

export default function AgentPipelinePanel({ agents, compact = false }) {
  const done = agents.filter((a) => a.status === 'DONE' || a.status === 'SKIPPED').length
  const isRunning = agents.some((a) => a.status === 'ACTIVE')
  const skippedCount = agents.filter((a) => a.status === 'SKIPPED').length

  return (
    <div className="surface-card">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <h3 className="section-title">agent pipeline</h3>
        <div className="d-flex align-items-center gap-2">
          {skippedCount > 0 && (
            <span className="badge rounded-pill pipeline-panel__chip pipeline-panel__chip--skipped">
              {skippedCount} skipped
            </span>
          )}
          <span
            className={`badge rounded-pill pipeline-panel__chip ${
              isRunning ? 'pipeline-panel__chip--running' : 'pipeline-panel__chip--idle'
            }`}
          >
            {isRunning ? 'Running' : 'Idle'}
          </span>
        </div>
      </div>
      <div className="pipeline-panel__meta mb-3">
        {agents.length} agents · {new Set(agents.map((a) => a.phase)).size} phases
      </div>

      <div className="progress pipeline-panel__progress mb-3">
        <div
          className="progress-bar"
          style={{ width: `${(done / agents.length) * 100}%` }}
        />
      </div>
      <div className="pipeline-panel__meta text-end mb-3">
        {done}/{agents.length} complete
      </div>

      <div className={`d-flex flex-column gap-2 ${compact ? 'pipeline-panel__list--compact' : ''}`}>
        {agents.map((agent, index) => {
          const prevAgent = index > 0 ? agents[index - 1] : null
          const showPhaseHeader = !prevAgent || prevAgent.phase !== agent.phase
          
          return (
            <div key={agent.id}>
              {showPhaseHeader && (
                <div className="pipeline-panel__phase-header">{agent.phase}</div>
              )}
              <div
                className={`pipeline-panel__row d-flex align-items-center justify-content-between ${
                  agent.status === 'ACTIVE' ? 'pipeline-panel__row--active' : ''
                }`}
              >
                <div className="pipeline-panel__row-main d-flex align-items-center">
                  <span
                    className={`pipeline-panel__num d-flex align-items-center justify-content-center ${
                      agent.status === 'ACTIVE'
                        ? 'pipeline-panel__num--active'
                        : agent.status === 'DONE'
                          ? 'pipeline-panel__num--done'
                          : agent.status === 'SKIPPED'
                            ? 'pipeline-panel__num--skipped'
                            : agent.status === 'FAILED'
                              ? 'pipeline-panel__num--failed'
                              : 'pipeline-panel__num--default'
                    }`}
                  >
                    {agent.id}
                  </span>
                  <div>
                    <div className="pipeline-panel__name">{agent.name}</div>
                  </div>
                </div>
                <AgentStatusLabel status={agent.status} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="pipeline-panel__legend d-flex align-items-center mt-3">
        <span className="pipeline-panel__legend-item d-flex align-items-center">
          <span className="pipeline-panel__legend-dot pipeline-panel__legend-dot--done" /> Done
        </span>
        <span className="pipeline-panel__legend-item d-flex align-items-center">
          <span className="pipeline-panel__legend-dot pipeline-panel__legend-dot--active" /> Active
        </span>
        <span className="pipeline-panel__legend-item d-flex align-items-center">
          <span className="pipeline-panel__legend-dot pipeline-panel__legend-dot--pending" /> Pending
        </span>
        <span className="pipeline-panel__legend-item d-flex align-items-center">
          <span className="pipeline-panel__legend-dot pipeline-panel__legend-dot--future" /> Future
        </span>
        <span className="pipeline-panel__legend-item d-flex align-items-center">
          <span className="pipeline-panel__legend-dot pipeline-panel__legend-dot--skipped" /> Skipped
        </span>
      </div>
    </div>
  )
}
