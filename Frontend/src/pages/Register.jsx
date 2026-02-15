import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const res = await api.post(
        "/api/auth/register",
        {
          email: form.email,
          password: form.password,
          fullName: {
            firstName: form.firstName,
            lastName: form.lastName,
          },
        },
        { withCredentials: true }
      );

      localStorage.setItem("wasLoggedIn", "true");

      toast.success("Account created 🎉");

      navigate("/");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="center-min-h-screen auth-page-bg">
      <div className="auth-card premium-card">
        <header className="auth-header">
          <h1 className="gradient-text">Create account</h1>
          <p className="auth-sub">Start your AI journey ✨</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="field-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="primary-btn premium-btn"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
