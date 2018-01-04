import * as d3 from 'd3';
import data from '../resources/data';

/**
 * CONSTANTES
 */
const constants = {
    transitions : {
        constellations : 750,
    }
};
/**
 * The state returns a sate brand new state ibject featuring the sky chart position on canvas
 */

const stateFactory = () => {
    const self = {
        centered : undefined,
        selectedConstellation: undefined,
        dragCoords : {
            x:0,
            y:0,
        },
        coords : {
            x:0,
            y:0,
        },
        scale : 1,
    };

    return self;
};

const sky = {};

// create the sky object
const skyFactory = (hook) => {
    const sky = {
        width : window.innerWidth,
        height : window.innerHeight,
        graticule : d3.geoGraticule(),
        state : stateFactory(),
        getX : () => sky.state.coords.x,
        getY : () => sky.state.coords.y,
        getScale : () => sky.state.scale,
        svg : d3.select(hook).append('svg'),
    }
    //var projection = d3.geoOrthographic()
    sky.projection = d3.geoStereographic()
            .scale(300)
            .center([0,0])
            .rotate([-2.34, -48.8])
            .translate([sky.width / 2, sky.height / 2]);

    sky.mapLayer = sky.svg.append('g').classed('map-layer', true);

    // when arguments are empty, should return current position
    sky.canvasStateFactory = (coords, scale) => {
        if (coords.length === 0  || coords === undefined) {
            coords = [sky.getX(), sky.getY()];
        }

        if(scale === undefined) {
            scale = sky.getScale();
        }
        const state = {
            coords:{
                x:coords[0],
                y:coords[1],
            },
            scale:scale,
        };
        return state;
    }
    sky.selectConstellation = (newConst) => {
        if (newConst === undefined){
            sky.highlightConstellation(sky.state.selectedConstellation, false);
            sky.displayConstellationStars(sky.state.selectedConstellation,false);
            sky.state.selectedConstellation = undefined;
        } else {
            const currentConst = sky.state.selectedConstellation;

            if (currentConst)
                sky.highlightConstellation(currentConst, false);

            sky.state.selectedConstellation = newConst;
            sky.highlightConstellation(newConst, true);
            sky.displayConstellationStars(newConst, true);
        }
    }
    sky.displayConstellationStars = (constName, show) => {
        const selector = '.star-constellation-name-'+constName;
        console.log(sky.getScale())
        sky.scaleFonts(selector, 20);
        d3.selectAll(selector)
            .transition().delay(show ? constants.transitions.constellations : 0)
            .style('display', show ? 'block' : 'none')
            .style('opacity', show ? '100' : '0');
    };
    sky.isSelectedConstellation = (id) => {
        return sky.state.selectedConstellation === id;
    };
    sky.isCentered = () => {
        return sky.state.centered === undefined;
    };
    sky.scaleFonts = (className, fontBaseSize) => {
        // Update constellations names
        sky.mapLayer.selectAll(className)
            .style('font-size', fontBaseSize/sky.getScale()+'px')
    };
    sky.transformCanvas = (oldState, newState, durationTime, forceCanvasUpdate=true) => {
        let transformStr = '';

        if (oldState === undefined) {
            oldState = sky.canvasStateFactory();
        }

        if (!newState.scale) {
            newState.scale =sky.getScale();
        }

        if (newState.coords) {
            const X = newState.coords.x - oldState.coords.x;
            const Y = newState.coords.y - oldState.coords.y;
            sky.state.coords = {x:X, y:Y};
            transformStr += `translate(${X},${Y})`;
        }

        transformStr += `scale(${newState.scale})`;
        sky.state.scale = newState.scale;

        if (durationTime && durationTime > 0) {
            sky.mapLayer.transition().duration(durationTime)
                .attr('transform', transformStr);
        } else {
            sky.mapLayer
                .attr('transform', transformStr);
        }

        sky.scaleFonts('.constellations-name', 20);
        // update stars name visibility
        if(Number(newState.scale) % 1 < 0.3 || forceCanvasUpdate)
        {
            /** should be a method to hide / show brightest stars in the display area
            sky.mapLayer.selectAll(".star-name")
                .style('font-size', 0.15*10/sky.getScale()+'em')
                .style('display', (d) => {
                    return Number(d.properties.mag) < sky.getScale() ? 'initial' : 'none';
                });
            **/
        }

        // display graticule if canvas is centered
        sky.mapLayer.selectAll('.graticule')
            .style('opacity', sky.isCentered() ? 1 : 0);
    };
    sky.highlightConstellation = (id, isHighlighted) => {
        d3.select('#constellations-stroke-'+id)
            .classed('constellations-stroke-focus', isHighlighted);
        d3.select('#constellations-name-'+id)
            .style('opacity', isHighlighted ? 1 : 0)
            .style('display', isHighlighted ? 'block' : 'none')
            .classed('constellations-name-focus', isHighlighted);
        d3.select('#constellations-boundaries-'+id)
            .classed('constellations-boundaries-focus', isHighlighted);
    }

    return sky;
}


const d3ChartFactory = (hook, opts) => {
    const sky = skyFactory(hook);

    const d3Chart = {
        // lifecycle API
        onStarSelected : opts.onStarSelected ? opts.onStarSelected : () => {},
        onConstellationSelected : opts.onConstellationSelected ? opts.onConstellationSelected : () => {},
        onZoom : opts.onZoom ? opts.onMove : () => {},
        onMove : opts.onMove ? opts.onMove : () => {},
        // chart manipulation
        draw : (state) => {

            const dragStart = () => {
                sky.selectConstellation();
                sky.state.dragCoords.x = d3.event.x - sky.state.coords.x;
                sky.state.dragCoords.y = d3.event.y - sky.state.coords.y;
            }

            const dragDrag = () => {
                const oldState = {
                    coords:{
                        x:sky.state.dragCoords.x,
                        y:sky.state.dragCoords.y,
                    },
                }
                const newState = {
                    coords:{
                        x:d3.event.x,
                        y:d3.event.y,
                    },
                };

                sky.transformCanvas(oldState, newState);
            }

            const drag = d3.drag()
            .on('start', dragStart)
            .on('drag', dragDrag);

            sky.svg.attr('width', sky.width)
            .attr('height', sky.height)
            .call(drag)
            .call(d3.zoom().on('zoom', d3Chart.zoom))


            sky.path = d3.geoPath()
            .projection(sky.projection);

            // append graticule
            sky.mapLayer.append("path")
            .datum(sky.graticule)
            .attr("class", "graticule")
            .attr("d", sky.path);

            // Draw each constellation as a path
            sky.mapLayer.selectAll('.constellations-stroke')
            .data(data.features)
            .enter().append('path')
            .attr("class", "constellations-stroke")
            .attr("id", (d) =>"constellations-stroke-"+d.id)
            .attr('d', sky.path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('stroke', 'rgba(110,200,255,0.45)')
            .style('fill', 'none')
            .on('click', (d)=> {
                d3Chart.selectConstellation(d.id);
            });


            // invisible boundaries used for click
            sky.mapLayer.selectAll('.constellations-boundaries')
            .data(constellationsBoundaries.features)
            .enter().append('path')
            .attr("class", "constellations-boundaries")
            .attr("id", (d) =>"constellations-boundaries-"+d.id)
            .attr('d', sky.path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('stroke', '#fdba81')
            .style('fill', 'rgba(0,0,0,0)')
            .style('display', function(d) {
                let bnds = sky.path.bounds(d);
                if(bnds[1][0] - bnds[0][0] > sky.width && bnds[1][1] - bnds[0][1] > sky.height ) {
                    return 'none'
                }
                return 'initial';
            })
            .on('click', (d)=> {
                d3Chart.selectConstellation(d.id);
            })
            .on('mouseover', function(d){
                if(d.id !== sky.state.selectedConstellation)
                    sky.highlightConstellation(d.id, true);
            })
            .on('mouseleave', function(d){
                if(d.id !== sky.state.selectedConstellation)
                    sky.highlightConstellation(d.id, false);
            })

            // add names
            sky.mapLayer.selectAll(".constellations-name")
            .data(constellationsInfos.features)
            .enter().append("text")
            .attr('vector-effect', 'non-scaling-stroke')
            .attr("x", (d) => { return sky.projection(d.geometry.coordinates)[0]; })
            .attr("y", (d) => { return sky.projection(d.geometry.coordinates)[1]; })
            .text(function(d) { return d.properties.name; })
            .attr("class", "constellations-name")
            .attr("id", (d)=>"constellations-name-"+d.id);

            // add stars
            sky.mapLayer.selectAll(".stars")
            .data(stars.features).enter()
            .append("circle")
            .attr("cx", (d) => { return sky.projection(d.geometry.coordinates)[0]; })
            .attr("cy", (d) => { return sky.projection(d.geometry.coordinates)[1]; })
            .attr("r", (d) => { return 1/Math.exp(Number(d.properties.mag+2)/4)+"px" }) // sirius has the lowest magn : 1.5
            .attr("fill", "#c7f5ff")
            .attr('class', 'stars')

            sky.mapLayer.selectAll(".star-name")
            .data(stars.features)
            .enter().append("text")
            .attr('vector-effect', 'non-scaling-stroke')
            .attr("x", (d) => { return sky.projection(d.geometry.coordinates)[0]+1; })
            .attr("y", (d) => { return sky.projection(d.geometry.coordinates)[1]-1; })
            .text(function(d) { return d.properties.name; })
            .attr("class",(d) => { return "star-name star-constellation-name-"+d.properties.con; })
            .style('display', 'none')
            .attr("id", (d)=>"star-name-"+d.id);
        },
        zoom : (scale,lat,lng) => {
            if(d3.event.sourceEvent.type === "wheel") {
                const targetScaleRatio = d3.event.sourceEvent.deltaY > 0 ? 1.01 : 0.99;
                const targetScale = sky.getScale() * targetScaleRatio;
                const x = sky.width/2 - d3.event.sourceEvent.screenX*targetScale;
                const y =sky.height/2- d3.event.sourceEvent.screenY*targetScale;

                const from = sky.canvasStateFactory([0,0]);
                const to = sky.canvasStateFactory([x,y], sky.getScale()*targetScaleRatio);

                sky.transformCanvas(from,to,0, false);
            }
        },
        move : (lat, lng) => {},
        selectConstellation : (constellationId) => {
            const constellation = constellationsBoundaries.features.find(c=>c.id === constellationId);

            let x, y;
            let targetScale = sky.state.scale;
            let selectedConstellation = undefined;

            // Compute centroid of the selected path
            if (constellation && sky.state.centered !== constellation) {
                const centroid = sky.path.centroid(constellation);
                x = centroid[0];
                y = centroid[1];

                let bnds = sky.path.bounds(constellation)
                targetScale = Math.min(sky.width*0.5/(bnds[1][0] - bnds[0][0]), sky.height*0.8/(bnds[1][1] - bnds[0][1]));
                sky.state.centered = constellation;
                selectedConstellation = constellation.id;
            } else { // back to initial

                x = sky.width / 2;
                y = sky.height / 2;
                targetScale = 1;
                sky.state.centered = undefined;
            }

            const from = sky.canvasStateFactory([0,0]);
            const to = sky.canvasStateFactory(
                    [
                        sky.width/(sky.state.centered ? 3 : 2) - x*targetScale,
                        sky.height/(2) - y*targetScale
                    ],
                    targetScale);

            sky.transformCanvas(from, to, constants.transitions.constellations);
            sky.selectConstellation(selectedConstellation);

            d3Chart.onConstellationSelected(constellationId);
        },
        selectStar : (starId) => {},
    }

    return d3Chart;
}

export default d3ChartFactory;
