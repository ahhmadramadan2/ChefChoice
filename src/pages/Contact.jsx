
import { useState } from "react";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General question",
    message: "",
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    setStatus("Thank you! Your message has been recorded for demo purposes.");
   
    setForm({
      name: "",
      email: "",
      topic: "General question",
      message: "",
    });
  }

  return (
    <section className="page">
      <div className="container">
        <h1>Contact</h1>
        {/* <p className="section-subtitle">
          This is a demo project, but the form below shows how a basic contact form
          could look in a real system.
        </p> */}

        <div className="grid" style={{ alignItems: "flex-start" }}>
          <form className="dish-card" onSubmit={handleSubmit}>
            <h3>Send a Message</h3>
            <label>
              Name
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Topic
              <select
                name="topic"
                value={form.topic}
                onChange={handleChange}
              >
                <option>General question</option>
                <option>Table reservation</option>
                <option>Catering</option>
                <option>Feedback</option>
              </select>
            </label>

            <label>
              Message
              <textarea
                name="message"
                rows="4"
                required
                value={form.message}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className="btn-primary">
              Submit
            </button>

            {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
          </form>

          <div className="dish-card">
            <h3>Restaurant Info</h3>
            <p>
              <strong>Address:</strong> Beirut
            </p>
            <p>
              <strong>Phone:</strong> +961 3 662 889
            </p>
            <p>
              <strong>Email:</strong> ahhmadramadan@outlook.com
            </p>

            <h4>Opening Hours</h4>
            <ul>
              <li>Mon–Thu: 10:00 – 22:00</li>
              <li>Fri–Sat: 10:00 – 23:30</li>
              <li>Sun: 11:00 – 21:00</li>
            </ul>

            <h4>Location </h4>
            <p>
              Beirut,Downtown
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
