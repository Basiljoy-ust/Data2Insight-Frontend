import { createContext, useContext, useMemo, useState } from 'react'

const ActiveJobContext = createContext(null)

export function ActiveJobProvider({ children }) {
  const [activeJobId, setActiveJobId] = useState(null)
  const value = useMemo(() => ({ activeJobId, setActiveJobId }), [activeJobId])
  return <ActiveJobContext.Provider value={value}>{children}</ActiveJobContext.Provider>
}

export function useActiveJob() {
  const ctx = useContext(ActiveJobContext)
  if (!ctx) throw new Error('useActiveJob must be used within ActiveJobProvider')
  return ctx
}
