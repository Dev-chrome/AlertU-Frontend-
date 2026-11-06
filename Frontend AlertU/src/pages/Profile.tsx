import './Profile.css'

function Profile() {
  return (
    <div className="profile-page">

      <section className="profile-heading">
        <p className="pulse-eyebrow">YOUR ACCOUNT</p>
        <h1>Profile</h1>
        <p>View your student account information.</p>
      </section>

      <section className="profile-card">

        <div className="profile-avatar">
          S
        </div>

        <div className="profile-identity">
          <h2>Demo Student</h2>
          <p>Student account</p>
        </div>

        <span className="profile-demo-badge">
          DEMO
        </span>

        <div className="profile-divider"></div>

        <div className="profile-information">

          <div className="profile-information-item">
            <span>Full name</span>
            <strong>Demo Student</strong>
          </div>

          <div className="profile-information-item">
            <span>Email address</span>
            <strong>student@example.com</strong>
          </div>

          <div className="profile-information-item">
            <span>Campus</span>
            <strong>Not assigned</strong>
          </div>

          <div className="profile-information-item">
            <span>Account type</span>
            <strong>Student</strong>
          </div>

        </div>

        <p className="profile-demo-notice">
          This is demonstration account information.
          Your actual details will appear after authentication is connected.
        </p>

      </section>

    </div>
  )
}

export default Profile

