
//Flipped projection generated on the fly
flippedProjection = function(projection) {
  var p, raw, forward;
  
  if (!has(projections, projection)) { throw new Error("Projection not supported: " + projection); }
  p = projections[projection];    

  if (p.arg !== null) {
      console.log(d3)
    raw = d3.geoProjection(projection).raw(p.arg);
  } else {
    raw = d3.geo[projection].raw;  
  }
  
  forward = function(lambda, phi) {
    var coords = raw(-lambda, phi);
    return coords;
  };

  forward.invert = function(x, y) {
    var coords = raw.invert(x, y);
    coords[0] *= -1;
    return coords;
  };

  return d3.geo.projection(forward);
};

const euler = {
  "ecliptic": [-90.0, 23.4393, 90.0],
  "inverse ecliptic": [90.0, 23.4393, -90.0],
  "galactic": [-167.1405, 62.8717, 122.9319],
  "inverse galactic": [122.9319, 62.8717, -167.1405],
  "supergalactic": [283.7542, 74.2911, 26.4504],
  "inverse supergalactic": [26.4504, 74.2911, 283.7542],
  "init": function () {
    for (var key in this) {
      if (this[key].constructor == Array) {
        this[key] = this[key].map( function(val) { return val * deg2rad; } );
      }
    }
  },
  "add": function(name, ang) {
    if (!ang || !name || ang.length !== 3 || this.hasOwnProperty(name)) return;
    this[name] = ang.map( function(val) { return val * deg2rad; } );
    return this[name];
  }
};

const projections = {
  "airy": {n:"Airy’s Minimum Error", arg:Math.PI/2, scale:360, ratio:1.0, clip:true},
  "aitoff": {n:"Aitoff", arg:null, scale:162},
  "armadillo": {n:"Armadillo", arg:0, scale:250},
  "august": {n:"August", arg:null, scale:94, ratio:1.4},
  "azimuthalEqualArea": {n:"Azimuthal Equal Area", arg:null, scale:340, ratio:1.0, clip:true},
  "azimuthalEquidistant": {n:"Azimuthal Equidistant", arg:null, scale:320, ratio:1.0, clip:true},
  "baker": {n:"Baker Dinomic", arg:null, scale:160, ratio:1.4},
  "berghaus": {n:"Berghaus Star", arg:0, scale:320, ratio:1.0, clip:true},
  "boggs": {n:"Boggs Eumorphic", arg:null, scale:170},
  "bonne": {n:"Bonne", arg:Math.PI/5, scale:225, ratio:0.88},
  "bromley": {n:"Bromley", arg:null, scale:162},
//  "butterfly": {n:"Butterfly", arg:null, scale:31, ratio:1.1, clip:true},
  "collignon": {n:"Collignon", arg:null, scale:100, ratio:2.6},
  "craig": {n:"Craig Retroazimuthal", arg:0, scale:310, ratio:1.5, clip:true},
  "craster": {n:"Craster Parabolic", arg:null, scale:160},
  "cylindricalEqualArea": {n:"Cylindrical Equal Area", arg:Math.PI/6, scale:190, ratio:2.3},
  "cylindricalStereographic": {n:"Cylindrical Stereographic", arg:Math.PI/4, scale:230, ratio:1.3},
  "eckert1": {n:"Eckert I", arg:null, scale:175},
  "eckert2": {n:"Eckert II", arg:null, scale:175},
  "eckert3": {n:"Eckert III", arg:null, scale:190},
  "eckert4": {n:"Eckert IV", arg:null, scale:190},
  "eckert5": {n:"Eckert V", arg:null, scale:182},
  "eckert6": {n:"Eckert VI", arg:null, scale:182},
  "eisenlohr": {n:"Eisenlohr", arg:null, scale:102},
  "equirectangular": {n:"Equirectangular", arg:null, scale:165},
  "fahey": {n:"Fahey", arg:null, scale:196, ratio:1.4},
  "mtFlatPolarParabolic": {n:"Flat Polar Parabolic", arg:null, scale:175},
  "mtFlatPolarQuartic": {n:"Flat Polar Quartic", arg:null, scale:230, ratio:1.65},
  "mtFlatPolarSinusoidal": {n:"Flat Polar Sinusoidal", arg:null, scale:175, ratio:1.9},
  "foucaut": {n:"Foucaut", arg:null, scale:142},
  "ginzburg4": {n:"Ginzburg IV", arg:null, scale:180, ratio:1.7},
  "ginzburg5": {n:"Ginzburg V", arg:null, scale:196, ratio:1.55},
  "ginzburg6": {n:"Ginzburg VI", arg:null, scale:190, ratio:1.4},
  "ginzburg8": {n:"Ginzburg VIII", arg:null, scale:205, ratio:1.3},
  "ginzburg9": {n:"Ginzburg IX", arg:null, scale:190, ratio:1.4},
  "homolosine": {n:"Goode Homolosine", arg:null, scale:160, ratio:2.2},
  "hammer": {n:"Hammer", arg:2, scale:180},
  "hatano": {n:"Hatano", arg:null, scale:186},
  "healpix": {n:"HEALPix", arg:1, scale:320, ratio:1.2},
  "hill": {n:"Hill Eucyclic", arg:2, scale:190, ratio:1.1},
  "kavrayskiy7": {n:"Kavrayskiy VII", arg:null, scale:185, ratio:1.75},
  "lagrange": {n:"Lagrange", arg:Math.PI/4, scale:88, ratio:1.6, clip:false},
  "larrivee": {n:"l'Arrivée", arg:null, scale:160, ratio:1.25},
  "laskowski": {n:"Laskowski Tri-Optimal", arg:null, scale:165, ratio:1.7},
  "loximuthal": {n:"Loximuthal", arg:Math.PI/4, scale:175, ratio:1.8},
  "mercator": {n:"Mercator", arg:null, scale:160, ratio:1.3},
  "miller": {n:"Miller", arg:null, scale:160, ratio:1.5},
  "mollweide": {n:"Mollweide", arg:null, scale:180},
  "naturalEarth": {n:"Natural Earth", arg:null, scale:185, ratio:1.85},
  "nellHammer": {n:"Nell Hammer", arg:null, scale:160, ratio:2.6},
  "orthographic": {n:"Orthographic", arg:null, scale:480, ratio:1.0, clip:true},
  "patterson": {n:"Patterson Cylindrical", arg:null, scale:160, ratio:1.75},
  "polyconic": {n:"Polyconic", arg:null, scale:160, ratio:1.3},
  "rectangularPolyconic": {n:"Rectangular Polyconic", arg:0, scale:160, ratio:1.65},
  "robinson": {n:"Robinson", arg:null, scale:160},
  "sinusoidal": {n:"Sinusoidal", arg:null, scale:160, ratio:2},
  "stereographic": {n:"Stereographic", arg:null, scale:500, ratio:1.0, clip:true},
  "times": {n:"Times", arg:null, scale:210, ratio:1.4},
  "twoPointEquidistant": {n:"Two-Point Equidistant", arg:Math.PI/2, scale:320, ratio:1.15, clip:true},
  "vanDerGrinten": {n:"van Der Grinten", arg:null, scale:160, ratio:1.0},
  "vanDerGrinten2": {n:"van Der Grinten II", arg:null, scale:160, ratio:1.0},
  "vanDerGrinten3": {n:"van Der Grinten III", arg:null, scale:160, ratio:1.0},
  "vanDerGrinten4": {n:"van Der Grinten IV", arg:null, scale:160, ratio:1.6},
  "wagner4": {n:"Wagner IV", arg:null, scale:185},
  "wagner6": {n:"Wagner VI", arg:null, scale:160},
  "wagner7": {n:"Wagner VII", arg:null, scale:190, ratio:1.8},
  "wiechel": {n:"Wiechel", arg:null, scale:360, ratio:1.0, clip:true},
  "winkel3": {n:"Winkel Tripel", arg:null, scale:196, ratio:1.7}
};


const getProjection = (p) => 
{
    if (!has(projections, p)) return;
    var res = projections[p];
    if (!has(res, "ratio")) res.ratio = 2;  // Default w/h ratio 2:1
    return res;
}
function has(o, key) { return o !== null && hasOwnProperty.call(o, key); }


const getData = (d, trans) => {
  if (trans === "equatorial") return d;

  var leo = euler[trans],
      coll = d.features;

  for (var i=0; i<coll.length; i++)
    coll[i].geometry.coordinates = translate(coll[i], leo);

  return d;
}
const getAngles = (coords) => {
    if (coords === null) return [0,0,0];
    var rot = eulerAngles.equatorial;
    if (!coords[2]) coords[2] = 0;
    return [rot[0] - coords[0], rot[1] - coords[1], rot[2] + coords[2]];
};

const addHey = () => { 
    const elem = document.getElementById("star-chart");
    console.log('kikou');
    console.log(elem)
    elem.innerHTML = 'hey ho!';
};

const addChart = () => {
    let width = '1000px';
    let proj = getProjection('airy');
    let scale = proj.scale * width/1024;
    let rotation = getAngles(null);
    let prjMap = flippedProjection('airy').rotate(rotation).translate([width/2, height/2]).scale(scale);

    let container = container = d3.select('star-chart');
    //Constellation lines
    d3.json('./constellations.lines.json', function(error, json) {
        if (error) return console.warn(error);

        var conl = getData(json, "equatorial");

        container.selectAll(".lines")
            .data(conl.features)
            .enter().append("path")
            .attr("class", "constline");
        redraw();
    });
};


setTimeout(addChart, 1000);
