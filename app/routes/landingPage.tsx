// app/routes/_index.tsx
import { ActionFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import "../stylesheets/landing.css";
import DatabaseConnectionService from "~/database/connection/DatabaseConnectionService";

export const meta: MetaFunction = () => {
  return [
    { title: "ByteClub - Competitive/Collaborative Coding Platform" },
    { name: "description", content: "Challenge other developers in real-time coding battles or try our cooperative mode to code together" },
  ];
};

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");

  const databaseConnectionService = DatabaseConnectionService.getInstance();
  const knexConnection = databaseConnectionService.getDatabaseConnection();

  const previousSignupCount = await knexConnection('newsletter_signup').count().where('email', email).then((data) => {return data[0].count});
  
  if (Number(previousSignupCount) > 0) {
    return Response.json({message: "You are already signed up for the newsletter"})
  } 

  const addToNewsletterResult = await knexConnection('newsletter_signup').insert([{name:name, email:email}])

  console.log(addToNewsletterResult)
  return Response.json({message: "You have been added to the newsletter list!"})
}

export default function LandingPage() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const [formToastVisible, setFormToastVisible] = useState(false);

  // useEffect(()=> {
  //   if (actionData) {
  //     setFormToastVisible(true);
  //   } else {
  //     setFormToastVisible(false);
  //   }
  //   console.log(actionData);
  // });

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
          </ul>
        </nav>
      </header>

      <section className="hero-section hero-tile">
        <div className="hero-content">
          <h2>Challenge Your Coding Skills</h2>
          <p>Compete head-to-head with other developers in real-time coding battles</p>
          <div className="hero-buttons">
            <a href="#demo" className="primary-button">Try Demo</a>
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

      <section id="about" className="about-section hero-tile">
        <h2>About ByteClub</h2>
        <div className="about-content">
          <div className="about-text">
            <p>ByteClub is the ultimate platform for developers who thrive on competition and want to sharpen their coding skills against real opponents.</p>
            <p>Founded by a team of passionate software engineers, ByteClub was created to make competitive programming more engaging and social. Our platform offers real-time competitions, leaderboards, and a community of like-minded developers.</p>
            <p>Whether you're preparing for technical interviews or just enjoy the thrill of solving problems under pressure, ByteClub is your digital arena for code battles.</p>
          </div>
          <div className="about-stats">
            <div className="stat-box hero-tile">
              <span className="stat-number">100+</span>
              <span className="stat-label">Coding Challenges</span>
            </div>
            <div className="stat-box hero-tile">
              <span className="stat-number">12+</span>
              <span className="stat-label">Programming Languages</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section hero-tile">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card hero-tile">
            <div className="feature-icon">🎮</div>
            <h3>Real-time Competitions</h3>
            <p>Challenge your friends or get matched with opponents of similar skill level for head-to-head coding battles.</p>
          </div>
          <div className="feature-card hero-tile">
            <div className="feature-icon">🏆</div>
            <h3>Global Leaderboard</h3>
            <p>Climb the ranks and establish yourself as a top coder in our global community.</p>
          </div>
          <div className="feature-card hero-tile">
            <div className="feature-icon">📊</div>
            <h3>Performance Metrics</h3>
            <p>Track your progress with detailed statistics on your coding speed, accuracy, and problem-solving abilities.</p>
          </div>
          <div className="feature-card hero-tile">
            <div className="feature-icon">💻</div>
            <h3>Multi-language Support</h3>
            <p>Code in your preferred language with support for JavaScript, Python, Java, C++, and many more.</p>
          </div>
        </div>
      </section>

      <section id="demo" className="demo-section hero-tile">
        <h2>Try It Out</h2>
        <p className="demo-intro">Experience the ByteClub coding environment with this interactive demo</p>
        <div className="demo-cta">
          <Link to="/" className="primary-button">Launch Demo Editor</Link>
        </div>
      </section>

      <section id="auth" className="auth-section">
        <div className="auth-container hero-tile">
          <div className="auth-form-container">
            <Form className="auth-form signup-form" action="/landingPage" method="post">
              <div>Sign up to get up to date information on ByteClub!</div>
              <div className="form-group">
                <label htmlFor="signup-name">Name</label>
                <input type="text" id="signup-name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input type="email" id="signup-email" name="email" required />
              </div>
              <div>
                {actionData ? actionData.message : ""}
              </div>
              <div className="form-footer">
                <button disabled={navigation.state === 'submitting'} type="submit" className="auth-button">Sign Up For Newsletter</button>
              </div>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}