// app/routes/_index.tsx
import { json, type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useState } from "react";
import "../stylesheets/landing.css";

export const meta: MetaFunction = () => {
  return [
    { title: "ByteClub - Competitive Coding Platform" },
    { name: "description", content: "Challenge other developers in real-time coding battles!" },
  ];
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="landing-container">
      <header className="main-header">
        <div className="logo-container">
          <h1 className="logo">ByteClub</h1>
          <p className="tagline">Code. Compete. Conquer.</p>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#demo">Try It Out</a></li>
            <li><a href="#auth" className="cta-button">Sign In</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2>Challenge Your Coding Skills</h2>
          <p>Compete head-to-head with other developers in real-time coding battles</p>
          <div className="hero-buttons">
            <a href="#demo" className="primary-button">Try Demo</a>
            <a href="#auth" className="secondary-button">Join Now</a>
          </div>
        </div>
        <div className="hero-image">
          <div className="code-snippet">
            <pre>
              <code>
{`function solveChallenge(input) {
  // Your solution here
  return optimizedResult;
}

// Are you faster than your opponent?
// Find out at ByteClub!`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <h2>About ByteClub</h2>
        <div className="about-content">
          <div className="about-text">
            <p>ByteClub is the ultimate platform for developers who thrive on competition and want to sharpen their coding skills against real opponents.</p>
            <p>Founded by a team of passionate software engineers, ByteClub was created to make competitive programming more engaging and social. Our platform offers real-time competitions, leaderboards, and a community of like-minded developers.</p>
            <p>Whether you're preparing for technical interviews or just enjoy the thrill of solving problems under pressure, ByteClub is your digital arena for code battles.</p>
          </div>
          <div className="about-stats">
            <div className="stat-box">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Coding Challenges</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">25+</span>
              <span className="stat-label">Programming Languages</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Real-time Competitions</h3>
            <p>Challenge your friends or get matched with opponents of similar skill level for head-to-head coding battles.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Global Leaderboard</h3>
            <p>Climb the ranks and establish yourself as a top coder in our global community.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Performance Metrics</h3>
            <p>Track your progress with detailed statistics on your coding speed, accuracy, and problem-solving abilities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Multi-language Support</h3>
            <p>Code in your preferred language with support for JavaScript, Python, Java, C++, and many more.</p>
          </div>
        </div>
      </section>

      <section id="demo" className="demo-section">
        <h2>Try It Out</h2>
        <p className="demo-intro">Experience the ByteClub coding environment with this interactive demo</p>
        <div className="demo-cta">
          <Link to="/code-editor" className="primary-button">Launch Demo Editor</Link>
        </div>
      </section>

      <section id="auth" className="auth-section">
        <div className="auth-container">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Log In
            </button>
            <button 
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>
          
          <div className="auth-form-container">
            {activeTab === 'login' ? (
              <form className="auth-form login-form">
                <div className="form-group">
                  <label htmlFor="login-email">Email</label>
                  <input type="email" id="login-email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <input type="password" id="login-password" required />
                </div>
                <div className="form-footer">
                  <a href="#" className="forgot-password">Forgot Password?</a>
                  <button type="submit" className="auth-button">Log In</button>
                </div>
              </form>
            ) : (
              <form className="auth-form signup-form">
                <div className="form-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <input type="text" id="signup-name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="signup-email">Email</label>
                  <input type="email" id="signup-email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="signup-password">Password</label>
                  <input type="password" id="signup-password" required />
                </div>
                <div className="form-group">
                  <label htmlFor="signup-confirm">Confirm Password</label>
                  <input type="password" id="signup-confirm" required />
                </div>
                <div className="form-footer">
                  <button type="submit" className="auth-button">Create Account</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>ByteClub</h2>
            <p>Code. Compete. Conquer.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Platform</h3>
              <ul>
                <li><a href="#">Challenges</a></li>
                <li><a href="#">Competitions</a></li>
                <li><a href="#">Leaderboard</a></li>
                <li><a href="#">Community</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Resources</h3>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ByteClub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}