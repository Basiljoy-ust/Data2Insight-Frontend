const BASE = '/api'

async function request(path, init) {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(body.detail ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export function getDashboardStats() {
  return request('/dashboard/stats')
}

export function getJobs() {
  return request('/jobs')
}

export function getJob(id) {
  return request(`/jobs/${id}`)
}

/**
 * @param {{ rawData?: File, submittedData?: File, closedData?: File, template?: File | null }} input
 */
export function generateDeck(input) {
  const form = new FormData()
  if (input.rawData) form.append('raw_data', input.rawData)
  if (input.submittedData) form.append('submitted_data', input.submittedData)
  if (input.closedData) form.append('closed_data', input.closedData)
  if (input.template) form.append('template', input.template)
  return request('/jobs/generate', { method: 'POST', body: form })
}

export function reviewJob(id) {
  return request(`/jobs/${id}/review`, { method: 'POST' })
}

export function deliverJob(id) {
  return request(`/jobs/${id}/deliver`, { method: 'POST' })
}

export function downloadUrl(id) {
  return `${BASE}/jobs/${id}/download`
}
