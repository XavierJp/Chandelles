# Kindle-the-stars :sparkles:
I love stars and constellations. Here is an attempt at making a simple sky map with wikipedia contextual links.
The map is initially centered on Paris, France.

This project was heavily inspired by [d3-celestial project from Ofrohn.](http://ofrohn.github.io/)
Data reuses [d3-celestial data.](https://github.com/ofrohn/d3-celestial)

## Known issues
- data still need a huge clean.
  - some constellations cannot be selected. This is a major blocker :fire:
  - some stars names seem to be duplicated
- stars name ovelap
- stars lat, lng, are currently flipped ! every coords should undergo a mirror translation

## What it cannot do (yet)
- focus & articles on stars **(soon)**
- search stars **(soon)**
- helper (for stargazing)
- mobile version
- red filter (for stargazing)

# Architecture
The code contains two main parts :
- a react app that handle 
- a d3Chart that plots the stars and constellations.

The d3Chart could easily be splitted from react and integrated with any other front end framework, or vanilla js.

D3Chart exposes the following API : 

```
draw(hook, initialState)
selectStar(starId)
selectConstellation(constellationId)
move(lat,long)
zoom(in/out, lat, long)
reCenter()
```

And has several lifetime cycle events : 
```
onStarSelected()
onConstellationSelected()
onZoom()
onMove()
```



