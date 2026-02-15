import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api.js";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    api
      .post(
        "/api/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
      )
      .then(() => {
        localStorage.setItem("wasLoggedIn", "true");
        toast.success("Login Successful 👋");
        navigate("/");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Invalid email or password"
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
  <div className="center-min-h-screen auth-page-bg">
    <div className="auth-card premium-card" role="main">
      
      <header className="auth-header">
        <h1 className="gradient-text">Welcome Back</h1>
        <p className="auth-sub">Sign in to continue your chats</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="primary-btn premium-btn"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="auth-alt">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  </div>
);

};

export default Login;
