# Kindle-the-stars
Hi. I love stars and constellations. Here is my attempt at making a simple sky map linked with wikipedia.
The map is initially centered on Paris, France.

It is based on d3-celestial data available [here](https://github.com/ofrohn/d3-celestial)

## Known issues
- data still need a huge clean.
  - some constellations cannot be selected
  - Some stars name seem to be duplicated
- stars name ovelap

## What it cannot do (yet)
- focus & articles on stars **(soon)**
- search stars **(soon)**
- helper (for stargazing)
- mobile version
- red filter (for stargazing)

# Architecture
The code is split in two main parts :
- a react app that handle 
- a d3 chart that plot the stars and constellations.

The d3Chart could be esaily split from react and integrated with any other front end framework.

D3Chart exposes the following API : 

```
draw(hook, initialState)
selectStar(starId)
selectConstellation(constellationId)
move(lat,long)
zoom(in/out, lat, long)
```

And has several lifetime cycle events : 
```
onStarSelected()
onConstellationSelected()
onZoom()
onMove()
```



