import { useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, Upload, Sparkles, History, Search } from 'lucide-react'
import { getJobs } from '../api/client'
import { usePolling } from '../api/usePolling'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/generate', label: 'Generate Deck', icon: Upload },
  { to: '/pipeline', label: 'Agent Pipeline', icon: Sparkles },
  { to: '/history', label: 'History', icon: History },
]

const BREADCRUMBS = {
  '/': 'Dashboard',
  '/generate': 'Generate Deck',
  '/pipeline': 'Agent Pipeline',
  '/history': 'History',
}

export default function Layout({ children }) {
  const location = useLocation()
  const jobsFetch = useCallback(() => getJobs(), [])
  const { data: jobs } = usePolling(jobsFetch, 10000, true)
  const jobCount = jobs?.length ?? 0

  return (
    <div className="app-shell d-flex">
      <aside className="app-sidebar d-flex flex-column">
        <div className="app-brand d-flex align-items-center">
          <div className="app-brand__logo d-flex align-items-center justify-content-center">D</div>
          <div>
            <div className="app-brand__name">DeckForge</div>
            <div className="app-brand__tag">MSR Intelligence</div>
          </div>
        </div>

        <div className="app-sidebar__section">Workspace</div>

        <nav className="app-nav d-flex flex-column gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const badge = to === '/history' ? jobCount : to === '/pipeline' ? 12 : null
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `app-nav__link d-flex align-items-center justify-content-between${
                    isActive ? ' app-nav__link--active' : ''
                  }`
                }
              >
                <span className="app-nav__label d-flex align-items-center">
                  <Icon size={18} />
                  {label}
                </span>
                {badge !== null && badge > 0 && (
                  <span className="badge rounded-pill app-nav__badge">{badge}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="app-sidebar__footer mt-auto">
          <div className="app-engagement">
            <div className="app-engagement__label">Engagement</div>
            <div className="app-engagement__name">Schroders - Incident.MSR</div>
            <div className="app-engagement__meta">POC-v0.1 · Human-in-loop</div>
          </div>
        </div>
      </aside>

      <div className="app-main d-flex flex-column overflow-hidden">
        <header className="app-header d-flex align-items-center justify-content-between">
          <div className="app-breadcrumb d-flex align-items-center gap-2">
            <span className="app-breadcrumb__root">DeckForge</span>
            <span className="app-breadcrumb__sep">/</span>
            <span>{BREADCRUMBS[location.pathname] ?? 'Dashboard'}</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <Search size={16} className="app-search__icon" />
              <input
                placeholder="Search decks, agents, uploads..."
                className="form-control app-search__input"
              />
            </div>
            <div className="app-header__user">user@ust.com</div>
            <div className="app-header__avatar d-flex align-items-center justify-content-center">
              U
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
