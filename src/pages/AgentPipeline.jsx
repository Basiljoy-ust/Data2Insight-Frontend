import { useCallback, useState } from 'react'
import { CheckCircle2, Download, AlertTriangle } from 'lucide-react'
import { getJob, reviewJob, deliverJob, downloadUrl } from '../api/client'
import { usePolling } from '../api/usePolling'
import AgentPipelinePanel from '../components/AgentPipelinePanel'
import { JobStatusPill } from '../components/StatusPill'
import { useActiveJob } from '../state/activeJob'
import './AgentPipeline.css'

export default function AgentPipeline() {
  const { activeJobId } = useActiveJob()
  const [busy, setBusy] = useState(false)

  const fetcher = useCallback(() => {
    if (!activeJobId) return Promise.resolve(null)
    return getJob(activeJobId)
  }, [activeJobId])
  const { data: job, error, refetch } = usePolling(fetcher, 3000, !!activeJobId)

  if (!activeJobId) {
    return (
      <div className="pipe-empty d-flex flex-column align-items-center justify-content-center gap-2 text-center h-100">
        <p className="pipe-empty__title">No active deck selected</p>
        <p className="pipe-empty__text">Generate a new deck or pick one from History to see its pipeline.</p>
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-soft alert-soft-danger">{error}</div>
  }

  if (!job) {
    return <div className="pipe-loading">Loading pipeline…</div>
  }

  async function handleReview() {
    setBusy(true)
    try {
      await reviewJob(job.id)
      await refetch()
    } finally {
      setBusy(false)
    }
  }

  async function handleDeliver() {
    setBusy(true)
    try {
      await deliverJob(job.id)
      await refetch()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="d-flex gap-4">
      <div className="pipe-main d-flex flex-column gap-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="eyebrow">pipeline</div>
            <h1 className="page-title">{job.deck_name}</h1>
            <div className="d-flex align-items-center gap-2 mt-1">
              <JobStatusPill status={job.status} />
              {job.reporting_month && (
                <span className="pipe-month">{job.reporting_month}</span>
              )}
            </div>
          </div>
          <div className="d-flex gap-2">
            {job.status === 'AWAITING_REVIEW' && (
              <button
                onClick={handleReview}
                disabled={busy}
                className="btn btn-brand btn-pill"
              >
                <CheckCircle2 size={16} /> Mark Reviewed
              </button>
            )}
            {job.status === 'REVIEWED' && (
              <button
                onClick={handleDeliver}
                disabled={busy}
                className="btn btn-brand btn-pill"
              >
                Mark Delivered
              </button>
            )}
            {job.deck_path && (
              <a
                href={downloadUrl(job.id)}
                className="btn btn-outline-ink btn-pill"
              >
                <Download size={16} /> Download
              </a>
            )}
          </div>
        </div>

        {job.error && (
          <div
            className={`alert alert-soft d-flex align-items-center gap-2 ${
              job.status === 'FAILED' ? 'alert-soft-danger' : 'alert-soft-warning'
            }`}
          >
            <AlertTriangle size={16} /> {job.error}
          </div>
        )}

        {job.metrics && (
          <div className="row gx-3">
            <div className="col-3">
              <MetricTile label="Submitted" value={job.submitted_metrics?.total_submitted ?? job.metrics.total_submitted} />
            </div>
            <div className="col-3">
              <MetricTile label="Closed" value={job.metrics.total_closed} />
            </div>
            <div className="col-3">
              <MetricTile label="Success Rate" value={`${job.metrics.success_rate}%`} />
            </div>
            <div className="col-3">
              <MetricTile label="Emergency" value={job.metrics.emergency_changes} />
            </div>
          </div>
        )}

        {job.case_studies.length > 0 && (
          <div className="surface-card">
            <h3 className="section-title mb-3">Notable changes</h3>
            <div className="pipe-stack d-flex flex-column">
              {job.case_studies.map((cs) => (
                <div key={cs.ticket_id} className="pipe-case">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="pipe-case__title">
                      {cs.ticket_id} — {cs.title}
                    </span>
                    <span className="badge rounded-pill pipe-case__outcome">
                      {cs.outcome}
                    </span>
                  </div>
                  <p className="pipe-case__commentary">{cs.commentary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {job.validation_issues.length > 0 && (
          <div className="surface-card">
            <h3 className="section-title mb-3">Validation notes</h3>
            <div className="d-flex flex-column gap-2">
              {job.validation_issues.map((issue, i) => (
                <div
                  key={i}
                  className={`pipe-issue ${
                    issue.severity === 'error'
                      ? 'pipe-issue--error'
                      : issue.severity === 'warning'
                        ? 'pipe-issue--warning'
                        : 'pipe-issue--info'
                  }`}
                >
                  {issue.row && <span className="pipe-issue__row font-monospace">Row {issue.row} · </span>}
                  {issue.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pipe-side">
        <AgentPipelinePanel agents={job.agents} />
      </div>
    </div>
  )
}

function MetricTile({ label, value }) {
  return (
    <div className="pipe-metric h-100">
      <div className="eyebrow">{label}</div>
      <div className="pipe-metric__value">{value}</div>
    </div>
  )
}
