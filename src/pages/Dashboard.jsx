import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Upload as UploadIcon, Star, Clock, Plus, FileSpreadsheet, ClipboardList, Download } from 'lucide-react'
import { getDashboardStats, getJobs, getJob, downloadUrl } from '../api/client'
import { usePolling } from '../api/usePolling'
import AgentPipelinePanel from '../components/AgentPipelinePanel'
import { JobStatusPill } from '../components/StatusPill'
import { useActiveJob } from '../state/activeJob'
import './Dashboard.css'

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="surface-card h-100">
      <div className="stat-card__head d-flex align-items-center justify-content-between">
        <span className="eyebrow">{label}</span>
        <span className="stat-card__icon d-flex align-items-center justify-content-center">
          <Icon size={16} />
        </span>
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__sub">{sub}</div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeJobId, setActiveJobId } = useActiveJob()
  const [dragOver, setDragOver] = useState(null)

  const statsFetch = useCallback(() => getDashboardStats(), [])
  const jobsFetch = useCallback(() => getJobs(), [])
  const { data: stats } = usePolling(statsFetch, 8000, true)
  const { data: jobs } = usePolling(jobsFetch, 5000, true)

  const activeJobFetch = useCallback(async () => {
    if (!activeJobId) return null
    return getJob(activeJobId)
  }, [activeJobId])
  const { data: activeJob } = usePolling(activeJobFetch, 3000, !!activeJobId)

  function handleFiles(kind, files) {
    if (!files || files.length === 0) return
    navigate('/generate', { state: { [kind === 'raw' ? 'rawFile' : 'templateFile']: files[0] } })
  }

  return (
    <div className="d-flex gap-4">
      <div className="dash-main d-flex flex-column gap-4">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <div className="eyebrow">overview</div>
            <h1 className="page-title">Hello,</h1>
            <p className="page-subtitle">
              Turn your monthly ServiceNow dump into a review-ready MSR deck.
            </p>
          </div>
          <div className="dash-actions d-flex align-items-center">
            <button
              onClick={() => navigate('/history')}
              className="btn btn-outline-ink btn-pill"
            >
              <Clock size={16} /> History
            </button>
            <button
              onClick={() => navigate('/generate')}
              className="btn btn-brand btn-pill"
            >
              <Plus size={16} /> New Deck
            </button>
          </div>
        </div>

        <div className="row gx-3">
          <div className="col-4">
            <StatCard
              icon={MessageSquare}
              label="Decks Generated"
              value={stats?.decks_generated ?? '—'}
              sub={`${stats?.decks_generated_this_month ?? 0} this month`}
            />
          </div>
          <div className="col-4">
            <StatCard
              icon={UploadIcon}
              label="Files Uploaded"
              value={stats?.files_uploaded ?? '—'}
              sub="raw data & templates"
            />
          </div>
          <div className="col-4">
            <StatCard
              icon={Star}
              label="AI Engine"
              value={stats?.ai_engine_status ?? '—'}
              sub={stats?.ai_engine_model ?? ''}
            />
          </div>
        </div>

        <div className="surface-card">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 className="section-title">quick upload</h3>
              <p className="hint-text">
                Drop the raw data and the PPT template to kick off a new deck
              </p>
            </div>
            <button
              onClick={() => navigate('/generate')}
              className="btn-plain dash-link"
            >
              Open workflow →
            </button>
          </div>
          <div className="row gx-3">
            {['raw', 'template'].map((kind) => (
              <div key={kind} className="col-6">
                <label
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(kind)
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(null)
                    handleFiles(kind, e.dataTransfer.files)
                  }}
                  className={`dash-dropzone d-flex flex-column align-items-center justify-content-center gap-2 text-center h-100 ${
                    dragOver === kind ? 'dash-dropzone--active' : ''
                  }`}
                >
                  <input
                    type="file"
                    accept={kind === 'raw' ? '.xlsx,.xls' : '.pptx'}
                    className="d-none"
                    onChange={(e) => handleFiles(kind, e.target.files)}
                  />
                  {kind === 'raw' ? (
                    <FileSpreadsheet size={28} className="dash-dropzone__icon" />
                  ) : (
                    <ClipboardList size={28} className="dash-dropzone__icon" />
                  )}
                  <div className="dash-dropzone__title">
                    {kind === 'raw' ? 'Raw data (XLSX)' : 'PPT template'}
                  </div>
                  <div className="dash-dropzone__hint">Drop file or browse</div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 className="section-title">recent decks</h3>
              <p className="hint-text">Latest generations · sorted by newest</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="btn-plain dash-link"
            >
              View all →
            </button>
          </div>
          <div className="divide-list">
            {(jobs ?? []).slice(0, 5).map((job) => (
              <div key={job.id} className="dash-deck-row d-flex align-items-center justify-content-between">
                <div className="dash-deck-row__main d-flex align-items-center">
                  <span className="dash-deck-row__icon d-flex align-items-center justify-content-center">
                    <MessageSquare size={16} />
                  </span>
                  <div>
                    <button
                      className="btn-plain dash-deck-row__name"
                      onClick={() => setActiveJobId(job.id)}
                    >
                      {job.deck_name}
                    </button>
                    <div className="dash-deck-row__meta">
                      {new Date(job.created_at).toLocaleDateString()} · {job.slide_count ?? '—'} slides
                    </div>
                  </div>
                </div>
                <div className="dash-deck-row__actions d-flex align-items-center">
                  <JobStatusPill status={job.status} />
                  {job.status !== 'QUEUED' && job.status !== 'RUNNING' && job.status !== 'FAILED' && (
                    <a href={downloadUrl(job.id)} className="icon-btn">
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {(jobs ?? []).length === 0 && (
              <div className="dash-empty text-center">
                No decks yet — upload a spreadsheet to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dash-side">
        <AgentPipelinePanel agents={activeJob?.agents ?? DEFAULT_AGENTS} compact />
      </div>
    </div>
  )
}

const DEFAULT_AGENTS = [
  { id: 1, name: 'ServiceNow Retrieval', phase: 'INGESTION', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 2, name: 'Data Validation & Quality', phase: 'INGESTION', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 3, name: 'Ticket Classification', phase: 'ANALYSIS', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 4, name: 'Ticket Analysis', phase: 'ANALYSIS', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 5, name: 'Insight & Trend', phase: 'ANALYSIS', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 6, name: 'KPI & Metrics', phase: 'ANALYSIS', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 7, name: 'Content Generation', phase: 'GENERATION', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 8, name: 'PPT Generation', phase: 'GENERATION', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 9, name: 'Human-in-the-Loop Review', phase: 'REVIEW', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 10, name: 'PPT Refinement', phase: 'REVIEW', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 11, name: 'PPT Validation', phase: 'GOVERNANCE', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
  { id: 12, name: 'Audit & Traceability', phase: 'GOVERNANCE', status: 'FUTURE', detail: null, started_at: null, finished_at: null },
]
