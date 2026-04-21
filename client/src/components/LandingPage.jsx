import "./LandingPage.css";

function LandingPage({
  currentUser,
  onBrowseInspiration,
  onOpenRegister,
  onOpenPlanner,
}) {
  return (
    <section className="landing-page panel">
      <div className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">Plan With A Clearer Timeline</p>
          <h2>
            TripTrack keeps your trips, dates, and itineraries in one place.
          </h2>
          <p className="landing-description">
            Use TripTrack to map out trips, organize activities by date, review
            everything on a calendar, and borrow ideas from curated inspiration
            itineraries before you commit them to your own planner.
          </p>
          <div className="landing-actions">
            {currentUser ? (
              <button onClick={onOpenPlanner} type="button">
                Open Planner
              </button>
            ) : (
              <button onClick={onOpenRegister} type="button">
                Register To Start Planning
              </button>
            )}
            <button
              className="landing-secondary-button"
              onClick={onBrowseInspiration}
              type="button"
            >
              Browse Inspiration
            </button>
          </div>
        </div>

        <div className="landing-highlight-card">
          <p className="landing-highlight-label">What It Helps With</p>
          <ul className="landing-feature-list">
            <li>Build trips with start and end dates from the calendar.</li>
            <li>
              Track activities for each day without losing the bigger picture.
            </li>
            <li>
              Review plans in planner, calendar, timeline, and statistics views.
            </li>
            <li>
              Copy seeded inspiration trips into your own planner after logging
              in.
            </li>
          </ul>
        </div>
      </div>

      <div className="landing-grid">
        <article className="landing-info-card">
          <h3>Calendar-first planning</h3>
          <p>
            Pick a day or drag across a date range on the calendar to prefill a
            trip before you move into the planner form.
          </p>
        </article>

        <article className="landing-info-card">
          <h3>Organized itineraries</h3>
          <p>
            Keep each trip&apos;s activities grouped together so transportation,
            meals, reservations, and notes stay tied to the right schedule.
          </p>
        </article>

        <article className="landing-info-card">
          <h3>Inspiration that becomes action</h3>
          <p>
            Explore sample trips for ideas, then copy the ones you like into
            your own planner and customize them.
          </p>
        </article>
      </div>
    </section>
  );
}

export default LandingPage;
