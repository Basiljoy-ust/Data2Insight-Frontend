import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import GenerateDeck from './pages/GenerateDeck'
import AgentPipeline from './pages/AgentPipeline'
import History from './pages/History'
import { ActiveJobProvider } from './state/activeJob'

export default function App() {
  return (
    <ActiveJobProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<GenerateDeck />} />
            <Route path="/pipeline" element={<AgentPipeline />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ActiveJobProvider>
  )
}
