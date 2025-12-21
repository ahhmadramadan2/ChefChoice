import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General question",
    message: "",
  });

  const [status, setStatus] = useState("");   // success message
  const [error, setError] = useState("");     // error message
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      await axios.post(
        `${API}/api/contact`,
        form,
        { withCredentials: true } // keep consistent with session auth
      );

      setStatus("✅ Thank you! Your message has been sent to the restaurant.");
      setForm({
        name: "",
        email: "",
        topic: "General question",
        message: "",
      });

      // Optional: auto-hide status
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      console.error("Contact form error:", err);
      setError("⚠️ Something went wrong. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page contact-page">
      <div className="container">
        {/* Hero */}
        <div className="contact-hero">
          <div>
            <h1>Contact</h1>
          </div>

          <div className="contact-hero-chip" aria-hidden="true">
            ☎️
          </div>
        </div>

        <div className="contact-layout">
          {/* Form */}
          <form className="contact-card" onSubmit={handleSubmit}>
            <div className="contact-card-head">
              <h2>Send a Message</h2>
              <p className="section-subtitle">
                We usually reply within 24 hours.
              </p>
            </div>

            <div className="contact-fields">
              <div className="contact-field">
                <label>Name</label>
                <input
                  className="contact-input"
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              <div className="contact-field">
                <label>Email</label>
                <input
                  className="contact-input"
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@email.com"
                />
              </div>

              <div className="contact-field">
                <label>Topic</label>
                <select
                  className="contact-input"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                >
                  <option>General question</option>
                  <option>Table reservation</option>
                  <option>Catering</option>
                  <option>Feedback</option>
                </select>
              </div>

              <div className="contact-field">
                <label>Message</label>
                <textarea
                  className="contact-input contact-textarea"
                  name="message"
                  rows="5"
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message…"
                />
              </div>

              <button
                type="submit"
                className="btn-primary contact-submit"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Submit"}
              </button>

              {status && (
                <div className="contact-status">
                  {status}
                </div>
              )}

              {error && (
                <div className="auth-alert">
                  {error}
                </div>
              )}
            </div>
          </form>

          {/* Info */}
          <div className="contact-card contact-info">
            <div className="contact-card-head">
              <h2>Restaurant Info</h2>
            </div>

            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Address</span>
                <strong>Beirut, Downtown</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Phone</span>
                <strong>+961 3 662 889</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <strong>ahhmadramadan@outlook.com</strong>
              </div>
            </div>

            <div className="info-divider" />

            <h3 className="info-title">Opening Hours</h3>
            <ul className="info-hours">
              <li>
                <span>Mon–Thu</span> <strong>10:00 – 22:00</strong>
              </li>
              <li>
                <span>Fri–Sat</span> <strong>10:00 – 23:30</strong>
              </li>
              <li>
                <span>Sun</span> <strong>11:00 – 21:00</strong>
              </li>
            </ul>

            <div className="info-map">
              <div className="info-map-badge">📍 Location</div>
              <p>Beirut, Downtown</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
