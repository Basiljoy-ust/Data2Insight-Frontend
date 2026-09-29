import './StatusPill.css'

const JOB_STYLES = {
  READY: 'job-pill--ready',
  REVIEWED: 'job-pill--reviewed',
  DELIVERED: 'job-pill--delivered',
  AWAITING_REVIEW: 'job-pill--awaiting-review',
  RUNNING: 'job-pill--running',
  QUEUED: 'job-pill--queued',
  FAILED: 'job-pill--failed',
}

const AGENT_STYLES = {
  DONE: 'agent-label--done',
  ACTIVE: 'agent-label--active',
  PENDING: 'agent-label--pending',
  FUTURE: 'agent-label--future',
  FAILED: 'agent-label--failed',
  SKIPPED: 'agent-label--skipped',
}

export function JobStatusPill({ status }) {
  return (
    <span className={`badge rounded-pill job-pill ${JOB_STYLES[status]}`}>
      <span className="status-dot" />
      {status.replace('_', ' ')}
    </span>
  )
}

export function AgentStatusLabel({ status }) {
  return (
    <span className={`agent-label ${AGENT_STYLES[status]}`}>
      <span className="status-dot" />
      {status}
    </span>
  )
}
