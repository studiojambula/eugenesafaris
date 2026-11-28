// ── Config ─────────────────────────────────────────────────────
const LAT = -24.99;
const LON = 31.59;
const TIMEZONE = "Africa/Johannesburg"; // Kruger's "today", not the visitor's
const CACHE_KEY = "kruger-weather-v2";
const CACHE_MS = 15 * 60 * 1000;
const TIMEOUT_MS = 8000;

const API_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
  `&timezone=${encodeURIComponent(TIMEZONE)}&forecast_days=7`;

const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "sunny", accent: "amber" },
  1: { label: "Mostly clear", icon: "sunny", accent: "amber" },
  2: { label: "Partly cloudy", icon: "cloud", accent: "slate" },
  3: { label: "Overcast", icon: "cloud", accent: "slate" },
  45: { label: "Fog", icon: "cloud", accent: "slate" },
  48: { label: "Fog", icon: "cloud", accent: "slate" },
  51: { label: "Light drizzle", icon: "rain", accent: "sky" },
  53: { label: "Drizzle", icon: "rain", accent: "sky" },
  55: { label: "Heavy drizzle", icon: "rain", accent: "sky" },
  61: { label: "Light rain", icon: "rain", accent: "sky" },
  63: { label: "Rain", icon: "rain", accent: "sky" },
  65: { label: "Heavy rain", icon: "rain", accent: "sky" },
  80: { label: "Rain showers", icon: "rain", accent: "sky" },
  81: { label: "Rain showers", icon: "rain", accent: "sky" },
  82: { label: "Violent showers", icon: "rain", accent: "sky" },
  95: { label: "Thunderstorm", icon: "storm", accent: "violet" },
  96: { label: "Storm with hail", icon: "storm", accent: "violet" },
  99: { label: "Storm with hail", icon: "storm", accent: "violet" },
};
const FALLBACK = { label: "—", icon: "cloud", accent: "slate" };

// Full class names must appear literally so Tailwind can detect them.
const ACCENTS = {
  amber: {
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    text: "text-amber-600",
    iconWrap: "bg-amber-100 text-amber-500",
    glow: "bg-amber-200/50",
  },
  slate: {
    bg: "bg-slate-50",
    ring: "ring-slate-200",
    text: "text-slate-500",
    iconWrap: "bg-slate-100 text-slate-400",
    glow: "bg-slate-300/50",
  },
  sky: {
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    text: "text-sky-600",
    iconWrap: "bg-sky-100 text-sky-500",
    glow: "bg-sky-200/50",
  },
  violet: {
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    text: "text-violet-600",
    iconWrap: "bg-violet-100 text-violet-500",
    glow: "bg-violet-200/50",
  },
  indigo: {
    bg: "bg-indigo-50",
    ring: "ring-indigo-200",
    text: "text-indigo-600",
    iconWrap: "bg-indigo-100 text-indigo-500",
    glow: "bg-indigo-200/50",
  },
};

// ── Icons ──────────────────────────────────────────────────────
const CLOUD_PATH = (y) => `M6.5 ${y}a3.8 3.8 0 0 1-.5-7.56 4.8 4.8 0 0 1 9.2-1.8A4.3 4.3 0 0 1 16.5 ${y}h-10Z`;

function weatherIcon(kind) {
  const open = (cls) =>
    `<svg viewBox="0 0 24 24" class="${cls} h-8 w-8" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">`;

  switch (kind) {
    case "sunny":
      return `${open("icon-sunny")}
        <circle class="sun-body" cx="12" cy="12" r="4.2" fill="currentColor" stroke="none"/>
        <g class="sun-body">
          <line x1="12" y1="2.5" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="21.5"/>
          <line x1="2.5" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="21.5" y2="12"/>
          <line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/>
          <line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/>
        </g></svg>`;
    case "moon":
      return `${open("icon-moon")}
        <path class="moon-body" d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" fill="currentColor" fill-opacity="0.25"/></svg>`;
    case "cloud":
      return `${open("icon-cloud")}
        <path class="cloud-back" d="M7 17.5a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.6-1.9A4.5 4.5 0 0 1 17.5 17.5H7Z" fill="currentColor" fill-opacity="0.15"/>
        <path d="M7 17.5a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.6-1.9A4.5 4.5 0 0 1 17.5 17.5H7Z"/></svg>`;
    case "rain":
      return `${open("icon-rain")}
        <path d="${CLOUD_PATH(14.5)}" fill="currentColor" fill-opacity="0.15"/>
        <path d="${CLOUD_PATH(14.5)}"/>
        <line class="drop" x1="8.5" y1="17" x2="8" y2="19.2"/>
        <line class="drop" x1="12" y1="17" x2="11.5" y2="19.2"/>
        <line class="drop" x1="15.5" y1="17" x2="15" y2="19.2"/></svg>`;
    case "storm":
      return `${open("icon-storm")}
        <path d="${CLOUD_PATH(13)}" fill="currentColor" fill-opacity="0.15"/>
        <path d="${CLOUD_PATH(13)}"/>
        <polygon class="bolt" points="12.5,14 9.5,18.5 11.5,18.5 10.5,22 14.5,16.5 12.3,16.5" fill="currentColor" stroke="none"/></svg>`;
    default:
      return "";
  }
}

// ── Helpers ────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);

// "2026-11-28" -> local Date for that calendar day (avoids the UTC parse shift)
function parseDay(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDay(str) {
  return parseDay(str).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function infoFor(code) {
  return WEATHER_CODES[code] ?? FALLBACK;
}

// ── Data (single request, cached) ──────────────────────────────
function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { time, data } = JSON.parse(raw);
    return Date.now() - time < CACHE_MS ? data : null;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
  } catch {
    /* storage unavailable – ignore */
  }
}

async function fetchWeather() {
  const cached = readCache();
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`Weather API responded ${res.status}`);
    const data = await res.json();
    if (!data?.daily?.time || !data?.current) throw new Error("Unexpected weather payload");
    writeCache(data);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// ── Forecast carousel ──────────────────────────────────────────
function skeletonCards(container, count = 7) {
  container.setAttribute("aria-busy", "true");
  container.innerHTML = Array.from(
    { length: count },
    () => `
    <div class="min-w-[140px] snap-start animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div class="mx-auto h-3 w-14 rounded bg-gray-200"></div>
      <div class="mx-auto my-4 h-8 w-8 rounded-full bg-gray-200"></div>
      <div class="mx-auto h-7 w-10 rounded bg-gray-200"></div>
      <div class="mx-auto mt-3 h-3 w-16 rounded bg-gray-200"></div>
      <div class="mt-4 border-t border-gray-100 pt-3">
        <div class="mx-auto h-2.5 w-12 rounded bg-gray-200"></div>
      </div>
    </div>`,
  ).join("");
}

function renderCards(container, data) {
  const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = data.daily;
  const todayKey = data.current.time.slice(0, 10); // Kruger's date

  container.setAttribute("aria-busy", "false");
  container.innerHTML = time
    .map((day, i) => {
      const isToday = day === todayKey;
      const info = infoFor(weather_code[i]);
      const p = ACCENTS[info.accent];
      const high = Math.round(temperature_2m_max[i]);
      const low = Math.round(temperature_2m_min[i]);
      const rain = precipitation_probability_max?.[i];
      const name = isToday ? "Today" : formatDay(day);

      return `
      <article
        role="listitem"
        aria-label="${name}: ${info.label}, high ${high} degrees, low ${low} degrees"
        class="min-w-[140px] snap-start rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          isToday ? `${p.bg} border-transparent ring-2 ${p.ring}` : "border-gray-200 bg-white"
        }">
        <p class="text-center text-sm font-medium ${isToday ? p.text : "text-gray-500"}">${name}</p>
        <div class="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full ${p.iconWrap}">
          ${weatherIcon(info.icon)}
        </div>
        <p class="text-center text-4xl font-bold tabular-nums text-gray-900">${high}°</p>
        <p class="mt-1 text-center text-sm text-gray-500">${info.label}</p>
        <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span class="text-sky-500">Low ${low}°</span>
          ${rain != null ? `<span class="text-gray-500">Rain ${Math.round(rain)}%</span>` : ""}
        </div>
      </article>`;
    })
    .join("");
}

// ── Hero "today" card ──────────────────────────────────────────
function renderToday(data) {
  const c = data.current;
  const d = data.daily;
  let info = infoFor(c.weather_code);
  if (info.icon === "sunny" && c.is_day === 0) info = { label: "Clear night", icon: "moon", accent: "indigo" };
  const p = ACCENTS[info.accent];

  $("#today-date").textContent = parseDay(c.time.slice(0, 10)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  $("#today-temp").textContent = `${Math.round(c.temperature_2m)}°C`;
  $("#today-label").textContent = info.label;
  $("#today-feels").textContent = `${Math.round(c.apparent_temperature)}°`;
  $("#today-humidity").textContent = `${Math.round(c.relative_humidity_2m)}%`;
  $("#today-hilo").textContent = `${Math.round(d.temperature_2m_max[0])}°/${Math.round(d.temperature_2m_min[0])}°`;
  $("#today-icon").innerHTML = weatherIcon(info.icon);
  $("#today-icon-wrap").className = `flex size-14 shrink-0 items-center justify-center rounded-2xl ${p.iconWrap}`;
  $("#today-glow").className =
    `glow pointer-events-none absolute -right-8 -top-8 size-28 rounded-full ${p.glow} blur-2xl`;
}

// ── Init ───────────────────────────────────────────────────────
async function initWeather() {
  const carousel = $("#weather-carousel");
  const todayCard = $("#today-card");
  if (!carousel && !todayCard) return; // not a weather page – do nothing

  const errorBox = $("#weather-error");
  const retryBtn = $("#weather-retry");

  const showError = (on) => {
    if (!errorBox) return;
    errorBox.classList.toggle("hidden", !on);
    errorBox.classList.toggle("flex", on);
  };

  async function load() {
    showError(false);
    if (carousel) skeletonCards(carousel);
    try {
      const data = await fetchWeather();
      if (carousel) renderCards(carousel, data);
      if (todayCard) renderToday(data);
    } catch (err) {
      console.warn("[weather]", err);
      if (carousel) carousel.innerHTML = "";
      const label = $("#today-label");
      if (label) label.textContent = "Unavailable";
      showError(true);
    }
  }

  retryBtn?.addEventListener("click", load);
  load();
}

initWeather();
