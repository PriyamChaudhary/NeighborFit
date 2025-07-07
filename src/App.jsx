import React, { useState } from "react";
import "./App.css";
import { FaCoffee, FaSchool, FaParking, FaBus, FaStar, FaMapMarkerAlt } from "react-icons/fa";

const features = [
  { icon: <FaCoffee className="text-2xl text-amber-500" />, label: "Cafés & Dining" },
  { icon: <FaSchool className="text-2xl text-emerald-500" />, label: "Schools" },
  { icon: <FaParking className="text-2xl text-blue-500" />, label: "Parking" },
  { icon: <FaBus className="text-2xl text-purple-500" />, label: "Public Transit" },
];

const questions = [
  { key: "transport", text: "How important is transport accessibility?", desc: "Rate from 1-10 to help us find the perfect match", min: 1, max: 10, type: 'slider', left: "Not Important", right: "Very Important" },
  { key: "safety", text: "How important is safety?", desc: "Rate from 1-10 to help us find the perfect match", min: 1, max: 10, type: 'slider', left: "Not Important", right: "Very Important" },
  { key: "noise", text: "Preferred noise level?", desc: "Rate from 1 (quiet) to 10 (very noisy)", min: 1, max: 10, type: 'slider', left: "Quiet", right: "Noisy" },
  { key: "airQuality", text: "Preferred air quality index", desc: "Lower is better (40-70)", min: 40, max: 70, type: 'slider', left: "Poor", right: "Excellent" },
  { key: "rent", text: "Maximum rent (INR)", desc: "Leave blank if not important", min: 0, max: 50000, type: 'number' },
];

function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(questions[0].min);
  const [error, setError] = useState("");

  // For custom slider fill color
  const getSliderBackground = (min, max, value) => {
    const percent = ((value - min) * 100) / (max - min);
    // Use blue for filled, and light blue for unfilled
    return {
      background: `linear-gradient(90deg, #2196f3 ${percent}%, #e3f2fd ${percent}%)`
    };
  };

  const handleAnswer = () => {
    const q = questions[step];
    let value = inputValue;
    if (q.type === 'number') {
      value = value === "" ? null : Number(value);
    } else if (q.type === 'slider') {
      value = Number(value);
    }
    setAnswers((prev) => ({
      ...prev,
      [q.key]: value,
    }));
    setInputValue(questions[step + 1]?.min ?? "");
    setStep((prev) => prev + 1);
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setMatches(null);
    setInputValue(questions[0].min);
    setError("");
  };

  React.useEffect(() => {
    if (step === questions.length && Object.keys(answers).length === questions.length) {
      setLoading(true);
      setError("");
      fetch("http://localhost:3001/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Server error");
          return res.json();
        })
        .then((data) => {
          setMatches(data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Could not fetch matches. Please try again later.");
          setLoading(false);
        });
    }
  }, [step, answers]);

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Header */}
      <header className="header-container">
        <div className="flex items-center gap-4 mb-3">
          <div className="logo-container">
            <FaMapMarkerAlt className="text-3xl text-white" />
          </div>
          <h1 className="app-title">NeighborFit</h1>
        </div>
        <p className="app-subtitle">Find your perfect neighborhood match</p>
        <div className="header-divider"></div>
      </header>

      {/* Main Content */}
      <div className="main-content-center">
        <div className="app-card">
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {/* Feature/category icons */}
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon-container">{f.icon}</div>
                <span className="feature-label">{f.label}</span>
              </div>
            ))}
          </div>

          {matches ? (
            matches.length > 0 ? (
              <div className="results-container">
                <h2 className="results-title">Your Perfect Matches</h2>
                <div className="matches-grid">
                  {matches.map((n, i) => (
                    <div
                      key={i}
                      className="result-card"
                      style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                    >
                      <div className="result-header">
                        <h3 className="result-name">{n.name}</h3>
                        <div className="result-rating">
                          <FaStar className="text-amber-400" />
                          <span>{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="result-details">
                        <div className="detail-item">
                          <span className="detail-label">Type:</span>
                          <span className="detail-value">{n.type}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Distance:</span>
                          <span className="detail-value">{n.distance_km} km</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Transport:</span>
                          <span className="detail-value">{n.transport}/10</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Safety:</span>
                          <span className="detail-value">{n.safety}/10</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Noise:</span>
                          <span className="detail-value">{n.noise}/10</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Air Quality:</span>
                          <span className="detail-value">{n.airQuality}</span>
                        </div>
                        {n.rent && (
                          <div className="detail-item rent-item">
                            <span className="detail-label">Rent:</span>
                            <span className="detail-value rent-value">₹{n.rent.toLocaleString()}/month</span>
                          </div>
                        )}
                      </div>
                      
                      <button className="explore-btn">
                        Explore Neighborhood
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleRestart} className="restart-btn">
                  Find Different Neighborhoods
                </button>
              </div>
            ) : (
              <div className="no-matches">
                <div className="no-matches-icon">🏠</div>
                <h3>No matches found</h3>
                <p>Try adjusting your preferences to find more options</p>
                <button onClick={handleRestart} className="restart-btn">
                  Try Again
                </button>
              </div>
            )
          ) : loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h3>Finding Your Perfect Match</h3>
              <p>Analyzing neighborhoods based on your preferences...</p>
            </div>
          ) : (
            step < questions.length ? (
              <div className="question-container">
                <div className="question-content">
                  <div className="question-header">
                    <h2 className="question-title">{questions[step].text}</h2>
                    <p className="question-desc">{questions[step].desc}</p>
                  </div>
                  {questions[step].type === 'slider' ? (
                    <div className="slider-container">
                      <div className="slider-labels">
                        <span>{questions[step].left}</span>
                        <span>{questions[step].right}</span>
                      </div>
                      <div className="slider-wrapper">
                        <input
                          type="range"
                          min={questions[step].min}
                          max={questions[step].max}
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          className="custom-slider"
                          style={getSliderBackground(questions[step].min, questions[step].max, inputValue)}
                        />
                      </div>
                      <div className="slider-value">
                        {inputValue}{questions[step].max <= 10 ? `/${questions[step].max}` : ""}
                      </div>
                    </div>
                  ) : (
                    <div className="number-input-container">
                      <input
                        type="number"
                        min={questions[step].min}
                        max={questions[step].max}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder={`Enter amount (${questions[step].min} - ${questions[step].max})`}
                        className="number-input"
                      />
                      <p className="input-hint">Leave empty if rent is not a factor</p>
                    </div>
                  )}
                  <div className="question-actions">
                    <button
                      onClick={handleAnswer}
                      className="next-btn"
                      disabled={questions[step].type === 'slider' ? false : (questions[step].key !== 'rent' && inputValue === "")}
                    >
                      {step === questions.length - 1 ? "Find Matches" : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-container">
        <p>&copy; {new Date().getFullYear()} NeighborFit. Helping you find the perfect neighborhood match.</p>
      </footer>
    </div>
  );
}

export default App;