"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const scenes = {
  intro: $("#intro-scene"),
  guide: $("#guide-scene"),
  destinations: $("#destination-scene"),
  planet: $("#planet-scene")
};
let currentWorld = "mars";
let sectionIndex = 0;
let selectedArtifact = null;
let lastFocusedElement = null;

const artifacts = {
  moon: [
    {
      id: "apollo-lm-descent-stage", name: "Apollo Lunar Module descent stage", kind: "lander",
      mission: "Apollo lunar missions · first landing in 1969",
      history: "Apollo Lunar Modules carried astronauts from lunar orbit to the surface. The descent stage remained on the Moon when the ascent stage departed. Multiple Apollo missions left descent stages at their landing sites.",
      launch: "Apollo 11 launched on 16 July 1969. The lunar module Eagle landed on 20 July 1969. Dates vary by Apollo mission; this record describes the Apollo 11 example.",
      purpose: "The descent stage provided the landing engine, landing legs and equipment needed to deliver the crew safely to the lunar surface.",
      status: "The Apollo 11 descent stage was left on the Moon as part of the mission design. This was intentional, not a failed landing. Its present physical condition is not continuously monitored.",
      sources: [
        {label:"NASA: Apollo 11 mission overview", url:"https://www.nasa.gov/missions/apollo/apollo-11-mission-overview/"},
        {label:"NASA: Apollo 11 lunar surface journal", url:"https://www.nasa.gov/history/alsj/a11/a11.html"}
      ]
    },
    {
      id: "luna-16", name: "Luna 16 descent stage", kind: "lander",
      mission: "Luna 16 · 1970 · Soviet Union",
      history: "Luna 16 was an uncrewed Soviet mission that collected lunar soil and returned a sample to Earth. Its descent stage remained on the lunar surface after the return vehicle departed.",
      launch: "Launched 12 September 1970; landed on the Moon on 20 September 1970. The sample-return capsule reached Earth on 24 September 1970.",
      purpose: "The mission demonstrated robotic lunar sample collection and return without a crewed landing.",
      status: "The descent stage was left on the lunar surface as part of the mission design. It was a Soviet spacecraft, not a NASA vehicle; it is included to give context to the wider history of lunar artifacts.",
      sources: [
        {label:"NASA NSSDCA: Luna 16", url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-072A"}
      ]
    },
    {
      id: "apollo-lrv", name: "Lunar Roving Vehicle", kind: "rover",
      mission: "Apollo 15, 16 and 17 · 1971–1972",
      history: "NASA's battery-powered Lunar Roving Vehicle expanded the distance astronauts could travel during the final three Apollo lunar surface missions. One rover was used on each of Apollo 15, Apollo 16 and Apollo 17.",
      launch: "The rovers travelled to the Moon with their respective Apollo missions: Apollo 15 launched 26 July 1971, Apollo 16 launched 16 April 1972, and Apollo 17 launched 7 December 1972.",
      purpose: "The vehicle transported astronauts and tools, and helped crews collect geological samples across a wider area than walking alone allowed.",
      status: "The rovers were deliberately left at their landing sites when the astronauts returned to lunar orbit. They were not designed to return to Earth.",
      sources: [
        {label:"NASA: Apollo 15 mission overview", url:"https://www.nasa.gov/mission/apollo-15/"},
        {label:"NASA: Apollo Lunar Roving Vehicle", url:"https://www.nasa.gov/centers-and-facilities/marshall/apollo-lunar-roving-vehicle/"}
      ]
    }
  ],
  mars: [
    {
      id: "sojourner", name: "Sojourner rover", kind: "rover",
      mission: "Mars Pathfinder · 1997",
      history: "Sojourner was the small mobile rover deployed by Mars Pathfinder. It examined rocks and soil near the landing site and demonstrated that a lightweight rover could operate on Mars.",
      launch: "Launched 4 December 1996; landed on Mars with Pathfinder on 4 July 1997.",
      purpose: "Sojourner tested rover mobility and studied the composition and properties of Martian rocks and soil near the landing site.",
      status: "The mission's last successful communication with the lander occurred on 27 September 1997. The cause of the final loss of contact was not conclusively established. The rover was left on Mars after the mission ended.",
      sources: [
        {label:"NASA NSSDCA: Mars Pathfinder", url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A"},
        {label:"NASA: Mars Pathfinder mission", url:"https://science.nasa.gov/mission/mars-pathfinder/"}
      ]
    },
    {
      id: "spirit", name: "Spirit rover", kind: "rover",
      mission: "Mars Exploration Rover · MER-A · 2004",
      history: "Spirit was one of NASA's twin Mars Exploration Rovers. It investigated rocks, soil and geological features at Gusev Crater, returning evidence about the planet's past environments.",
      launch: "Launched 10 June 2003; landed in Gusev Crater on 4 January 2004 UTC.",
      purpose: "Spirit searched for geological evidence of past water activity and studied the composition and history of the Martian surface.",
      status: "Spirit became stuck in soft soil in 2009 and could not be repositioned to survive the following winter. NASA ended attempts to contact it in 2011. The rover remains on Mars.",
      sources: [
        {label:"NASA: Spirit rover", url:"https://science.nasa.gov/mission/mer-spirit/"},
        {label:"NASA JPL: Mars Exploration Rover mission", url:"https://mars.nasa.gov/mer/"}
      ]
    },
    {
      id: "insight", name: "InSight lander", kind: "lander",
      mission: "Interior Exploration using Seismic Investigations, Geodesy and Heat Transport · 2018",
      history: "InSight studied the deep interior of Mars. Its seismometer recorded marsquakes and meteorite impacts, helping researchers investigate the planet's crust, mantle and core.",
      launch: "Launched 5 May 2018; landed on Mars on 26 November 2018.",
      purpose: "The stationary lander investigated Martian internal structure and heat flow, and measured seismic activity.",
      status: "Dust accumulation reduced power from the lander's solar panels. NASA declared the mission ended in December 2022 after repeated attempts to contact the lander failed. It remains on Mars.",
      sources: [
        {label:"NASA: InSight mission", url:"https://science.nasa.gov/mission/insight/"},
        {label:"NASA: InSight mission comes to an end", url:"https://www.nasa.gov/news-release/nasas-insight-mars-lander-mission-comes-to-an-end/"}
      ]
    }
  ]
};

function showScene(name) {
  Object.entries(scenes).forEach(([key, element]) => {
    element.classList.toggle("hidden", key !== name);
    if (key === name) {
      element.classList.remove("is-entering");
      void element.offsetWidth;
      element.classList.add("is-entering");
    }
  });
  closeArtifact(false);
  window.scrollTo({top: 0, behavior: "smooth"});
}
function beginGuide() {
  showScene("guide");
}
function showDestinations() {
  showScene("destinations");
}
function enterWorld(world) {
  currentWorld = world;
  sectionIndex = 0;
  const planetScene = scenes.planet;
  planetScene.classList.toggle("moon-terrain", world === "moon");
  planetScene.classList.toggle("mars-terrain", world === "mars");
  $("#planet-title").textContent = world === "moon" ? "THE MOON" : "MARS";
  $("#landscape").classList.toggle("moon-terrain", world === "moon");
  $("#landscape").classList.toggle("mars-terrain", world === "mars");
  $("#guide-tip-text").textContent = world === "moon"
    ? "The Moon preserves hardware from human and robotic missions. Select an exhibit to investigate it."
    : "Mars holds the remains of robotic explorers. Select an exhibit to investigate its mission.";
  renderArtifacts();
  showScene("planet");
}
function renderArtifacts() {
  const list = artifacts[currentWorld];
  const track = $("#artifact-track");
  track.innerHTML = "";
  list.forEach((artifact, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "artifact-marker";
    button.setAttribute("aria-label", "Investigate " + artifact.name);
    button.innerHTML = drawingFor(artifact.kind) + '<span class="artifact-label"></span>';
    $(".artifact-label", button).textContent = artifact.name;
    button.addEventListener("click", () => openArtifact(artifact, button));
    track.appendChild(button);
  });
  updateLandscapePosition();
}
function drawingFor(kind) {
  if (kind === "rover") return '<span class="artifact-drawing rover-drawing" aria-hidden="true"><span class="rover-mast"></span><span class="rover-camera"></span></span>';
  if (kind === "lander") return '<span class="artifact-drawing lander-drawing" aria-hidden="true"><span class="lander-antenna"></span></span>';
  return '<span class="artifact-drawing instrument-drawing" aria-hidden="true"><span class="instrument-top"></span></span>';
}
function updateLandscapePosition() {
  const track = $("#artifact-track");
  const markers = $$(".artifact-marker", track);
  const maxIndex = Math.max(0, markers.length - 1);
  sectionIndex = Math.max(0, Math.min(sectionIndex, maxIndex));
  const marker = markers[sectionIndex];
  if (marker) {
    const trackWidth = track.parentElement.clientWidth;
    const markerCenter = marker.offsetLeft + marker.offsetWidth / 2;
    const maxTranslate = Math.max(0, track.scrollWidth - trackWidth);
    const translate = Math.max(0, Math.min(maxTranslate, markerCenter - trackWidth / 2));
    track.style.transform = 'translateX(' + (-translate) + 'px)';
  }
  $("#world-progress").textContent = "EXHIBIT " + String(sectionIndex + 1).padStart(2, "0") + " / " + String(markers.length).padStart(2, "0");
  $("#move-left").disabled = sectionIndex === 0;
  $("#move-right").disabled = sectionIndex === maxIndex;
  $("#move-left").style.opacity = sectionIndex === 0 ? ".45" : "1";
  $("#move-right").style.opacity = sectionIndex === maxIndex ? ".45" : "1";
}
function moveSection(delta) {
  const max = artifacts[currentWorld].length - 1;
  sectionIndex = Math.max(0, Math.min(max, sectionIndex + delta));
  updateLandscapePosition();
  const item = artifacts[currentWorld][sectionIndex];
  $("#guide-tip-text").textContent = "Nearby exhibit: " + item.name + ". Select it to read the research record.";
}
function openArtifact(artifact, trigger) {
  selectedArtifact = artifact;
  lastFocusedElement = trigger || document.activeElement;
  $("#object-kicker").textContent = (currentWorld === "moon" ? "LUNAR" : "MARTIAN") + " ARTIFACT RECORD";
  $("#object-name").textContent = artifact.name;
  $("#object-mission").textContent = artifact.mission;
  $$(".object-tab").forEach((tab) => {
    const active = tab.dataset.tab === "history";
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  renderTab("history");
  const sources = $("#object-sources");
  sources.innerHTML = "";
  artifact.sources.forEach((source) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.label;
    li.appendChild(link);
    sources.appendChild(li);
  });
  $("#object-panel").classList.remove("hidden");
  $("#close-object").focus();
  $("#guide-tip-text").textContent = "You're investigating " + artifact.name + ". Check the source links as you read.";
}
function renderTab(tabName) {
  if (!selectedArtifact) return;
  const map = {
    history: ["HISTORY", selectedArtifact.history],
    timeline: ["LAUNCH AND ARRIVAL", selectedArtifact.launch],
    purpose: ["MISSION PURPOSE", selectedArtifact.purpose],
    status: ["DOCUMENTED OUTCOME", selectedArtifact.status]
  };
  const [label, text] = map[tabName];
  const content = $("#object-content");
  content.replaceChildren();
  const heading = document.createElement("span");
  heading.className = "data-label";
  heading.textContent = label;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  content.append(heading, paragraph);
}
function closeArtifact(restoreFocus = true) {
  const panel = $("#object-panel");
  if (!panel || panel.classList.contains("hidden")) return;
  panel.classList.add("hidden");
  if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
}
const scrollProgress = document.createElement("div");
scrollProgress.id = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.appendChild(scrollProgress);
window.addEventListener("scroll", () => {
  if (!CSS.supports("animation-timeline: scroll()")) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.transform = "scaleX(" + (maxScroll > 0 ? window.scrollY / maxScroll : 0) + ")";
  }
}, {passive:true});
scenes.intro.classList.add("is-entering");
scenes.intro.classList.add("cutscene-playing");
window.setTimeout(() => scenes.intro.classList.remove("cutscene-playing"), 4300);
window.setTimeout(() => { if (!tourOverlay.classList.contains("hidden")) return; openTour(); }, 4400);

$("#begin-mission").addEventListener("click", beginGuide);
$("#choose-destination").addEventListener("click", showDestinations);
$$(".destination-card").forEach(button => button.addEventListener("click", () => enterWorld(button.dataset.world)));
$("#back-to-doors").addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); showDestinations(); });
$("#back-from-exhibits").addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); showDestinations(); });
$("#move-left").addEventListener("click", () => moveSection(-1));
$("#move-right").addEventListener("click", () => moveSection(1));
$("#close-object").addEventListener("click", () => closeArtifact());
$$(".object-tab").forEach(tab => tab.addEventListener("click", () => {
  $$(".object-tab").forEach(other => {
    const active = other === tab;
    other.classList.toggle("active", active);
    other.setAttribute("aria-selected", String(active));
  });
  renderTab(tab.dataset.tab);
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !tourOverlay.classList.contains("hidden")) { closeTour(); return; }
  if (!scenes.planet.classList.contains("hidden")) {
    if (event.key === "Escape") closeArtifact();
    if ($("#object-panel").classList.contains("hidden") && event.key === "ArrowLeft") moveSection(-1);
    if ($("#object-panel").classList.contains("hidden") && event.key === "ArrowRight") moveSection(1);
  }
});

const tour = [
  {label:"MISSION BRIEFING / 01", title:"Would you like a tour?", description:"Welcome to After Mission. Take this quick guided tour to learn how to explore the museum, choose the Moon or Mars, and investigate the equipment left behind — or skip it and explore freely."},
  {label:"THE GUIDE / 02", title:"Meet Dr. Anubhuti.", description:"Your field scientist introduces the archive and helps you choose a destination. The portrait is the guide character; the site is an independent student project, not an official NASA site."},
  {label:"CHOOSE A WORLD / 03", title:"Pick your landing site.", description:"Open the Moon or Mars archive. Each world has its own landscape and a small set of clickable exhibits."},
  {label:"INVESTIGATE / 04", title:"Click. Explore. Discover.", description:"Select an object in the landscape or use the arrow buttons / keyboard arrows to move between exhibits. Each record has History, Timeline, Purpose, Final Status and primary-source links."}
];
let tourIndex = 0;
const tourOverlay = $("#site-tour");
function renderTour() {
  const step = tour[tourIndex];
  $("#tour-step-label").textContent = step.label;
  $("#tour-title").textContent = step.title;
  $("#tour-description").textContent = step.description;
  $("#tour-progress-fill").style.width = ((tourIndex + 1) / tour.length * 100) + "%";
  $("#tour-back").disabled = tourIndex === 0;
  $("#tour-back").style.opacity = tourIndex === 0 ? ".45" : "1";
  $("#tour-next").textContent = tourIndex === tour.length - 1 ? "FINISH ✓" : "NEXT →";
}
function openTour() {
  tourIndex = 0;
  renderTour();
  tourOverlay.classList.remove("hidden");
  $("#tour-next").focus();
}
function closeTour() {
  tourOverlay.classList.add("hidden");
  $("#open-tour").focus();
}
$("#open-tour").addEventListener("click", openTour);
$("#close-tour").addEventListener("click", closeTour);
$("#tour-skip").addEventListener("click", closeTour);
$("#tour-back").addEventListener("click", () => { if (tourIndex > 0) tourIndex--; renderTour(); });
$("#tour-next").addEventListener("click", () => {
  if (tourIndex < tour.length - 1) { tourIndex++; renderTour(); }
  else closeTour();
});
tourOverlay.addEventListener("click", event => { if (event.target === tourOverlay) closeTour(); });

window.addEventListener("resize", () => {
  if (!scenes.planet.classList.contains("hidden")) updateLandscapePosition();
});
