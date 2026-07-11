// דף מעקב חי למורים אחרי סטודנטים שנבחנים בזמן אמת
// מציג מי נבחן כרגע, מתי התחיל ואם הוא מחובר או מנותק על בסיס heartbeats

import { useState, useEffect } from 'react'
import { getLiveSessions } from '../api/monitorService'

function LiveMonitor() {
  const [sessions, setSessions] = useState([])
  const [serverTime, setServerTime] = useState(new Date().toISOString())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchLiveSessions = async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const activeData = await getLiveSessions()
      if (activeData && activeData.sessions) {
        setSessions(activeData.sessions)
        setServerTime(activeData.serverTime)
      } else {
        setSessions(activeData || [])
        setServerTime(new Date().toISOString())
      }
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      console.error('Failed to load active sessions:', err)
      setError('Failed to fetch real-time exam sessions.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Poll live sessions every 3 seconds
  useEffect(() => {
    // Run initial fetch inside a setTimeout to avoid synchronous setState inside useEffect warning
    const timer = setTimeout(() => {
      fetchLiveSessions(true)
    }, 0)

    const intervalId = setInterval(() => {
      fetchLiveSessions(false)
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearInterval(intervalId)
    }
  }, [])

  // Calculate elapsed time (e.g. 5 minutes ago)
  const getElapsedString = (startTimeStr) => {
    const start = new Date(startTimeStr)
    const now = new Date(serverTime)
    const diffMs = now - start
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)

    if (diffSecs < 60) {
      return `${Math.max(0, diffSecs)}s ago`
    }
    return `${diffMins}m ${Math.max(0, diffSecs % 60)}s ago`
  }

  // Check connection status (active within last 20 seconds)
  const getConnectionStatus = (lastActiveStr) => {
    const lastActive = new Date(lastActiveStr)
    const now = new Date(serverTime)
    const diffSeconds = (now - lastActive) / 1000
    
    if (diffSeconds <= 20) {
      return {
        label: 'Online 🟢',
        badgeClass: 'bg-success bg-opacity-10 text-success border border-success-subtle'
      }
    }
    return {
      label: 'Away / Disconnected 🟡',
      badgeClass: 'bg-warning bg-opacity-10 text-warning-emphasis border border-warning-subtle'
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="text-start">
            <h2 className="mb-1">📡 Real-Time Exam Monitor</h2>
            <p className="text-muted mb-0">
              Track live student test-taking sessions and system activity in real-time.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              Auto-refreshing every 3s | Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => fetchLiveSessions(true)}
              disabled={loading}
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Dashboard summary widget */}
        <div className="card border-primary-subtle bg-primary-subtle bg-opacity-25 mb-4 shadow-sm">
          <div className="card-body text-center py-3">
            <h5 className="text-primary-emphasis mb-1 fw-bold text-uppercase small" style={{ letterSpacing: '0.5px' }}>
              Active Student Sessions Right Now
            </h5>
            <h2 className="fw-black text-primary mb-0">{sessions.length}</h2>
          </div>
        </div>

        {loading && sessions.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading live streams...</span>
            </div>
            <p className="text-muted mt-2 mb-0">Connecting to server socket feeds...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="card border-light bg-light py-5">
            <div className="card-body text-center">
              <span className="display-4 mb-2 d-block">💤</span>
              <h5 className="fw-bold">No Active Sessions</h5>
              <p className="text-muted mb-0">
                No students are currently taking exams. Active test sessions will appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th className="text-start">Student Name</th>
                  <th className="text-start">Exam Title</th>
                  <th className="text-start">Start Time</th>
                  <th className="text-start">Connection Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const conn = getConnectionStatus(session.lastActive)
                  return (
                    <tr key={session.id}>
                      <td className="text-start fw-semibold">{session.studentName}</td>
                      <td className="text-start">{session.examTitle}</td>
                      <td className="text-start text-muted small">
                        {getElapsedString(session.startTime)}
                      </td>
                      <td className="text-start">
                        <span className={`badge px-3 py-1.5 rounded-pill ${conn.badgeClass}`}>
                          {conn.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveMonitor
