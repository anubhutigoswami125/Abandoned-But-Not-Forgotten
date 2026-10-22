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
        {label:"NASA Marshall: Apollo Lunar Roving Vehicle", url:"https://www.nasa.gov/centers-and-facilities/marshall/apollo-lunar-roving-vehicle/"},
        {label:"NASA NSSDCA: Apollo Lunar Roving Vehicle", url:"https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html"}
      ]
    },
    {id:"apollo-ALSEP",name:"Apollo scientific experiment packages (ALSEP)",kind:"instrument",mission:"Apollo 12, 14, 15, 16 and 17 · 1969–1972",history:"Astronauts deployed instrument suites that measured moonquakes, heat flow, magnetic fields and particles. Cables and stations turned landing sites into remote field laboratories long after crews departed.",launch:"Deployed during Apollo surface EVAs between 1969 and 1972; most arrays operated until 1977.",purpose:"Measure seismic activity, heat flow, magnetic fields and the Moon's interaction with the solar wind.",status:"Stations and cables remain at their deployment sites. The scientific records survive although the instruments no longer transmit.",sources:[{label:"NASA: Apollo Lunar Surface Journal",url:"https://www.nasa.gov/history/alsj/"},{label:"NASA History: ALSEP package and instruments",url:"https://history.nasa.gov/wp-content/uploads/static/history/alsj/HamishALSEP.html"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"apollo-flags",name:"Apollo flags and flag assemblies",kind:"instrument",mission:"Apollo 11, 12, 14, 15, 16 and 17 · 1969–1972",history:"Each Apollo landing crew planted a flag. Orbital images indicate that flags at some sites may still cast shadows; Apollo 11's flag likely fell after ascent-engine exhaust, while the condition of others is not conclusively known.",launch:"Six Apollo crews planted flags, from Apollo 11 through Apollo 17 except Apollo 13, which did not land.",purpose:"A symbolic marker of human arrival, not a territorial claim or a science instrument.",status:"The assemblies remain at their landing sites, but the fabric and pole condition varies and cannot be conclusively determined for every site from available images.",sources:[{label:"NASA History: Six Flags on the Moon—current condition",url:"https://www.nasa.gov/wp-content/uploads/static/history/alsj/ApolloFlags-Condition.html"},{label:"NASA: Apollo program and six lunar flags",url:"https://www.nasa.gov/the-apollo-program/"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"apollo-tools",name:"Geology tools, scoops, rakes and drive tubes",kind:"instrument",mission:"Apollo surface missions · 1969–1972",history:"Hammers, tongs, scoops, rakes and core tubes helped crews collect lunar rocks and soil. Some tools and containers were left behind to save mass for the return journey; the samples brought home are still studied.",launch:"Used during multiple Apollo EVAs; individual tool histories vary by mission.",purpose:"Collect samples that reveal the Moon's volcanic, impact and early solar-system history.",status:"Some tools remain on the surface; returned samples are curated on Earth. Not every tool was discarded.",sources:[{label:"NASA: Spacewalking tools",url:"https://www.nasa.gov/suits-and-rovers/spacewalking-tools/"},{label:"NASA Astromaterials 3D: Apollo lunar collection",url:"https://ares.jsc.nasa.gov/astromaterials3d/apollo-lunar.htm"}]},
    {id:"apollo-plaque",name:"Apollo commemorative plaques",kind:"instrument",mission:"Apollo 11, 12 and 14 · 1969–1971",history:"Small plaques attached to lunar-module landing gear turned machines built for short missions into messages intended to outlast the crews' visits.",launch:"Apollo 11's plaque was left at Tranquility Base in July 1969; Apollo 12 and 14 also left plaques.",purpose:"Commemorate the landings and the people behind them.",status:"The plaques remain on the Moon attached to descent-stage hardware.",sources:[{label:"NASA Science: Apollo 11 plaque",url:"https://science.nasa.gov/resource/apollo-11-plaque/"},{label:"NASA Science: Apollo 14 plaque",url:"https://science.nasa.gov/resource/plaque-the-apollo-14-crew-will-leave-on-the-moon/"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"lunokhod-1",name:"Lunokhod 1 rover and Luna 17 lander",kind:"rover",mission:"Soviet Luna 17 · 1970",history:"Lunokhod 1 rolled across the Moon for nearly eleven months, sending panoramic images and measurements. Its lander remained after delivering the rover.",launch:"Luna 17 landed on 17 November 1970; Lunokhod 1 operated until September 1971.",purpose:"Remote robotic exploration, imaging and lunar-soil measurements.",status:"Both rover and lander remain on the Moon. Laser ranging later precisely located the rover.",sources:[{label:"NASA NSSDCA: Luna 17",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-095A"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"lunokhod-2",name:"Lunokhod 2 rover and Luna 21 lander",kind:"rover",mission:"Soviet Luna 21 · 1973",history:"Lunokhod 2 traversed the Moon, photographed terrain and measured soil properties. A navigation error in a crater helped end the mission, but its scientific record survived.",launch:"Luna 21 landed on 15 January 1973; Lunokhod 2 travelled about 37 km before operations ended.",purpose:"Robotic surface geology and engineering tests for remote lunar mobility.",status:"The rover and lander remain on the lunar surface; the rover's location is known well enough for laser ranging.",sources:[{label:"NASA NSSDCA: Luna 21",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1973-001A"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"surveyors",name:"Surveyor robotic landers",kind:"lander",mission:"Surveyor 1, 3, 5, 6 and 7 · 1966–1968",history:"Before Apollo, Surveyor landers tested whether the lunar surface could support a spacecraft and returned close-up images and soil measurements. Apollo 12 astronauts later visited Surveyor 3 and recovered components for Earth-based study.",launch:"Five Surveyor spacecraft made successful soft landings between 1966 and 1968.",purpose:"Reconnaissance and engineering data to prepare for crewed lunar landings.",status:"Successful landers remain at their sites, except components of Surveyor 3 recovered by Apollo 12.",sources:[{label:"NASA NSSDCA: Surveyor missions",url:"https://nssdc.gsfc.nasa.gov/planetary/lunar/surveyor.html"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"retroreflectors",name:"Laser retroreflector arrays",kind:"instrument",mission:"Apollo 11, 14 and 15; Soviet Lunokhod missions",history:"Corner-cube reflectors return laser pulses to Earth. These durable scientific instruments allow researchers to measure the Earth–Moon distance with extraordinary precision.",launch:"Apollo 11 deployed an array in July 1969; Apollo 14 and 15 added more. Soviet rovers carried reflectors too.",purpose:"Precision lunar laser ranging to test gravity and study the Earth–Moon system.",status:"The reflectors are passive and require no power. Earth-based laser ranging continues, although signal strength and observation conditions vary.",sources:[{label:"NASA: Laser beams reflected between Earth and Moon",url:"https://www.nasa.gov/missions/lro/laser-beams-reflected-between-earth-and-moon-boost-science/"},{label:"NASA History: Apollo retroreflector description",url:"https://history.nasa.gov/wp-content/uploads/static/history/alsj/HamishALSEP.html"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]},
    {id:"apollo-ascent-stages",name:"Apollo lunar-module ascent stages",kind:"lander",mission:"Apollo lunar missions · 1969–1972",history:"After returning crews to lunar orbit, several ascent stages were deliberately directed to impact the Moon, creating signals for seismic experiments. The stages left in lunar orbit later impacted the Moon; for Apollo 11 and 16 the precise impact locations are unknown.",launch:"Flew with Apollo missions; post-landing outcomes differ by mission.",purpose:"Carry the crew from the lunar surface back to lunar orbit; selected stages later served as impactors for lunar seismology.",status:"Apollo 12, 14, 15 and 17 ascent stages were deliberately impacted near their landing sites. Apollo 11 and 16 were left in lunar orbit and later impacted the Moon at unknown locations. These are distinct from descent stages left at landing sites.",sources:[{label:"NASA: Apollo locations and impact sites",url:"https://nssdc.gsfc.nasa.gov/planetary/lunar/apolloloc.html"},{label:"NASA: Human artifacts on the Moon",url:"https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html"}]}
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
        {label:"NASA: Mars Pathfinder mission", url:"https://science.nasa.gov/mission/mars-pathfinder/"},
        {label:"NASA JPL Robotics: Sojourner systems and communication relay", url:"https://www.jpl.nasa.gov/missions/mars-pathfinder-sojourner-rover/"}
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
    {id:"viking-landers",name:"Viking 1 and Viking 2 landers",kind:"lander",mission:"Viking program · 1976",history:"Viking landers sent the first long-lived surface laboratories to Mars. They photographed their surroundings, measured weather and performed biology experiments that still shape debates about the search for life.",launch:"Viking 1 landed 20 July 1976; Viking 2 landed 3 September 1976. Operations ended in 1980 and 1982.",purpose:"Image Mars, characterize its atmosphere and soil, and search for evidence of biological activity.",status:"Both landers remain on Mars. Their experiments did not establish a definitive detection of life.",sources:[{label:"NASA Science: Viking spacecraft and lander science",url:"https://science.nasa.gov/mission/viking/spacecraft-and-science/"},{label:"NASA NSSDCA: Viking 1 lander",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C"},{label:"NASA NSSDCA: Viking 2 lander",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-083C"}]},
    {id:"pathfinder-lander",name:"Mars Pathfinder lander and airbags",kind:"lander",mission:"Mars Pathfinder · 1997",history:"Pathfinder bounced to a stop inside giant airbags, then opened like petals to expose Sojourner. It relayed images and rover data and became a landmark in lower-cost Mars exploration.",launch:"Landed on 4 July 1997; final successful communication came in September 1997.",purpose:"Demonstrate economical landing and rover operations while studying local rocks, soil and weather.",status:"The lander, airbags and rover remain at the landing site. The cause of final communications loss was never conclusively established.",sources:[{label:"NASA Science: Mars Pathfinder",url:"https://science.nasa.gov/mission/mars-pathfinder/"},{label:"NASA NSSDCA: Mars Pathfinder",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A"}]},
    {id:"mars-3",name:"Mars 3 lander",kind:"lander",mission:"Soviet Mars 3 · 1971",history:"Mars 3 achieved the first soft landing on Mars, but transmitted only a brief signal before falling silent. That tiny window became one of planetary exploration's enduring mysteries.",launch:"Touched down on 2 December 1971 and transmitted for roughly 14.5 seconds.",purpose:"Attempt surface imaging and environmental measurements from Mars.",status:"Believed to remain in its landing region, but its exact location and condition are unconfirmed. This is a candidate artifact, not a visually verified object.",sources:[{label:"NASA NSSDCA: Mars 3",url:"https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-049A"},{label:"NASA JPL: Possible Mars 3 hardware in HiRISE images",url:"https://www.jpl.nasa.gov/images/pia16920-could-this-be-the-mars-soviet-3-lander/"}]},
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

// Content notes are intentionally record-specific. Every added detail below is
// supported by that record's linked source set or clarifies a statement already
// in the record; omit a note when the available record does not support one.
const dossierNotes = {
  "apollo-lm-descent-stage": {engineering:"The Lunar Module had two stages. The descent stage supplied the landing engine and legs; after landing, the ascent stage left it behind while carrying the crew toward lunar orbit. The landing stage was therefore part of the planned spacecraft architecture, not a failed return vehicle.",why:"It shows how the Lunar Module divided a landing and return into different pieces of hardware: one stage stayed at the site while the other carried the crew toward lunar orbit.",fact:"Apollo 11’s Eagle landed on July 20, 1969; the mission-specific dates in this record refer to that flight, not every Apollo landing.",dialogue:["Moon","The bottom half did the landing. The top half got the people home.","Rover","A very literal case of leaving the delivery vehicle at the door."],correction:"The descent stage and ascent stage are not interchangeable: one stayed at the landing site, while the other carried the crew back to lunar orbit."},
  "luna-16": {engineering:"Luna 16 separated the work into surface hardware and a small return vehicle. The surface stage supported sampling; a separate capsule carried lunar material back to Earth. This was an uncrewed sample-return mission, not a rover expedition.",why:"It demonstrated that robotic hardware could collect lunar material and return it without a crew travelling to the surface.",fact:"The sample capsule returned to Earth on September 24, 1970, four days after the lunar landing date given in this record.",dialogue:["Satellite","No astronauts, no field trip. The sample went home in its own return capsule.","Moon","And the landing stage stayed to keep the logistics simple."],correction:"Luna 16 was a Soviet mission; its inclusion broadens the archive beyond NASA missions."},
  "apollo-lrv": {engineering:"The Lunar Roving Vehicle was a battery-powered electric cart. It folded for transport and unfolded on the surface; astronauts steered it by hand while seated. It carried crew and equipment across terrain that would have taken much longer to cover on foot.",why:"The rover extended the area crews could examine on the final three Apollo surface missions, linking distant geological stops to a single landing site.",fact:"Three Lunar Roving Vehicles were driven on the Moon: one each on Apollo 15, 16 and 17.",dialogue:["Rover","Three traverses per mission. That is a lot of lunar fieldwork for a fold-up cart.","Moon","A cart with a very strict no-pavement policy."],correction:"The rovers did not drive back to Earth. They were left at their landing sites as planned."},
  "apollo-ALSEP": {engineering:"ALSEP was a set of separate instruments connected to a central station. The station handled radio communication and power distribution, while cables linked it to instruments placed around the site. Instruments differed by mission; they measured phenomena such as seismic activity, magnetic fields and solar-wind particles.",why:"Instead of ending all science when the crew left, the deployed arrays made each landing site a remote geophysical observatory. Mission Control stopped receiving data in 1977.",fact:"The first ALSEP flew on Apollo 12. Apollo 11 carried the smaller Early Apollo Scientific Experiments Package, or EASEP.",dialogue:["Moon","They left a little field station behind.","Satellite","With the Moon itself as the thing being measured. I checked the source before calling it a moon office."],correction:"Apollo 11’s EASEP and the later ALSEP arrays were related surface experiment packages, but they were not the same configuration."},
  "apollo-flags": {engineering:"The crews planted fabric flags on poles at the landing sites. The flags were symbolic objects, not scientific instruments; the archive’s uncertainty is about their present physical condition, which cannot be checked directly from Earth for every site.",why:"The flags became cultural traces of the landings. Their fragile fabric also illustrates why an object’s intended meaning and its long-term material condition are different questions.",fact:"Six Apollo crews planted flags on the Moon, from Apollo 11 through Apollo 17 except Apollo 13, which did not land.",dialogue:["Moon","A symbol can outlast the ceremony, even when its fabric has a rough time.","Satellite","So the honest caption is ‘condition uncertain,’ not ‘still waving.’"],correction:"The flags are not confirmed to be standing today. Their exact condition is not established for every Apollo site."},
  "apollo-tools": {engineering:"The tools served different field tasks: scoops moved loose soil, rakes gathered small rock fragments, hammers broke or sampled rock, and drive tubes collected soil columns. The precise tool set and what was left varied by crew and traverse.",why:"Apollo geology depended on choosing, documenting and collecting samples in context. The returned samples—not the tools themselves—are what laboratories on Earth continue to study.",fact:"The record deliberately groups tools used across multiple missions; it does not claim that every listed tool was left on the Moon.",dialogue:["Rover","A scoop, a rake and a drive tube: three ways to ask the ground a question.","Moon","And a reminder that ‘the tools’ is a family, not one identical object."],correction:"Not every Apollo tool remained on the surface; some tools and sample containers came back with the crews."},
  "apollo-plaque": {engineering:"These were small commemorative plates attached to lunar-module landing hardware. They did not operate as instruments; their survival depends on the landing-stage hardware and the lunar environment, not on active maintenance.",why:"The plaques turn a working spacecraft into a historical marker: they record that a landing happened and connect a physical site with the mission’s human story.",fact:"The linked NASA plaque source is specifically about Apollo 14; the archive groups plaques from Apollo 11, 12 and 14 and should not imply identical wording on each.",dialogue:["Moon","This one is a message attached to a machine, not another machine doing science.","Rover","I will resist trying to scan the plaque."],correction:"The plaque is not evidence that all Apollo missions left identical plaques or messages."},
  "lunokhod-1": {engineering:"Luna 17 delivered Lunokhod 1 to the surface, where the rover could move away from its lander and return panoramic images and measurements by radio. The rover and delivery lander are two distinct pieces of the mission’s surface hardware.",why:"It is an early example of remote surface mobility: a rover could investigate terrain beyond the landing platform while operators remained on Earth.",fact:"Lunokhod 1 operated from November 1970 until September 1971, according to the dates in this record.",dialogue:["Rover","One landing, then wheels on the ground and a much wider field notebook.","Satellite","And the lander stayed put while its passenger explored."],correction:"Lunokhod 1 was a Soviet rover delivered by Luna 17, not a NASA vehicle."},
  "lunokhod-2": {engineering:"Luna 21 delivered Lunokhod 2, a mobile rover that photographed terrain and measured soil properties. The record separates the rover’s work from the lander that carried it to the surface.",why:"Its long traverse showed how mobile robots could extend lunar surface exploration, while its ending also shows that route decisions and terrain conditions matter to remote operations.",fact:"The catalogue reports a traverse of about 37 km; it does not give a more precise route measurement here.",dialogue:["Satellite","That crater looked like a shortcut on the map.","Moon","Terrain is where a map gets to have the last word."],correction:"The rover did not return to Earth. The record describes its location as known well enough for laser ranging, while the mission itself had ended."},
  "surveyors": {engineering:"Surveyor landers used cameras and surface experiments to return close-range views and measurements after touchdown. The program’s engineering question was practical: what did the lunar surface look like at landing scale, and could a spacecraft land there safely enough for later crewed missions?",why:"Surveyor data reduced uncertainty about landing on the Moon before Apollo crews attempted it. Surveyor 3 also became a rare case where astronauts later visited a robotic lander.",fact:"Five Surveyor spacecraft made successful soft landings in the 1966–1968 period described by this record.",dialogue:["Moon","First came the robotic scouts. Then Apollo 12 visited one of them.","Rover","An unexpectedly good reunion, with a camera packed for the trip home."],correction:"Surveyor 3 itself stayed on the Moon, but Apollo 12 brought selected parts—including its camera—back to Earth for study."},
  "retroreflectors": {engineering:"A corner-cube reflector sends incoming light back toward its source. Earth-based observatories fire laser pulses at the arrays and time the returning light to measure the Earth–Moon distance. The array is passive: it does not generate a signal or need electrical power.",why:"These are unusual among the archive objects because a passive artifact can still support ongoing measurements when researchers can range to it.",fact:"Apollo 11, 14 and 15 deployed arrays; Soviet Lunokhod rovers also carried reflectors, as described by the catalogue sources.",dialogue:["Satellite","I sent a laser and got a tiny return signal.","Moon","The reflector answered by doing nothing electrically. Elegant, really."],correction:"The arrays do not actively transmit data. A returned laser pulse is not the same as a powered radio beacon."},
  "apollo-ascent-stages": {engineering:"The ascent stage was the crew’s ride from the lunar surface back to lunar orbit. After that job, mission plans differed: some stages were deliberately sent into the Moon, while Apollo 11 and 16 were left in lunar orbit and later impacted at unknown locations.",why:"This record separates hardware that remained at a landing site from hardware that became an impactor or later left orbit. Those are different outcomes and should not be collapsed into ‘abandoned on the Moon.’",fact:"NASA’s lunar-artifact compilation states that Apollo 12, 14, 15 and 17 ascent stages were deliberately impacted near their landing sites; Apollo 11 and 16 later impacted at unknown locations.",dialogue:["Satellite","I found the missing stages! They were—", "Moon","Some were deliberately aimed at me. The others’ exact impact points are unknown. Finish the sentence carefully."],correction:"Apollo 11 and 16 ascent stages were not left on the surface; they were left in lunar orbit and later impacted at unknown locations."},
  "sojourner": {engineering:"Sojourner was a six-wheeled microrover. Its rocker-bogie suspension let the wheels follow uneven ground without conventional springs; cameras helped operators assess the route, and its Alpha Proton X-ray Spectrometer (APXS) analyzed nearby rocks and soil. The lander relayed communication between the rover and Earth.",why:"The rover paired a technology demonstration with local geology: mobility placed an instrument next to selected rocks, while the lander served as the communications bridge.",fact:"Sojourner was designed for a short demonstration but remained active longer than the planned one-week rover mission, according to the linked NASA/JPL mission sources.",dialogue:["Rover","Six wheels, a rock analyzer and a lander acting as my radio home base.","Mars","A tiny explorer with a very important tether to its teammate."],correction:"Sojourner did not communicate directly with Earth as its sole link; the Pathfinder lander relayed its communications."},
  "spirit": {engineering:"Spirit was a mobile geology laboratory: it used cameras and scientific instruments to examine rocks and soil at Gusev Crater. The rover’s scientific purpose was to test geological evidence for past water, not to detect life directly.",why:"Its observations connected rock chemistry and terrain to Mars’s environmental history. Its final state also documents a common surface-mission limit: a rover can outlast its planned work but still be stopped by terrain and seasonal power constraints.",fact:"Spirit became stuck in soft soil in 2009; later attempts to reposition it for winter ended without success, as the catalogue records.",dialogue:["Rover","The ground looked firm until it wasn’t. Field notes: inspect the soil before celebrating.","Mars","A useful lesson from an explorer that could not drive itself free."],correction:"Spirit’s evidence concerned past environments and water; it did not establish that life existed at Gusev Crater."},
  "curiosity-edl": {engineering:"The heat shield protected the entry vehicle from atmospheric heating. A parachute and backshell then separated; a rocket-powered descent stage slowed above the ground and lowered Curiosity on a bridle before flying away. The pieces were discarded in sequence because each had finished its part of the landing.",why:"The debris field is the visible footprint of a carefully staged landing sequence. Orbital images documented the heat shield, backshell and parachute, rover and sky-crane impact disturbance as separate locations.",fact:"NASA’s landing image was taken by the Mars Reconnaissance Orbiter about a day after touchdown and showed the separated landing hardware.",dialogue:["Satellite","Heat shield, parachute, sky crane: three dramatic exits in one landing.","Mars","They were supposed to leave. The rover was the part meant to stay."],correction:"The sky crane is not the rover’s permanent lander. It lowers the rover, cuts the connection and flies away to crash at a distance."},
  "perseverance-edl": {engineering:"Perseverance used an entry capsule, heat shield, parachute and powered descent stage. The descent stage lowered the rover to the ground, then separated; the heat shield, backshell, parachute and descent hardware were intentionally released rather than carried as surface equipment.",why:"The landing system’s separate components spread across Jezero. Seeing them as a sequence explains why the debris is not a collection of failed spacecraft: much of it performed its planned delivery job.",fact:"NASA’s linked landing-component record documents Perseverance and several Mars 2020 spacecraft parts on the surface.",dialogue:["Rover","Parachute away, heat shield away, rover down.","Satellite","A delivery sequence with a lot of carefully timed goodbyes."],correction:"The discarded entry and descent pieces are not additional rovers or science stations."},
  "ingenuity": {engineering:"Ingenuity was a helicopter technology demonstration that flew in Mars’s thin atmosphere. It carried cameras and communicated through Perseverance, which acted as its relay and mission partner. Its job was aerial flight testing and scouting, not ground-based geology as a rover would do.",why:"It tested whether powered flight could work on another planet, then contributed scouting observations during Perseverance’s surface mission.",fact:"Ingenuity completed 72 flights before rotor damage ended operations in January 2024, according to NASA’s mission-end report linked here.",dialogue:["Rover","I use wheels. Ingenuity used rotors. We agreed not to race on the same surface.","Mars","A flight experiment that earned a longer story than its original test plan."],correction:"Ingenuity was a helicopter, not a rover, and its mission ended after rotor damage; it did not simply go quiet like a stationary lander."},
  "opportunity": {engineering:"Opportunity was a solar-powered rover. Its cameras and instruments studied rocks and soil as it moved across Meridiani Planum. The mission used mineral and geological evidence to investigate how water had affected the Martian surface; it did not carry a sample-return system.",why:"The rover’s field observations built a record of ancient water-related environments. A major dust storm later reduced sunlight and disrupted communication, ending a mission that had greatly outlasted its original plan.",fact:"The rover landed in January 2004 and NASA ended the mission in February 2019, as stated in the linked NASA mission record.",dialogue:["Rover","The dust storm stole the sunlight from my panels.","Mars","A weather report that became the last page of a very long travel diary."],correction:"Opportunity found evidence of past water-related geology; it did not discover present-day flowing water or life."},
  "phoenix": {engineering:"Phoenix was stationary, so it used a robotic arm rather than wheels to reach nearby soil. The arm dug trenches and delivered samples to instruments on the lander deck for chemical and geological analysis. Its target was the water-ice and soil environment of the Martian arctic.",why:"The lander showed how a fixed platform can investigate subsurface material when a robotic arm can reach and deliver samples to onboard instruments.",fact:"The mission confirmed water ice beneath the surface at its arctic landing site, while its present physical condition remains uncertain in this catalogue.",dialogue:["Mars","No wheels, but a two-metre arm that can bring the ground to the lab.","Rover","A very efficient way to avoid carrying the whole laboratory around."],correction:"Finding water ice is not a detection of life. Phoenix studied the environment’s habitability, not organisms themselves."},
  "viking-landers": {engineering:"Each Viking lander combined panoramic cameras, weather sensors, a sampling arm and laboratory instruments. Three biology experiments tested soil for possible signs of biological activity; chemical instruments analyzed samples and the atmosphere. The experiments did not produce an agreed, definitive detection of life.",why:"Viking made Mars a place where surface images, weather and chemistry could be measured directly. Its life-detection results still matter because a test result must be interpreted alongside the experiment design and the full evidence.",fact:"Viking 1 and Viking 2 landed in 1976 at separate sites and each was part of a spacecraft pair that also included an orbiter.",dialogue:["Satellite","Three biology experiments, and a result that refuses to fit in a one-word answer.","Mars","Good science sometimes ends with a sharper question, not a tidy verdict."],correction:"Viking’s experiments did not establish a definitive detection of life; describing them as proof either way overstates the result."},
  "pathfinder-lander": {engineering:"Pathfinder’s lander entered inside an aeroshell, deployed a parachute and airbags, and bounced to a stop. After landing, its petal-like panels opened and ramps let Sojourner drive onto the surface. The lander also provided the rover’s communication relay to Earth.",why:"The mission demonstrated a lower-cost way to deliver a lander and rover, while the lander-rover partnership became a template for later surface exploration.",fact:"Pathfinder landed on July 4, 1997; Sojourner drove down a ramp after the landing system opened on the surface.",dialogue:["Rover","Land, bounce, open the petals, roll out. Subtle entrance was never the plan.","Mars","And the lander stayed on radio duty while Sojourner explored."],correction:"The airbags were part of the planned landing system, not evidence that Pathfinder crashed unsuccessfully."},
  "mars-3": {engineering:"Mars 3’s lander separated from its orbiter and made a soft landing, but it transmitted for only about 14.5 seconds. The available record does not establish why the signal stopped, nor a visually confirmed location for the lander hardware.",why:"It marks a technical first—the first soft landing on Mars—alongside a sharp evidence boundary: a brief signal is not enough to reconstruct the lander’s final condition.",fact:"NASA’s linked image investigation describes candidate hardware in orbital imagery, not a confirmed identification of the lander.",dialogue:["Satellite","Fourteen and a half seconds of signal. I have several theories.","Mars","Keep them labeled as theories. The cause is still unknown."],correction:"The exact cause of the transmission loss and the lander’s precise current location are unconfirmed."},
  "insight": {engineering:"InSight was a stationary geophysical observatory. Its seismometer listened for marsquakes and impacts; its heat-flow experiment was designed to measure heat moving from the planet’s interior. The mission’s central goal was to infer Mars’s internal structure from measurements at one landing site.",why:"Unlike rovers that map many surface locations, InSight used precise measurements at a fixed site to study the planet’s interior. Dust accumulation on its solar panels reduced available power and the mission ended in 2022.",fact:"InSight recorded the first marsquake detections reported by NASA, beginning in 2019, according to the linked mission material.",dialogue:["Mars","A stationary lander listening to my interior. Finally, someone lets me finish a sentence.","Satellite","It had no wheels because the question was underground, not over the next hill."],correction:"InSight was not a rover, and its primary purpose was studying Mars’s interior rather than searching directly for life."}
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
  scenes.planet.classList.add("dossier-open");
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
  const notes = dossierNotes[artifact.id] || {};
  const records = [
    ["MISSION STORY", artifact.history],
    ["WHAT IT WAS DESIGNED TO DO", artifact.purpose],
    ...(notes.engineering ? [["HOW IT WORKED", notes.engineering]] : []),
    ["MISSION DATES / TIMELINE", artifact.launch],
    ["DOCUMENTED OUTCOME", artifact.status],
    ...(notes.why ? [["WHY THIS OBJECT MATTERS", notes.why]] : []),
    ...(notes.fact ? [["A SPECIFIC DETAIL", notes.fact]] : []),
    ...(notes.correction ? [["EVIDENCE CHECK", notes.correction]] : [])
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
  const banter = document.createElement("section");
  banter.className = "dossier-fact character-banter";
  if (notes.dialogue) {
    banter.innerHTML = `<h4>FIELD CHAT · FICTIONAL NARRATORS</h4><p><b>${notes.dialogue[0]}:</b> “${notes.dialogue[1]}”</p><p><b>${notes.dialogue[2]}:</b> “${notes.dialogue[3]}”</p>`;
    content.append(stage, facts, banter);
  } else {
    content.append(stage, facts);
  }
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
  scenes.planet.classList.remove("dossier-open");
  if (restoreFocus) {
    const marker = selectedArtifact && document.querySelector('[data-artifact-id="' + CSS.escape(selectedArtifact.id) + '"]');
    const focusTarget = lastFocusedElement && lastFocusedElement.getClientRects().length ? lastFocusedElement : marker && marker.getClientRects().length ? marker : $("#open-archive");
    if (focusTarget && typeof focusTarget.focus === "function") focusTarget.focus();
  }
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
  {label:"THE GUIDE / 02", title:"Meet Dr. Isa.", description:"Your field scientist introduces the archive and helps you choose a destination. The portrait is the guide character; the site is an independent student project, not an official NASA site."},
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
    reticle.style.left=(event.clientX-rect.left+landscape.scrollLeft)+"px";
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
/* Comic prologue and optional archive learning tools. */
(function initLivingComic(){
  const panels=[
    {title:'Some things<br>never come home.',text:'The Moon: “Welcome to the neighborhood. Everything here has a story.”'},
    {title:'The archive is open.',text:'The Rover: “Correction: everything here has a REALLY interesting story.” The Moon: “Please stop shouting at the visitors.”'},
    {title:'A trace is a clue.',text:'The Satellite: “A guess is not a fact. Let’s check the archive.” Explore documented objects, evidence and the places our missions left them.'}
  ]; let index=0;
  const render=()=>{const panel=$('#comic-panel');panel.classList.remove('is-panel-change');void panel.offsetWidth;panel.classList.add('is-panel-change');const p=panels[index]; $('#intro-title').innerHTML=p.title; $('#comic-dialogue').textContent=p.text; $('#comic-count').textContent=`PANEL ${index+1} / ${panels.length} · USE ← →`; $('#comic-prev').disabled=index===0; $('#comic-next').classList.toggle('hidden',index===panels.length-1); $('#begin-mission').classList.toggle('hidden',index!==panels.length-1);};
  $('#comic-next').addEventListener('click',()=>{index=Math.min(panels.length-1,index+1);render();});
  $('#comic-prev').addEventListener('click',()=>{index=Math.max(0,index-1);render();});
  document.addEventListener('keydown',e=>{if(!scenes.intro.classList.contains('hidden')&&!e.altKey&&!e.ctrlKey&&!e.metaKey){if(e.key==='ArrowRight'&&index<panels.length-1){index++;render();} if(e.key==='ArrowLeft'&&index>0){index--;render();}}});
  render();
})();

(function initLearningLab(){
  const all=Object.entries(artifacts).flatMap(([world,items])=>items.map(a=>({...a,world})));
  const overlay=$('#learning-lab'), body=$('#lab-content'); let labTrigger=null;
  const open=(title,kicker,html)=>{ if(overlay.classList.contains('hidden'))labTrigger=document.activeElement; $('#lab-title').textContent=title; $('#lab-kicker').textContent=kicker; body.innerHTML=html; overlay.classList.remove('hidden'); $('#close-lab').focus(); };
  const close=()=>{overlay.classList.add('hidden');if(labTrigger&&labTrigger.isConnected)labTrigger.focus();};
  $('#close-lab').addEventListener('click',close); overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.addEventListener('keydown',e=>{if(overlay.classList.contains('hidden'))return;if(e.key==='Escape'){close();return;}if(e.key==='Tab'){const focusable=[...overlay.querySelectorAll('button:not([disabled]),a[href],select')];if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sourceLinks=a=>a.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join(' · ');
  let nextRound=()=>{};
  body.addEventListener('click',event=>{
    const choice=event.target.closest('.lab-choice');
    if(!choice)return;
    event.stopImmediatePropagation();
    const answer=all.find(a=>a.id===body.dataset.answerId);
    if(!answer)return;
    body.querySelectorAll('.lab-choice').forEach(button=>button.disabled=true);
    const feedback=$('#game-feedback');
    const matched=choice.dataset.answer==='true';
    const explainer=body.dataset.gameType==='detective'?answer.purpose:answer.history;
    feedback.innerHTML=body.dataset.gameType==='detective'
      ? `<b>${matched?'Purpose matched.':'The record identifies this purpose:'}</b> ${esc(answer.name)}: ${esc(answer.purpose)}${dossierNotes[answer.id]?.fact?`<br><b>Field note:</b> ${esc(dossierNotes[answer.id].fact)}`:''}<br><small>Check the record: ${sourceLinks(answer)}</small>`
      : `<b>${matched?'Mission match confirmed.':'The catalogue match is:'}</b> ${esc(answer.name)} belongs to ${esc(answer.mission)}. ${esc(answer.history)}${dossierNotes[answer.id]?.fact?`<br><b>Field note:</b> ${esc(dossierNotes[answer.id].fact)}`:''}<br><small>Check the record: ${sourceLinks(answer)}</small>`;
    const dossierButton=document.createElement('button');
    dossierButton.type='button';dossierButton.className='action-button';dossierButton.textContent='OPEN THIS DOSSIER';
    dossierButton.addEventListener('click',()=>{close();enterWorld(answer.world);const marker=document.querySelector('[data-artifact-id="'+CSS.escape(answer.id)+'"]');openArtifact(answer,marker||null);});
    const again=document.createElement('button');again.type='button';again.className='text-button';again.textContent='ANOTHER ROUND';again.addEventListener('click',()=>nextRound());
    feedback.after(dossierButton,again);
  },true);
  const game=()=>{const a=all[Math.floor(Math.random()*all.length)]; const wrong=all.filter(x=>x.id!==a.id&&x.kind!==a.kind).slice(0,2); const choices=[a,...wrong].sort(()=>Math.random()-.5); body.dataset.answerId=a.id;body.dataset.gameType='detective';nextRound=game;open('Artifact Detective','OPTIONAL · SKIP ANY TIME',`<p class="lab-question">What was <b>${esc(a.name)}</b> designed to do?</p><div class="lab-choices">${choices.map(x=>`<button class="lab-choice" data-answer="${x.id===a.id}">${esc(x.purpose)}</button>`).join('')}</div><p id="game-feedback" aria-live="polite"></p><p><button class="text-button" id="game-skip">SKIP — KEEP EXPLORING</button></p>`); $('#game-skip').addEventListener('click',close);};
  const missionMatch=()=>{const pool=all.filter(a=>a.mission);const answer=pool[Math.floor(Math.random()*pool.length)];const distractors=pool.filter(a=>a.id!==answer.id&&a.mission!==answer.mission).slice(0,2);const choices=[answer,...distractors].sort(()=>Math.random()-.5);body.dataset.answerId=answer.id;body.dataset.gameType='match';nextRound=missionMatch;open('Mission Matchmaker','OPTIONAL · SKIP ANY TIME',`<p class="lab-question">Which archive object is associated with <b>${esc(answer.mission)}</b>?</p><div class="lab-choices">${choices.map(x=>`<button class="lab-choice" data-answer="${x.id===answer.id}">${esc(x.name)}</button>`).join('')}</div><p id="game-feedback" aria-live="polite"></p><p><button class="text-button" id="game-skip">SKIP — KEEP EXPLORING</button></p>`);$('#game-skip').addEventListener('click',close);};
  $('#open-game').addEventListener('click',game);
  $('#open-match-game').addEventListener('click',missionMatch);
  $('#open-timeline').addEventListener('click',()=>{const dated=all.map(a=>({...a,year:Number(((a.launch+' '+a.mission).match(/(?:19|20)\d{2}/)||[])[0])})).filter(a=>a.year).sort((a,b)=>a.year-b.year);open('Mission and Artifact Year Index','YEAR PRECISION PRESERVED · SOURCE-LINKED',`<ol class="lab-timeline">${dated.map(a=>`<li><b>${a.year}</b><span>${esc(a.name)} · ${esc(a.mission)}</span><small>${sourceLinks(a)}</small></li>`).join('')}</ol><p class="evidence-note">This index uses the first year stated in each record’s date wording. A year may refer to launch, landing, deployment or a mission span, as described in the dossier. It is not a complete event timeline.</p>`);});
  $('#open-compare').addEventListener('click',()=>{const options=all.map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('');open('Compare two objects','SIDE-BY-SIDE FIELD NOTES',`<div class="compare-controls"><label>OBJECT A <select id="compare-a">${options}</select></label><label>OBJECT B <select id="compare-b">${options}</select></label><button id="compare-show" class="action-button">COMPARE</button></div><div id="compare-result"></div>`);$('#compare-b').selectedIndex=1;$('#compare-show').addEventListener('click',()=>{const a=all.find(x=>x.id===$('#compare-a').value),b=all.find(x=>x.id===$('#compare-b').value);$('#compare-result').innerHTML=`<div class="compare-grid">${[a,b].map(x=>`<article><h3>${esc(x.name)}</h3><p><b>Destination</b> ${x.world==='moon'?'Moon':'Mars'}</p><p><b>Mission</b> ${esc(x.mission)}</p><p><b>Equipment</b> ${esc(x.kind)}</p><p><b>Purpose</b> ${esc(x.purpose)}</p><p><b>Outcome</b> ${esc(x.status)}</p><p>${sourceLinks(x)}</p></article>`).join('')}</div>`;});});
})();
