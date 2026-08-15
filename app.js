
// PAGE 1: mood.html → Save Mood and Energy

function saveMoodEnergy() {
  const mood = document.querySelector('input[name="mood"]:checked')?.value;
  const energy = document.getElementById("energy")?.value;

  if (!mood || !energy) {
    alert("⚠️ Please select both mood and energy level.");
    return;
  }

  localStorage.setItem("mood", mood);
  localStorage.setItem("energy", energy);

  window.location.href = "ques.html";
}


//PAGE 2: ques.html → Save Guided Question Responses

function saveQuestions() {
  const responses = document.querySelectorAll(".quiz input[type='radio']:checked");
  if (responses.length < 10) {
    alert("⚠️ Please answer all questions.");
    return;
  }

  let yesCount = 0;
  responses.forEach(res => {
    if (res.value === "Yes") yesCount++;
  });

  localStorage.setItem("questionScore", yesCount);

  window.location.href = "journal.html";
}

// PAGE 3: journal.html → Analyze Journal Sentiment

function analyzeJournal() {
  const text = document.getElementById("textBox").value.toLowerCase().trim();
  if (!text) {
    alert("⚠️ Please write something in your journal.");
    return;
  }

  // Basic emotion dictionary
  const positive = ["happy", "joy", "love", "grateful", "peace", "calm", "hopeful", "excited", "proud"];
  const negative = ["sad", "depressed", "tired", "angry", "anxious", "lonely", "hopeless", "worried", "fear"];

  let pos = 0, neg = 0;
  text.split(/\s+/).forEach(word => {
    if (positive.includes(word)) pos++;
    if (negative.includes(word)) neg++;
  });

  let sentimentScore = 0.5 + (pos - neg) / (pos + neg + 1);
  sentimentScore = Math.max(0, Math.min(1, sentimentScore));

  localStorage.setItem("sentimentScore", sentimentScore);
localStorage.setItem("journalText", text);

  window.location.href = "dashboard.html";
}


// PAGE 4: dashboard.html → Calculate & Display Emotional Index

function calculateEmotionalIndex() {
  const mood = parseInt(localStorage.getItem("mood")) || 3;
  const energy = parseInt(localStorage.getItem("energy")) || 5;
  const questionScore = parseInt(localStorage.getItem("questionScore")) || 0;
  const sentimentScore = parseFloat(localStorage.getItem("sentimentScore")) || 0.5; 


  // Weighted contributions (research-based)
  const M = mood / 5;
  const E = energy / 10;
  const Q = (10 - questionScore) / 10; 
  const S = sentimentScore; 
  
  const EI = (0.3 * M) + (0.2 * E) + (0.3 * Q) + (0.2 * S);
  localStorage.setItem("emotionalIndex", EI);
  return EI;

}
async function sendToBackend() {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", localStorage.getItem("token"));


  const body = {
    mood: localStorage.getItem("mood"),
    energy: localStorage.getItem("energy"),
    questions: localStorage.getItem("questionScore"),
    journalEntry: localStorage.getItem("journalText"),
    score: localStorage.getItem("emotionalIndex"),
    sentimentScore: localStorage.getItem("sentimentScore")
  };

  await fetch("http://localhost:5050/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
}



function showResults() {
  const EI = calculateEmotionalIndex();
  let level = "";
  let description = "";
  let suggestion = "";
  let color = "";

  if (EI >= 0.75) {
    level = "🌿 Low Depression Risk";
    description = "You’re showing positive emotions and balanced energy. Your current state reflects strong emotional regulation and self-awareness.";
    color = "#2ecc71";
    suggestion = ["✅ Keep up your good mental health habits",
"🧘 Continue journaling and mindfulness routines.",
"🤝 Stay connected with friends or loved ones.",
"🎯 Try small goals that keep your motivation high."];
  } else if (EI >= 0.5) {
    level = "🌤 Mild Depression Risk";
    description = "You’re doing well, but showing signs of occasional stress or fatigue. Your emotions are mostly stable but may fluctuate slightly.";
    suggestion = ["💬 Take short breaks to recharge.",
"🌱 Engage in hobbies that calm you.",
"😌 Practice relaxation or breathing exercises.",
"🕰 Reflect in your journal on triggers and positives."];
    color = "#f1c40f";
  } else if (EI >= 0.25) {
    level = "😐 Moderate Depression Risk ";
    description = "Your responses show persistent anxiety or negative patterns. You may be emotionally drained or struggling with low mood.";
    color = "#e67e22";
    suggestion = ["🌼 Try daily affirmations and structured journaling.",
"🧘 Practice 10–15 min mindfulness sessions.",
"📅 Maintain a consistent sleep schedule.",
"🤗 Consider reaching out to a friend, family member, or counselor"];
  } else {
    level = "🛑 High Depression Risk";
    suggestion = ["❤️ Please prioritize your well-being.",
"📞 Reach out to a mental health helpline or therapist given below",
"🪞Use your journal to express emotions safely.",
"🚶 Engage in gentle self-care like walking or listening to calming music.",
"⚠️ Avoid isolation — seek human connection and professional support."];
    description = "Your emotional patterns reflect deep sadness or significant distress. It may be difficult to maintain motivation or optimism right now.";
    color = "#e74c3c";
  }

  document.getElementById("emotionalIndex").textContent = (EI * 100).toFixed(1);
  document.getElementById("emotionalIndex").style.color = color;
  document.getElementById("emotionalLevel").textContent = level;
  document.getElementById("suggestions").textContent = suggestion.join("\n");
  document.getElementById("description").textContent = description;
  sendToBackend();
}

// Toggle UI
function showLogin() {
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
}

function showSignup() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
}

// EXECUTION LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("http://localhost:5050/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        alert(data.message);

        
        window.location.href = "guest.html";

      } catch (err) {
        console.error("Signup error:", err);
        alert("Registration failed");
      }
    });
  }
});

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://localhost:5050/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    alert("✅ Login successful");

    window.location.href = "guest.html";

  } catch (err) {
    alert("❌ Server not reachable");
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("mood.html")) {
    document.querySelector(".btn-next")?.addEventListener("click", saveMoodEnergy);
  } 
  else if (path.includes("ques.html")) {
    document.getElementById("form-submit")?.addEventListener("click", e => {
      e.preventDefault();
      saveQuestions();
    });
  } 
  else if (path.includes("journal.html")) {
    document.getElementById("text-submit")?.addEventListener("click", e => {
      e.preventDefault();
      analyzeJournal();
    });
  } 
  else if (path.includes("dashboard.html")) {
    showResults();
  }
});