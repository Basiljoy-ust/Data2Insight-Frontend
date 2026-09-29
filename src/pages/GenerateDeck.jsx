import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileSpreadsheet, ClipboardList, X, Loader2 } from 'lucide-react'
import { generateDeck } from '../api/client'
import { useActiveJob } from '../state/activeJob'
import './GenerateDeck.css'

function FileDropzone({ label, hint, accept, file, onSelect, onClear, icon: Icon }) {
  const [dragOver, setDragOver] = useState(false)

  if (file) {
    return (
      <div className="gen-file d-flex align-items-center justify-content-between h-100">
        <div className="d-flex align-items-center gap-3">
          <span className="gen-file__icon d-flex align-items-center justify-content-center">
            <Icon size={18} />
          </span>
          <div>
            <div className="gen-file__name">{file.name}</div>
            <div className="gen-file__size">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        </div>
        <button onClick={onClear} className="btn-plain gen-file__clear">
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files?.[0]) onSelect(e.dataTransfer.files[0])
      }}
      className={`gen-dropzone d-flex flex-column align-items-center justify-content-center gap-2 text-center h-100 ${
        dragOver ? 'gen-dropzone--active' : ''
      }`}
    >
      <input
        type="file"
        accept={accept}
        className="d-none"
        onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
      />
      <Icon size={28} className="gen-dropzone__icon" />
      <div className="gen-dropzone__title">{label}</div>
      <div className="gen-dropzone__hint">{hint}</div>
    </label>
  )
}

export default function GenerateDeck() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setActiveJobId } = useActiveJob()
  const navState = location.state ?? {}

  const [mode, setMode] = useState(navState.rawFile ? 'combined' : 'split')
  const [rawFile, setRawFile] = useState(navState.rawFile ?? null)
  const [submittedFile, setSubmittedFile] = useState(null)
  const [closedFile, setClosedFile] = useState(null)
  const [templateFile, setTemplateFile] = useState(navState.templateFile ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = mode === 'combined' ? !!rawFile : !!submittedFile && !!closedFile

  async function handleSubmit() {
    if (!canSubmit) {
      setError(
        mode === 'combined'
          ? 'Upload the combined ServiceNow workbook (XLSX) to continue.'
          : 'Upload both the submitted and closed changes exports (XLSX) to continue.',
      )
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const job =
        mode === 'combined'
          ? await generateDeck({ rawData: rawFile, template: templateFile })
          : await generateDeck({ submittedData: submittedFile, closedData: closedFile, template: templateFile })
      setActiveJobId(job.id)
      navigate('/pipeline')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="gen-page mx-auto d-flex flex-column gap-4">
      <div>
        <div className="eyebrow">generate</div>
        <h1 className="page-title">Generate a new MSR deck</h1>
        <p className="page-subtitle">
          Upload the monthly ServiceNow export(s) and, optionally, a PPT template. The 12-agent
          pipeline will validate, analyze, and build the deck automatically.
        </p>
      </div>

      <div className="gen-toggle d-inline-flex align-self-start">
        <button
          onClick={() => setMode('split')}
          className={`btn-plain gen-toggle__btn ${
            mode === 'split' ? 'gen-toggle__btn--active' : ''
          }`}
        >
          Submitted + Closed
        </button>
        <button
          onClick={() => setMode('combined')}
          className={`btn-plain gen-toggle__btn ${
            mode === 'combined' ? 'gen-toggle__btn--active' : ''
          }`}
        >
          Combined workbook
        </button>
      </div>

      {mode === 'split' ? (
        <div className="row gx-3">
          <div className="col-6">
            <FileDropzone
              label="Submitted changes (XLSX)"
              hint="Required · this month's submitted export"
              accept=".xlsx,.xls"
              file={submittedFile}
              onSelect={setSubmittedFile}
              onClear={() => setSubmittedFile(null)}
              icon={FileSpreadsheet}
            />
          </div>
          <div className="col-6">
            <FileDropzone
              label="Closed changes (XLSX)"
              hint="Required · this month's closed export"
              accept=".xlsx,.xls"
              file={closedFile}
              onSelect={setClosedFile}
              onClear={() => setClosedFile(null)}
              icon={FileSpreadsheet}
            />
          </div>
        </div>
      ) : (
        <FileDropzone
          label="Raw data (XLSX)"
          hint="Required · one workbook containing both submitted and closed changes"
          accept=".xlsx,.xls"
          file={rawFile}
          onSelect={setRawFile}
          onClear={() => setRawFile(null)}
          icon={FileSpreadsheet}
        />
      )}

      <FileDropzone
        label="PPT template"
        hint="Optional · defaults to the standard MSR template"
        accept=".pptx"
        file={templateFile}
        onSelect={setTemplateFile}
        onClear={() => setTemplateFile(null)}
        icon={ClipboardList}
      />

      {error && (
        <div className="alert alert-soft alert-soft-danger">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !canSubmit}
        className="btn btn-brand gen-submit w-100 d-flex align-items-center justify-content-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="spin" /> Starting pipeline…
          </>
        ) : (
          'Generate Deck'
        )}
      </button>
    </div>
  )
}
