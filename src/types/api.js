/**
 * Shape reference for the backend API responses.
 *
 * These JSDoc typedefs carry no runtime code. They document the payloads the
 * frontend receives from /api so editors can offer hints, and they mirror the
 * backend models exactly.
 */

/** @typedef {'FUTURE' | 'PENDING' | 'ACTIVE' | 'DONE' | 'FAILED' | 'SKIPPED'} AgentStatus */

/**
 * @typedef {'QUEUED'
 *   | 'RUNNING'
 *   | 'AWAITING_REVIEW'
 *   | 'REVIEWED'
 *   | 'DELIVERED'
 *   | 'READY'
 *   | 'FAILED'} JobStatus
 */

/**
 * @typedef {Object} AgentState
 * @property {number} id
 * @property {string} name
 * @property {string} phase
 * @property {AgentStatus} status
 * @property {string | null} detail
 * @property {string | null} started_at
 * @property {string | null} finished_at
 */

/**
 * @typedef {Object} ValidationIssue
 * @property {'error' | 'warning' | 'info'} severity
 * @property {number | null} row
 * @property {string | null} column
 * @property {string} message
 */

/**
 * @typedef {Object} MonthlyTrendPoint
 * @property {string} month
 * @property {number} submitted
 * @property {number} closed
 */

/**
 * @typedef {Object} MetricsSummary
 * @property {string | null} reporting_month
 * @property {number} total_submitted
 * @property {number} total_closed
 * @property {Record<string, number>} by_change_type
 * @property {Record<string, number>} by_assignment_group
 * @property {number} emergency_changes
 * @property {number} success_count
 * @property {number} failed_count
 * @property {number} backout_count
 * @property {number} success_rate
 * @property {number} failure_rate
 * @property {number} backout_rate
 * @property {MonthlyTrendPoint[]} monthly_trend
 */

/**
 * @typedef {Object} CaseStudy
 * @property {string} ticket_id
 * @property {string} title
 * @property {string} outcome
 * @property {string} commentary
 * @property {number[]} source_rows
 */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} deck_name
 * @property {JobStatus} status
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} raw_data_filename
 * @property {string | null} template_filename
 * @property {string | null} reporting_month
 * @property {number | null} slide_count
 * @property {AgentState[]} agents
 * @property {ValidationIssue[]} validation_issues
 * @property {MetricsSummary | null} metrics
 * @property {MetricsSummary | null} submitted_metrics
 * @property {CaseStudy[]} case_studies
 * @property {string | null} deck_path
 * @property {string | null} error
 */

/**
 * @typedef {Object} JobSummary
 * @property {string} id
 * @property {string} deck_name
 * @property {JobStatus} status
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number | null} slide_count
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} decks_generated
 * @property {number} decks_generated_this_month
 * @property {number} files_uploaded
 * @property {string} ai_engine_status
 * @property {string} ai_engine_model
 */

export {}
