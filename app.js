"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const scenes = {
  intro: $("#intro-scene"),
  guide: $("#guide-scene"),
  destinations: $("#destination-scene"),
  planet: $("#planet-scene"),
  archive: $("#archive-scene"),
  reflection: $("#reflection-scene")
};
let currentWorld = "mars";
let sectionIndex = 0;
let selectedArtifact = null;
let lastFocusedElement = null;
let lastSceneBeforeArchive = "destinations";
let archiveFilter = "all";
let archiveQuery = "";
let archiveMission = "all";
let archiveKind = "all";
let archiveEra = "all";
let archiveStatus = "all";
const discoveredIds = new Set();
try { JSON.parse(localStorage.getItem("aftermission-discovered") || "[]").forEach(id => discoveredIds.add(id)); } catch (_) {}

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
    },
    {id:"apollo-ALSEP",name:"Apollo scientific experiment packages (ALSEP)",kind:"instrument",mission:"Apollo 12, 14, 15, 16 and 17 · 1969–1972",history:"Astronauts deployed instrument suites that measured moonquakes, heat flow, magnetic fields and particles. Cables and stations turned landing sites into remote field laboratories long after crews departed.",launch:"Deployed during Apollo surface EVAs between 1969 and 1972; most arrays operated until 1977.",purpose:"Measure seismic activity, heat flow, magnetic fields and the Moon's interaction with the solar wind.",status:"Stations and cables remain at their deployment sites. The scientific records survive although the instruments no longer transmit.",sources:[{label:"NASA: Apollo Lunar Surface Journal",url:"https://www.nasa.gov/history/alsj/"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"apollo-flags",name:"Apollo flags and flag assemblies",kind:"instrument",mission:"Apollo 11, 12, 14, 15, 16 and 17 · 1969–1972",history:"Each Apollo landing crew planted a flag. Nylon fabric was not designed for the lunar environment; orbital images suggest some flags may have fallen over, while Apollo 11's flag was likely affected by ascent-engine exhaust.",launch:"First planted by Apollo 11 on 20 July 1969; five further Apollo crews planted flags at their landing sites.",purpose:"A symbol of human arrival and a visual marker for the landing missions.",status:"Assemblies were left on the Moon. Their exact present condition is not confirmed for every site.",sources:[{label:"NASA: Apollo lunar surface journal",url:"https://www.nasa.gov/history/alsj/"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"apollo-tools",name:"Geology tools, scoops, rakes and drive tubes",kind:"instrument",mission:"Apollo surface missions · 1969–1972",history:"Hammers, tongs, scoops, rakes and core tubes helped crews collect lunar rocks and soil. Some tools and containers were left behind to save mass for the return journey; the samples brought home are still studied.",launch:"Used during multiple Apollo EVAs; individual tool histories vary by mission.",purpose:"Collect samples that reveal the Moon's volcanic, impact and early solar-system history.",status:"Some tools remain on the surface; returned samples are curated on Earth. Not every tool was discarded.",sources:[{label:"NASA: Spacewalking tools",url:"https://www.nasa.gov/suits-and-rovers/spacewalking-tools/"},{label:"NASA Astromaterials 3D: Apollo lunar collection",url:"https://ares.jsc.nasa.gov/astromaterials3d/apollo-lunar.htm"}]},
    {id:"apollo-plaque",name:"Apollo commemorative plaques",kind:"instrument",mission:"Apollo 11, 12 and 14 · 1969–1971",history:"Small plaques attached to lunar-module landing gear turned machines built for short missions into messages intended to outlast the crews' visits.",launch:"Apollo 11's plaque was left at Tranquility Base in July 1969; Apollo 12 and 14 also left plaques.",purpose:"Commemorate the landings and the people behind them.",status:"The plaques remain on the Moon attached to descent-stage hardware.",sources:[{label:"NASA Science: Apollo 14 plaque",url:"https://science.nasa.gov/resource/plaque-the-apollo-14-crew-will-leave-on-the-moon/"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"lunokhod-1",name:"Lunokhod 1 rover and Luna 17 lander",kind:"rover",mission:"Soviet Luna 17 · 1970",history:"Lunokhod 1 rolled across the Moon for nearly eleven months, sending panoramic images and measurements. Its lander remained after delivering the rover.",launch:"Luna 17 landed on 17 November 1970; Lunokhod 1 operated until September 1971.",purpose:"Remote robotic exploration, imaging and lunar-soil measurements.",status:"Both rover and lander remain on the Moon. Laser ranging later precisely located the rover.",sources:[{label:"NASA NSSDCA: Luna 17",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-095A"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"lunokhod-2",name:"Lunokhod 2 rover and Luna 21 lander",kind:"rover",mission:"Soviet Luna 21 · 1973",history:"Lunokhod 2 traversed the Moon, photographed terrain and measured soil properties. A navigation error in a crater helped end the mission, but its scientific record survived.",launch:"Luna 21 landed on 15 January 1973; Lunokhod 2 travelled about 37 km before operations ended.",purpose:"Robotic surface geology and engineering tests for remote lunar mobility.",status:"The rover and lander remain on the lunar surface; the rover's location is known well enough for laser ranging.",sources:[{label:"NASA NSSDCA: Luna 21",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1973-001A"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"surveyors",name:"Surveyor robotic landers",kind:"lander",mission:"Surveyor 1, 3, 5, 6 and 7 · 1966–1968",history:"Before Apollo, Surveyor landers tested whether the lunar surface could support a spacecraft and returned close-up images and soil measurements. Apollo 12 astronauts later visited Surveyor 3 and recovered components for Earth-based study.",launch:"Five Surveyor spacecraft made successful soft landings between 1966 and 1968.",purpose:"Reconnaissance and engineering data to prepare for crewed lunar landings.",status:"Successful landers remain at their sites, except components of Surveyor 3 recovered by Apollo 12.",sources:[{label:"NASA NSSDCA: Surveyor missions",url:"https://nssdc.gsfc.nasa.gov/planetary/lunar/surveyor.html"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"retroreflectors",name:"Laser retroreflector arrays",kind:"instrument",mission:"Apollo 11, 14 and 15; Soviet Lunokhod missions",history:"Corner-cube reflectors return laser pulses to Earth. These durable scientific instruments allow researchers to measure the Earth–Moon distance with extraordinary precision.",launch:"Apollo 11 deployed the first crewed array in July 1969; Apollo 14 and 15 added more. Soviet rovers carried reflectors too.",purpose:"Precision lunar laser ranging to test gravity and study the Earth–Moon system.",status:"The reflectors are passive and require no power; observations continue when conditions permit.",sources:[{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"apollo-ascent-stages",name:"Apollo lunar-module ascent stages",kind:"lander",mission:"Apollo lunar missions · 1969–1972",history:"After returning crews to lunar orbit, several ascent stages were deliberately directed to impact the Moon, creating signals for seismic experiments. The fate of some stages, including Apollo 11's, is uncertain.",launch:"Flew with Apollo missions; impact outcomes and locations differ by mission.",purpose:"Return crews to orbit; selected stages later served as controlled impactors for lunar seismology.",status:"Some were deliberately crashed after their crew-return role. These should not be confused with descent stages left at landing sites.",sources:[{label:"NASA: Apollo locations and impact sites",url:"https://nssdc.gsfc.nasa.gov/planetary/lunar/apolloloc.html"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]}
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

    {id:"curiosity-edl",name:"Curiosity landing hardware: heat shield, backshell and sky crane",kind:"lander",mission:"Mars Science Laboratory · 2012",history:"Curiosity's arrival left a trail of hardware: a heat shield fell away, parachute and backshell separated, then the rocket-powered sky crane lowered the rover before flying off to crash at a distance.",launch:"Curiosity landed in Gale Crater on 6 August 2012 UTC; orbital images later spotted the separated components.",purpose:"Protect, slow and safely lower a rover through the Martian atmosphere.",status:"The components remain on Mars. Orbital images show the debris field and the blast pattern left by the sky crane.",sources:[{label:"NASA Science: Scene of a Martian landing",url:"https://science.nasa.gov/photojournal/scene-of-a-martian-landing/"},{label:"NASA: Curiosity mission",url:"https://science.nasa.gov/mission/msl-curiosity/"}]},
    {id:"perseverance-edl",name:"Perseverance heat shield, backshell and parachute",kind:"lander",mission:"Mars 2020 · 2021",history:"Perseverance left landing hardware across Jezero Crater. Its parachute and backshell, heat shield and powered descent stage were discarded in sequence so the rover could reach the ground.",launch:"Perseverance landed on 18 February 2021; orbital and rover imagery later documented the landing components.",purpose:"Atmospheric entry, deceleration and precision landing using the sky-crane system.",status:"The components remain on Mars and are documented in the mission's landing record.",sources:[{label:"NASA Science: Perseverance landing components",url:"https://science.nasa.gov/resource/perseverance-and-mars-2020-spacecraft-components-on-the-surface/"},{label:"NASA Science: Images of EDL debris",url:"https://science.nasa.gov/blog/images-of-edl-debris/"}]},
    {id:"ingenuity",name:"Ingenuity Mars helicopter",kind:"rover",mission:"Mars 2020 · 2021–2024",history:"Ingenuity became the first aircraft to make powered, controlled flights on another planet. A technology demonstration became a scouting partner for Perseverance.",launch:"First flight on 19 April 2021; operations ended in January 2024 after rotor damage during flight 72.",purpose:"Demonstrate powered flight in Mars's thin atmosphere and test aerial reconnaissance.",status:"Ingenuity remains on the Martian surface. Its mission ended after a rotor blade was damaged; it is a retired aircraft, not a rover.",sources:[{label:"NASA: Ingenuity Mars Helicopter",url:"https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/"},{label:"NASA: Ingenuity mission ends",url:"https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/"}]},
    {id:"opportunity",name:"Opportunity rover",kind:"rover",mission:"Mars Exploration Rover · 2004–2019",history:"Opportunity far outlasted its planned 90-sol mission, crossing plains and crater rims and finding geological evidence of ancient water. A planet-wide dust storm blocked sunlight and communication.",launch:"Landed in Meridiani Planum on 25 January 2004 UTC; NASA ended the mission in February 2019.",purpose:"Study Martian rocks and minerals for evidence of past water and habitable environments.",status:"The rover remains where it stopped. Its final silence followed a major dust storm.",sources:[{label:"NASA: Opportunity rover",url:"https://science.nasa.gov/mission/mer-opportunity/"},{label:"NASA JPL: Mars Exploration Rover",url:"https://mars.nasa.gov/mer/"}]},
    {id:"phoenix",name:"Phoenix lander",kind:"lander",mission:"Phoenix Mars Lander · 2008",history:"Phoenix landed in the Martian arctic and used a robotic arm to dig into icy soil. It confirmed water ice beneath the surface and studied polar chemistry.",launch:"Landed near Mars's north polar region on 25 May 2008; operations ended after the Martian winter reduced power.",purpose:"Investigate water ice and whether arctic soil could support microbial life.",status:"The stationary lander remains in the arctic; its present condition is uncertain.",sources:[{label:"NASA NSSDCA: Phoenix",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-034A"},{label:"NASA: Phoenix mission",url:"https://science.nasa.gov/mission/phoenix/"}]},
    {id:"viking-landers",name:"Viking 1 and Viking 2 landers",kind:"lander",mission:"Viking program · 1976",history:"Viking landers sent the first long-lived surface laboratories to Mars. They photographed their surroundings, measured weather and performed biology experiments that still shape debates about the search for life.",launch:"Viking 1 landed 20 July 1976; Viking 2 landed 3 September 1976. Operations ended in 1980 and 1982.",purpose:"Image Mars, characterize its atmosphere and soil, and search for evidence of biological activity.",status:"Both landers remain on Mars. Their experiments did not establish a definitive detection of life.",sources:[{label:"NASA NSSDCA: Viking 1",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C"},{label:"NASA NSSDCA: Viking 2",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-083C"}]},
    {id:"pathfinder-lander",name:"Mars Pathfinder lander and airbags",kind:"lander",mission:"Mars Pathfinder · 1997",history:"Pathfinder bounced to a stop inside giant airbags, then opened like petals to expose Sojourner. It relayed images and rover data and became a landmark in lower-cost Mars exploration.",launch:"Landed on 4 July 1997; final successful communication came in September 1997.",purpose:"Demonstrate economical landing and rover operations while studying local rocks, soil and weather.",status:"The lander, airbags and rover remain at the landing site. The cause of final communications loss was never conclusively established.",sources:[{label:"NASA Science: Mars Pathfinder",url:"https://science.nasa.gov/mission/mars-pathfinder/"},{label:"NASA NSSDCA: Mars Pathfinder",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A"}]},
    {id:"mars-3",name:"Mars 3 lander",kind:"lander",mission:"Soviet Mars 3 · 1971",history:"Mars 3 achieved the first soft landing on Mars, but transmitted only a brief signal before falling silent. That tiny window became one of planetary exploration's enduring mysteries.",launch:"Touched down on 2 December 1971 and transmitted for roughly 14.5 seconds.",purpose:"Attempt surface imaging and environmental measurements from Mars.",status:"Believed to remain in its landing region, but its exact location and condition are unconfirmed. This is a candidate artifact, not a visually verified object.",sources:[{label:"NASA NSSDCA: Mars 3",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-049A"}]},
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

function openArchive() {
  const active = Object.entries(scenes).find(([key, el]) => key !== "archive" && !el.classList.contains("hidden"));
  if (active) lastSceneBeforeArchive = active[0];
  closeArtifact(false);
  renderArchive();
  showScene("archive");
  $("#archive-search").focus({preventScroll:true});
}
function archiveEraFor(artifact) {
  const years = (artifact.mission + " " + artifact.launch).match(/(?:19|20)[0-9]{2}/g);
  if (!years) return "unknown";
  const year = Math.min(...years.map(Number));
  if (year < 1980) return "1960";
  if (year < 2000) return "1980";
  if (year < 2020) return "2000";
  return "2020";
}
function archiveStatusFor(artifact) {
  const status = artifact.status.toLowerCase();
  if (/uncertain|not conclusively|not confirmed|unknown|fate of some|not established/.test(status)) return "uncertain";
  if (/crash|impact|failed|failure|crashed|lost contact during landing/.test(status)) return "impact";
  if (/mission ended|ended attempts|operations ended|could not be repositioned|became stuck|reduced power|stopped communicating|last successful communication|ended after damage|retired aircraft/.test(status)) return "retired";
  if (/passive|observations continue|remain operational|still operating|continues to|deliberately left|left on the moon as part of the mission design|descent stage was left on the lunar surface|left behind as part of the mission design/.test(status)) return "planned";
  if (/left on|left behind|remain at their landing sites|remain at their sites|remains at their deployment sites|were left on the moon|was left on the moon|stations and cables remain/.test(status)) return "planned";
  return "retired";
}
function populateMissionFilter(all) {
  const select = $("#archive-mission-filter");
  if (!select) return;
  const previous = archiveMission;
  const missions = [...new Set(all.map(a => a.mission))].sort((a, b) => a.localeCompare(b));
  select.replaceChildren(new Option("All missions", "all"));
  missions.forEach(mission => select.add(new Option(mission, mission)));
  select.value = missions.includes(previous) ? previous : "all";
  archiveMission = select.value;
}
function renderArchive() {
  const grid = $("#archive-grid");
  if (!grid) return;
  grid.replaceChildren();
  const all = [...artifacts.moon.map(a => ({...a, world:"moon"})), ...artifacts.mars.map(a => ({...a, world:"mars"}))];
  populateMissionFilter(all);
  const filtered = all.filter(a => {
    const haystack = [a.name,a.mission,a.kind,a.history,a.purpose,a.status].join(" ").toLowerCase();
    const worldMatch = archiveFilter === "all" || archiveFilter === a.world || (archiveFilter === "discovered" && discoveredIds.has(a.id));
    const missionMatch = archiveMission === "all" || archiveMission === a.mission;
    const kindMatch = archiveKind === "all" || archiveKind === a.kind;
    const eraMatch = archiveEra === "all" || archiveEraFor(a) === archiveEra;
    const statusMatch = archiveStatus === "all" || archiveStatusFor(a) === archiveStatus;
    return worldMatch && missionMatch && kindMatch && eraMatch && statusMatch && haystack.includes(archiveQuery.toLowerCase());
  });
  $("#archive-count").textContent = filtered.length + " / " + all.length + " RESEARCH RECORDS";
  $("#archive-empty").classList.toggle("hidden", filtered.length > 0);
  filtered.forEach(a => {
    const card = document.createElement("article"); card.className = "archive-record";
    const meta = document.createElement("p"); meta.className = "archive-record-meta"; meta.textContent = a.world.toUpperCase() + " / " + a.kind.toUpperCase() + (discoveredIds.has(a.id) ? " / VISITED" : "");
    const title = document.createElement("h3"); title.textContent = a.name;
    const mission = document.createElement("p"); mission.className = "archive-record-mission"; mission.textContent = a.mission;
    const summary = document.createElement("p"); summary.className = "archive-record-summary"; summary.textContent = a.history;
    const sourceLinks = document.createElement("div"); sourceLinks.className = "archive-record-sources"; sourceLinks.setAttribute("aria-label", "Official mission and data sources");
    (a.sources || []).slice(0, 2).forEach(source => {
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = source.label + " ↗";
      sourceLinks.appendChild(link);
    });
    const button = document.createElement("button"); button.className = "archive-record-open"; button.type = "button"; button.textContent = "OPEN OBJECT DOSSIER ↗";
    button.addEventListener("click", () => { enterWorld(a.world); openArtifact(a, button); });
    card.append(meta,title,mission,summary,sourceLinks,button); grid.appendChild(card);
  });
}
function returnFromArchive() { showScene(scenes[lastSceneBeforeArchive] ? lastSceneBeforeArchive : "destinations"); }

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
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({top: 0, behavior: reducedMotion ? "auto" : "smooth"});
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
  const landscapeSource = $("#landscape-source");
  if (landscapeSource) {
    landscapeSource.href = world === "moon" ? "https://science.nasa.gov/resource/apollo-17-eva/" : "https://science.nasa.gov/photojournal/perseverance-navcams-360-degree-panorama/";
    landscapeSource.textContent = world === "moon" ? "LANDSCAPE IMAGE: NASA / GENE CERNAN ↗" : "LANDSCAPE IMAGE: NASA / JPL-CALTECH ↗";
  }
  renderArtifacts();
  showScene("planet");
}
function renderArtifacts() {
  const list = artifacts[currentWorld];
  const track = $("#artifact-track");
  track.replaceChildren();
  const landscape = $("#landscape");
  const surfaceHeight = Math.max(520, window.innerHeight - 245);
  const surfaceWidth = Math.max(window.innerWidth, list.length * 260 + 100);
  track.style.height = surfaceHeight + "px";
  track.style.width = surfaceWidth + "px";
  landscape.style.height = surfaceHeight + "px";
  landscape.style.setProperty("--world-width", surfaceWidth + "px");
  list.forEach((artifact, index) => {
    const button = document.createElement("button");
    const x = 145 + index * 260;
    const y = Math.round(surfaceHeight * [0.57, 0.68, 0.52, 0.72][index % 4]);
    button.type = "button";
    button.className = "artifact-marker";
    button.dataset.artifactId = artifact.id;
    button.style.setProperty("--artifact-x", x + "px");
    button.style.setProperty("--artifact-y", y + "px");
    button.style.setProperty("--artifact-scale", [0.86, 1.08, 0.94, 1.16][index % 4]);
    button.setAttribute("aria-label", "Investigate " + artifact.name);
    button.innerHTML = drawingFor(artifact.kind) + '<span class="artifact-label"></span><span class="artifact-ground-shadow" aria-hidden="true"></span>';
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
  const markers = $$(".artifact-marker", $("#artifact-track"));
  const maxIndex = Math.max(0, markers.length - 1);
  sectionIndex = Math.max(0, Math.min(sectionIndex, maxIndex));
  const marker = markers[sectionIndex];
  $("#world-progress").textContent = "EXHIBIT " + String(sectionIndex + 1).padStart(2, "0") + " / " + String(markers.length).padStart(2, "0");
  $("#move-left").disabled = sectionIndex === 0;
  $("#move-right").disabled = sectionIndex === maxIndex;
  $("#move-left").style.opacity = sectionIndex === 0 ? ".45" : "1";
  $("#move-right").style.opacity = sectionIndex === maxIndex ? ".45" : "1";
  if (marker) {
    $$(".artifact-marker", $("#artifact-track")).forEach((item, index) => item.classList.toggle("is-current-exhibit", index === sectionIndex));
  }
}
function moveSection(delta) {
  const max = artifacts[currentWorld].length - 1;
  sectionIndex = Math.max(0, Math.min(max, sectionIndex + delta));
  updateLandscapePosition();
  const item = artifacts[currentWorld][sectionIndex];
  const marker = $$(".artifact-marker", $("#artifact-track"))[sectionIndex];
  $("#guide-tip-text").textContent = "Nearby exhibit: " + item.name + ". Select it to read the research record.";
  if (marker) marker.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center", inline: "nearest"});
}
function openArtifact(artifact, trigger) {
  selectedArtifact = artifact;
  lastFocusedElement = trigger || document.activeElement;
  currentWorld = artifact.world || currentWorld;
  $("#object-kicker").textContent = (currentWorld === "moon" ? "LUNAR" : "MARTIAN") + " FIELD DOSSIER / " + artifact.kind.toUpperCase();
  $("#object-name").textContent = artifact.name;
  $("#object-mission").textContent = artifact.mission;
  const panel = $("#object-panel");
  panel.dataset.kind = artifact.kind;
  const content = $("#object-content");
  content.replaceChildren();
  const stage = document.createElement("div");
  stage.className = "dossier-object-stage";
  stage.setAttribute("aria-label", "Stylised rotating illustration of " + artifact.name + "; not a historical photograph");
  stage.innerHTML = '<div class="dossier-orbit" aria-hidden="true"></div><div class="dossier-object-model">' + drawingFor(artifact.kind) + '</div><span class="dossier-model-caption">SCHEMATIC OBJECT MODEL · NOT TO SCALE</span>';
  const facts = document.createElement("div");
  facts.className = "dossier-facts";
  const records = [
    ["MISSION HISTORY", artifact.history],
    ["MISSION TIMELINE", artifact.launch],
    ["ORIGINAL PURPOSE", artifact.purpose],
    ["DOCUMENTED OUTCOME", artifact.status]
  ];
  records.forEach(([label, value], index) => {
    const box = document.createElement("section");
    box.className = "dossier-fact neon-box";
    box.style.setProperty("--fact-index", index);
    const heading = document.createElement("h4");
    heading.textContent = label;
    const paragraph = document.createElement("p");
    paragraph.textContent = value;
    box.append(heading, paragraph);
    facts.appendChild(box);
  });
  content.append(stage, facts);
  $$(".object-tab").forEach(tab => {
    tab.classList.remove("active");
    tab.setAttribute("aria-selected", "false");
  });
  const tabs = $(".object-tabs");
  if (tabs) tabs.classList.add("hidden");
  const sources = $("#object-sources");
  sources.replaceChildren();
  artifact.sources.forEach(source => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.label;
    li.appendChild(link);
    sources.appendChild(li);
  });
  panel.classList.remove("hidden");
  $("#close-object").focus();
  discoveredIds.add(artifact.id);
  try { localStorage.setItem("aftermission-discovered", JSON.stringify([...discoveredIds])); } catch (_) {}
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
// The site tour is opt-in; never interrupt the arrival scene with an automatic modal.

$("#begin-mission").addEventListener("click", beginGuide);
$("#skip-arrival").addEventListener("click", beginGuide);
$("#open-archive").addEventListener("click", openArchive);
$("#planet-open-archive").addEventListener("click", openArchive);
$("#planet-top-archive").addEventListener("click", openArchive);
$("#archive-back").addEventListener("click", returnFromArchive);
$("#archive-to-worlds").addEventListener("click", showDestinations);
$("#open-reflection").addEventListener("click", () => showScene("reflection"));
$("#reflection-explore").addEventListener("click", showDestinations);
$("#reflection-archive").addEventListener("click", openArchive);
$("#archive-search").addEventListener("input", event => { archiveQuery = event.target.value.trim(); renderArchive(); });
$("#archive-mission-filter").addEventListener("change", event => { archiveMission = event.target.value; renderArchive(); });
$("#archive-kind-filter").addEventListener("change", event => { archiveKind = event.target.value; renderArchive(); });
$("#archive-era-filter").addEventListener("change", event => { archiveEra = event.target.value; renderArchive(); });
$("#archive-status-filter").addEventListener("change", event => { archiveStatus = event.target.value; renderArchive(); });
$$(".archive-filter").forEach(button => button.addEventListener("click", () => {
  archiveFilter = button.dataset.filter;
  $$(".archive-filter").forEach(item => { const active = item === button; item.classList.toggle("active", active); item.setAttribute("aria-pressed", String(active)); });
  renderArchive();
}));

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
  const panel = $("#object-panel");
  const tourOpen = tourOverlay && !tourOverlay.classList.contains("hidden");
  const panelOpen = panel && !panel.classList.contains("hidden");
  if (event.key === "Escape" && tourOpen) { closeTour(); return; }
  if (event.key === "Escape" && panelOpen) { closeArtifact(); return; }
  if (event.key === "Tab" && (tourOpen || panelOpen)) {
    const modal = tourOpen ? tourOverlay : panel;
    const focusable = $$("button:not([disabled]),a[href],input,select,[tabindex]:not([tabindex=\"-1\"])", modal).filter(el => el.offsetParent !== null);
    if (focusable.length) {
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  if (!scenes.planet.classList.contains("hidden")) {
    if ($("#object-panel").classList.contains("hidden") && event.key === "ArrowLeft") moveSection(-1);
    if ($("#object-panel").classList.contains("hidden") && event.key === "ArrowRight") moveSection(1);
  }
});

const tour = [
  {label:"MISSION BRIEFING / 01", title:"Would you like a tour?", description:"Welcome to After Mission. Take this quick guided tour to learn how to explore the museum, choose the Moon or Mars, and investigate the equipment left behind — or skip it and explore freely."},
  {label:"THE GUIDE / 02", title:"Meet Dr. Anubhuti.", description:"Your field scientist introduces the archive and helps you choose a destination. The portrait is the guide character; the site is an independent student project, not an official NASA site."},
  {label:"CHOOSE A WORLD / 03", title:"Pick your landing site.", description:"Open the Moon or Mars archive. Each world has its own landscape and a small set of clickable exhibits."},
  {label:"INVESTIGATE / 04", title:"Click. Explore. Discover.", description:"Select an object in the landscape or use the arrow buttons / keyboard arrows to move between exhibits. Each record has History, Timeline, Purpose, Final Status and primary-source links."},
  {label:"THE ARCHIVE / 05", title:"Return to what you found.", description:"Search all records, filter by world, and use My Discoveries to revisit objects you have opened. Your discovery list is stored only in this browser."}
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


// Motion enhancement layer: subtle pointer parallax and animated artifact reveals.
// All navigation remains native button handlers above; no animation is required for functionality.
(function initMotionEnhancements(){
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    document.querySelectorAll(".destination-card,.dialogue-panel,.intro-copy").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        el.style.setProperty("--pointer-x", (x * 7).toFixed(2) + "px");
        el.style.setProperty("--pointer-y", (y * 7).toFixed(2) + "px");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--pointer-x", "0px");
        el.style.setProperty("--pointer-y", "0px");
      });
    });
    const style = document.createElement("style");
    style.textContent = ".destination-card,.dialogue-panel,.intro-copy{translate:var(--pointer-x,0) var(--pointer-y,0);}";
    document.head.appendChild(style);
  }
})();


/* POINT-AND-CLICK FIELD SYSTEM — layered on top of the existing museum navigation. */
(function initPointAndClickField(){
  const planet = document.querySelector("#planet-scene");
  const landscape = document.querySelector("#landscape");
  const track = document.querySelector("#artifact-track");
  if(!planet || !landscape || !track) return;

  const toolsBar = document.createElement("div");
  toolsBar.className = "field-tools";
  toolsBar.setAttribute("aria-label","Planetary exploration tools");
  toolsBar.innerHTML = '<span class="field-tools-label"><i></i> FIELD INTERFACE</span><button type="button" id="field-scan">⌕ SCAN AREA</button><button type="button" id="field-log">FIELD LOG <b id="field-log-count">0</b></button>';
  planet.appendChild(toolsBar);

  const toast = document.createElement("div");
  toast.className = "field-toast";
  toast.setAttribute("role","status");
  toast.setAttribute("aria-live","polite");
  toast.innerHTML = '<span class="field-toast-icon">+</span><span class="field-toast-copy">FIELD SYSTEM READY</span>';
  planet.appendChild(toast);

  const sweep = document.createElement("div");
  sweep.className = "field-scan-sweep";
  sweep.setAttribute("aria-hidden","true");
  landscape.appendChild(sweep);

  const reticle = document.createElement("div");
  reticle.className = "field-reticle";
  reticle.setAttribute("aria-hidden","true");
  landscape.appendChild(reticle);

  const logPanel = document.createElement("aside");
  logPanel.className = "field-log-panel hidden";
  logPanel.setAttribute("aria-label","Discovered artifacts");
  logPanel.innerHTML = '<div class="field-log-heading"><div><p class="eyebrow">PERSONAL FIELD NOTES</p><h3>Discoveries</h3></div><button type="button" id="field-log-close" aria-label="Close field log">×</button></div><p class="field-log-intro">Objects you have inspected are recorded here for this browser session and saved discoveries.</p><div id="field-log-list" class="field-log-list"></div>';
  planet.appendChild(logPanel);

  let toastTimer = 0;
  function say(message){
    const copy=toast.querySelector(".field-toast-copy");
    copy.textContent=message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer=window.setTimeout(()=>toast.classList.remove("is-visible"),3200);
  }
  function refreshLog(){
    const count=document.querySelector("#field-log-count");
    const list=document.querySelector("#field-log-list");
    if(!count||!list) return;
    let found=[];
    try{
      const stored=JSON.parse(localStorage.getItem("aftermission-discovered")||"[]");
      found=Array.isArray(stored)?stored:[];
    }catch(_){}
    count.textContent=String(found.length);
    list.replaceChildren();
    const data=Object.values(artifacts).flat().filter(item=>found.includes(item.id));
    if(!data.length){
      const empty=document.createElement("p");
      empty.className="field-log-empty";
      empty.textContent="No discoveries yet. Scan the terrain, then select an artifact to begin your field notes.";
      list.appendChild(empty);
      return;
    }
    data.forEach((item,index)=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="field-log-entry";
      const title=document.createElement("span");
      title.className="field-log-entry-title";
      title.textContent=item.name;
      const meta=document.createElement("span");
      meta.className="field-log-entry-meta";
      meta.textContent=(item.world|| (artifacts.moon.includes(item)?"moon":"mars")).toUpperCase()+" / "+item.kind.toUpperCase();
      button.append(title,meta);
      button.addEventListener("click",()=>{
        logPanel.classList.add("hidden");
        enterWorld(item.world || (artifacts.moon.includes(item)?"moon":"mars"));
        window.setTimeout(()=>{
          const trigger=track.querySelector('[data-artifact-id="'+CSS.escape(item.id)+'"]');
          openArtifact(item,trigger||null);
        },80);
      });
      list.appendChild(button);
    });
  }
  document.querySelector("#field-scan").addEventListener("click",()=>{
    landscape.classList.remove("is-scanning");
    void landscape.offsetWidth;
    landscape.classList.add("is-scanning");
    const markers=[...track.querySelectorAll(".artifact-marker")];
    markers.forEach((marker,index)=>{
      marker.classList.remove("scan-found");
      window.setTimeout(()=>marker.classList.add("scan-found"),80+index*45);
    });
    const current=artifacts[currentWorld]||[];
    const foundIds=new Set();
    try{JSON.parse(localStorage.getItem("aftermission-discovered")||"[]").forEach(id=>foundIds.add(id));}catch(_){}
    const next=current.find(item=>!foundIds.has(item.id));
    say(next ? "SIGNAL FOUND · "+next.name.toUpperCase()+" · SELECT THE MARKER TO INVESTIGATE" : "SCAN COMPLETE · ALL "+current.length+" LOCAL RECORDS DISCOVERED");
    if(next){
      const marker=track.querySelector('[data-artifact-id="'+CSS.escape(next.id)+'"]');
      if(marker){
        marker.classList.add("scan-priority");
        marker.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
        window.setTimeout(()=>marker.classList.remove("scan-priority"),3500);
      }
    }
    window.setTimeout(()=>landscape.classList.remove("is-scanning"),1500);
  });
  document.querySelector("#field-log").addEventListener("click",()=>{
    refreshLog();
    logPanel.classList.toggle("hidden");
    if(!logPanel.classList.contains("hidden")) document.querySelector("#field-log-close").focus();
  });
  document.querySelector("#field-log-close").addEventListener("click",()=>{
    logPanel.classList.add("hidden");
    document.querySelector("#field-log").focus();
  });

  landscape.addEventListener("pointermove",event=>{
    if(event.pointerType==="touch") return;
    const rect=landscape.getBoundingClientRect();
    reticle.style.left=(event.clientX-rect.left)+"px";
    reticle.style.top=(event.clientY-rect.top)+"px";
    reticle.classList.add("is-active");
  });
  landscape.addEventListener("pointerleave",()=>reticle.classList.remove("is-active"));
  track.addEventListener("click",event=>{
    const marker=event.target.closest(".artifact-marker");
    if(marker){
      marker.classList.add("was-inspected");
      say("DOSSIER OPENED · "+(marker.querySelector(".artifact-label")?.textContent||"ARTIFACT").toUpperCase());
      window.setTimeout(refreshLog,100);
    }
  },true);
  const panel=document.querySelector("#object-panel");
  if(panel){
    new MutationObserver(()=>{
      if(!panel.classList.contains("hidden")) window.setTimeout(refreshLog,80);
    }).observe(panel,{attributes:true,attributeFilter:["class"]});
  }
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!logPanel.classList.contains("hidden")){
      logPanel.classList.add("hidden");
      document.querySelector("#field-log").focus();
    }
  });
  window.addEventListener("storage",refreshLog);
  const oldEnterWorld=window.enterWorld;
  // Keep the field tools synchronized whenever the visitor changes worlds.
  document.querySelectorAll(".destination-card").forEach(button=>button.addEventListener("click",()=>{
    logPanel.classList.add("hidden");
    window.setTimeout(()=>{refreshLog();say((button.dataset.world==="moon"?"LUNAR":"MARTIAN")+" FIELD SITE LOADED · SCAN TO LOCATE AN ARTIFACT");},500);
  }));
  refreshLog();
})();
