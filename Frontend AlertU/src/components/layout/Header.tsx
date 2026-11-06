import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUnreadNotificationCount } from '../../services/notifications'
import alertuLogo from '../../assets/alertu-header-logo-transparent.png'
import './Header.css'

function Header() {
  const [campusExpanded, setCampusExpanded] = useState(false)

  const [unreadCount, setUnreadCount] = useState(
    getUnreadNotificationCount
  )

  useEffect(() => {
    function updateUnreadCount() {
      setUnreadCount(getUnreadNotificationCount())
    }

    window.addEventListener(
      'alertu-notifications-updated',
      updateUnreadCount
    )

    window.addEventListener('storage', updateUnreadCount)

    return () => {
      window.removeEventListener(
        'alertu-notifications-updated',
        updateUnreadCount
      )

      window.removeEventListener('storage', updateUnreadCount)
    }
  }, [])

  return (
    <header className="app-header">

      {/* Brand */}
      <div className="header-brand">
  <img
    src={alertuLogo}
    alt="AlertU"
    className="header-logo"
  />
</div>

      {/* Campus information */}
      <div className="header-campus">
        <button
          type="button"
          className="header-campus-trigger"
          aria-expanded={campusExpanded}
          onClick={() => setCampusExpanded(!campusExpanded)}
        >
          <span className="campus-label">YOUR CAMPUS</span>

          <span className="campus-name">
            Campus not assigned
          </span>

          <svg
            className={`campus-chevron ${
              campusExpanded ? 'expanded' : ''
            }`}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {campusExpanded && (
          <div className="campus-expanded-info">
            Your campus has not been assigned yet.
          </div>
        )}
      </div>

      {/* Header actions */}
      <div className="header-actions">

        <span className="demo-indicator">
          DEMO MODE
        </span>

        <Link
          to="/notifications"
          className="header-icon-button"
          aria-label={
            `Notifications, ${unreadCount} unread`
          }
          title="Notifications"
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          {unreadCount > 0 && (
            <span className="notification-count">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className="header-avatar"
          aria-label="Open student profile"
          title="Profile"
        >
          S
        </Link>

      </div>
    </header>
  )
}

export default Header