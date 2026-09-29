import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, MessageSquare } from 'lucide-react'
import { getJobs, downloadUrl } from '../api/client'
import { usePolling } from '../api/usePolling'
import { JobStatusPill } from '../components/StatusPill'
import { useActiveJob } from '../state/activeJob'
import './History.css'

export default function History() {
  const navigate = useNavigate()
  const { setActiveJobId } = useActiveJob()
  const fetcher = useCallback(() => getJobs(), [])
  const { data: jobs, error } = usePolling(fetcher, 6000, true)

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <div className="eyebrow">history</div>
        <h1 className="page-title">Deck history</h1>
        <p className="page-subtitle">All generations, sorted by newest.</p>
      </div>

      {error && <div className="alert alert-soft alert-soft-danger">{error}</div>}

      <div className="surface-card surface-card--flush">
        <div className="divide-list">
          {(jobs ?? []).map((job) => (
            <div key={job.id} className="hist-row d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <span className="hist-row__icon d-flex align-items-center justify-content-center">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <button
                    className="btn-plain hist-row__name"
                    onClick={() => {
                      setActiveJobId(job.id)
                      navigate('/pipeline')
                    }}
                  >
                    {job.deck_name}
                  </button>
                  <div className="hist-row__meta">
                    {new Date(job.created_at).toLocaleString()} · {job.slide_count ?? '—'} slides
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <JobStatusPill status={job.status} />
                <a href={downloadUrl(job.id)} className="icon-btn">
                  <Download size={14} />
                </a>
              </div>
            </div>
          ))}
          {(jobs ?? []).length === 0 && (
            <div className="hist-empty text-center">No decks generated yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
