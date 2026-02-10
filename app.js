// Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const viewNameEl = document.getElementById('current-view-name');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.getAttribute('data-target');
    const label = item.querySelector('span').textContent;
    
    // Update Nav
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Update Breadcrumb
    if (viewNameEl) viewNameEl.textContent = label;
    
    // Update Views
    views.forEach(v => {
      v.classList.remove('active');
      if (v.id === target) v.classList.add('active');
    });
  });
});

// Score Configuration
const scoreConfig = [
  { key: "bill", label: "Bill Payments", max: 200 },
  { key: "traffic", label: "Traffic Compliance", max: 200 },
  { key: "social", label: "Social Participation", max: 200 },
  { key: "volunteer", label: "Volunteering", max: 150 },
  { key: "environment", label: "Environmental Contribution", max: 150 },
  { key: "community", label: "Religious and Community Contribution", max: 100 }
];

const sourceOrder = ["ekyc", "utilities", "traffic", "municipal", "ngo"];
const sourceMeta = {
  ekyc: "Aadhaar eKYC API",
  utilities: "Electricity and Water APIs",
  traffic: "RTO and Traffic Police APIs",
  municipal: "Municipal and Swachh Bharat APIs",
  ngo: "NGO and CSR APIs"
};

// UI Elements
const runBtn = document.getElementById("run-fetch");
const progressEl = document.getElementById("fetch-progress");
const benefitBandEl = document.getElementById("benefit-band");
const citizenTierEl = document.getElementById("citizen-tier");

let isRunning = false;

// Helpers
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function hashSeed(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) + 1;
}

function randomFromSeed(seed, shift) {
  const x = Math.sin(seed + shift * 57.13) * 10000;
  return x - Math.floor(x);
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function updateProgress(percent) {
  progressEl.style.width = `${percent}%`;
}

function setRingProgress(id, percentage, value) {
  const ring = document.getElementById(id);
  const valEl = document.getElementById(id + '-val');
  if (ring) ring.style.setProperty('--progress', clamp(percentage, 0, 100));
  if (valEl) valEl.textContent = value;
}

// Logic
async function runDemo() {
  if (isRunning) return;
  isRunning = true;
  runBtn.disabled = true;
  runBtn.textContent = "Processing Records...";

  const name = document.getElementById("citizen-name").value || "Citizen";
  const cibilInput = parseInt(document.getElementById("cibil-input").value) || 742;
  const seed = hashSeed(name + Date.now());

  // Reset UI
  updateProgress(0);
  document.querySelectorAll('.source-item').forEach(el => el.className = 'source-item');
  document.querySelectorAll('.status-dot').forEach(el => el.className = 'status-dot');

  for (let i = 0; i < sourceOrder.length; i++) {
    const key = sourceOrder[i];
    const item = document.querySelector(`[data-source="${key}"]`);
    const dot = item.querySelector('.status-dot');
    
    item.classList.add('in-progress');
    dot.classList.add('active');
    
    await sleep(600 + Math.random() * 400);
    
    item.classList.remove('in-progress');
    item.classList.add('done');
    dot.classList.remove('active');
    dot.classList.add('done');
    
    updateProgress(((i + 1) / sourceOrder.length) * 100);
  }

  // Calculate Scores
  const bill = clamp(Math.round(150 + randomFromSeed(seed, 1) * 50), 0, 200);
  const traffic = clamp(Math.round(140 + randomFromSeed(seed, 2) * 60), 0, 200);
  const social = clamp(Math.round(120 + randomFromSeed(seed, 3) * 80), 0, 200);
  const volunteer = clamp(Math.round(80 + randomFromSeed(seed, 4) * 70), 0, 150);
  const environment = clamp(Math.round(90 + randomFromSeed(seed, 5) * 60), 0, 150);
  const community = clamp(Math.round(60 + randomFromSeed(seed, 6) * 40), 0, 100);

  const civic = bill + traffic + social + volunteer + environment + community;
  const normalizedCibil = (cibilInput - 300) / 600;
  const cibilDisplay = Math.round(normalizedCibil * 1000); // Scale to 1000 for consistency
  const combined = Math.round((civic / 1000) * 600 + normalizedCibil * 400);

  // Update Displays
  setRingProgress('civic-ring', (civic / 1000) * 100, civic);
  setRingProgress('cibil-ring', normalizedCibil * 100, cibilDisplay);
  setRingProgress('combined-ring', (combined / 1000) * 100, combined);

  // Update Breakdown
  const scores = { bill, traffic, social, volunteer, environment, community };
  scoreConfig.forEach(item => {
    const val = scores[item.key];
    document.getElementById(`${item.key}-val`).textContent = `${val} / ${item.max}`;
    document.getElementById(`${item.key}-bar`).style.width = `${(val / item.max) * 100}%`;
  });

  // Insights
  const tier = civic > 850 ? "Elite Citizen" : civic > 700 ? "Active Contributor" : "Building Trust";
  citizenTierEl.textContent = tier;
  benefitBandEl.textContent = combined > 800 ? "High Incentives" : "Standard Benefits";
  
  runBtn.disabled = false;
  runBtn.textContent = "Re-Calculate Score";
  isRunning = false;

  // Scroll to results
  setTimeout(() => {
    document.querySelector('.rings-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

runBtn.addEventListener('click', runDemo);
