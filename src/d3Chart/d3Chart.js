import * as d3 from 'd3';
import dataFactory from '../resources/data';

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

const data = dataFactory();

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
    sky.displayConstellationStars = (constName, show) => {
        const selector = '.star-constellation-name-'+constName;
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

        // display graticule if canvas is centered
        sky.mapLayer.selectAll('.graticule')
            .style('opacity', sky.isCentered() ? 1 : 0);
    };
    sky.highlightConstellation = (id, isHighlighted, useDelay=false) => {
        d3.select('#constellations-stroke-'+id)
            .classed('constellations-stroke-focus', isHighlighted);
        d3.select('#constellations-boundaries-'+id)
            .classed('constellations-boundaries-focus', isHighlighted);

        const nameSelector = '#constellations-name-'+id;
        const constName = d3.select(nameSelector);

        constName.classed('constellations-name-focus', isHighlighted)
            .style('display', isHighlighted ? 'block' : 'none')
            .style('opacity', 0)

        sky.scaleFonts(nameSelector, 30);

        if (isHighlighted)
            constName.transition().delay(useDelay ? 0 : constants.transitions.constellations)
            .style('opacity',  1);
    };

    sky.focusOnConstellation = (constellationId) => {
        if (constellationId=== undefined){
            sky.highlightConstellation(sky.state.selectedConstellation, false);
            sky.displayConstellationStars(sky.state.selectedConstellation,false);
            sky.state.selectedConstellation = undefined;
        } else {
            const currentConst = sky.state.selectedConstellation;

            if (currentConst) {
                sky.displayConstellationStars(currentConst,false);
                sky.highlightConstellation(currentConst, false);
            }

            sky.state.selectedConstellation = constellationId;
            sky.highlightConstellation(constellationId, true);
            sky.displayConstellationStars(constellationId, true);
        }
    };

    sky.zoomOnConstellation = (constellationBoundaries) => {
        if (constellationBoundaries === undefined || sky.state.centered === constellationBoundaries)
        {
            sky.reCenter();
            return;
        }

        const centroid = sky.path.centroid(constellationBoundaries);
        const bnds = sky.path.bounds(constellationBoundaries)
        const targetScale = Math.min(sky.width*0.5/(bnds[1][0] - bnds[0][0]), sky.height*0.8/(bnds[1][1] - bnds[0][1]));
        sky.state.centered = constellationBoundaries;

        const from = sky.canvasStateFactory([0,0]);
        const to = sky.canvasStateFactory(
                [
                    sky.width/(sky.state.centered ? 3 : 2) - centroid[0]*targetScale,
                    sky.height/(2) - centroid[1]*targetScale
                ],
                targetScale);

        sky.transformCanvas(from, to, constants.transitions.constellations);
    };

    sky.reCenter = () => {
        sky.state.centered = undefined;

        const from = sky.canvasStateFactory([0,0]);
        const to = sky.canvasStateFactory(
                [
                    sky.width/2 - sky.width / 2,
                    sky.height/2 - sky.height / 2
                ],
                1);

        sky.transformCanvas(from, to, constants.transitions.constellations);
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
        isCentered:() => sky.state.isCentered,
        draw : (state) => {

            const dragStart = () => {
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
            .data(data.constellations.strokes.features)
            .enter().append('path')
            .attr("class", "constellations-stroke")
            .attr("id", (d) =>"constellations-stroke-"+d.id)
            .attr('d', sky.path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('stroke', 'rgba(110,200,255,0.45)')
            .style('fill', 'none');


            // invisible boundaries used for click
            sky.mapLayer.selectAll('.constellations-boundaries')
            .data(data.constellations.boundaries.features)
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
                    sky.highlightConstellation(d.id, true, true);
            })
            .on('mouseleave', function(d){
                if(d.id !== sky.state.selectedConstellation)
                    sky.highlightConstellation(d.id, false, true);
            })

            // add names
            sky.mapLayer.selectAll(".constellations-name")
            .data(data.constellations.infos.features)
            .enter().append("text")
            .attr('vector-effect', 'non-scaling-stroke')
            .attr("x", (d) => { return sky.projection(d.geometry.coordinates)[0]; })
            .attr("y", (d) => { return sky.projection(d.geometry.coordinates)[1]; })
            .text(function(d) { return d.properties.name; })
            .attr("class", "constellations-name")
            .attr("id", (d)=>"constellations-name-"+d.id)
                       .on('click', (d)=> {
                d3Chart.selectConstellation(d.id);
            })
            .on('mouseover', function(d){
                if(d.id !== sky.state.selectedConstellation)
                    sky.highlightConstellation(d.id, true, true);
            })
            .on('mouseleave', function(d){
                if(d.id !== sky.state.selectedConstellation)
                    sky.highlightConstellation(d.id, false, true);
            })

            // add stars
            sky.mapLayer.selectAll(".stars")
            .data(data.stars.features).enter()
            .append("circle")
            .attr("cx", (d) => { return sky.projection(d.geometry.coordinates)[0]; })
            .attr("cy", (d) => { return sky.projection(d.geometry.coordinates)[1]; })
            .attr("r", (d) => { return 1/Math.exp(Number(d.properties.mag+2)/4)+"px" }) // sirius has the lowest magn : 1.5
            .attr("fill", "#c7f5ff")
            .attr('class', 'stars')

            sky.mapLayer.selectAll(".star-name")
            .data(data.stars.features)
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
            /** zoom currently deactivated
            if(d3.event.sourceEvent.type === "wheel") {
                const targetScaleRatio = d3.event.sourceEvent.deltaY > 0 ? 1.01 : 0.99;
                const targetScale = sky.getScale() * targetScaleRatio;
                const x = sky.width/2 - d3.event.sourceEvent.screenX*targetScale;
                const y =sky.height/2- d3.event.sourceEvent.screenY*targetScale;

                const from = sky.canvasStateFactory([0,0]);
                const to = sky.canvasStateFactory([x,y], sky.getScale()*targetScaleRatio);

                sky.transformCanvas(from,to,0, false);
            }
            **/
        },
        move : (lat, lng) => {},
        selectConstellation : (constellationId, zoomIn=true) => {
            let id = undefined;
            if(constellationId === sky.state.selectedConstellation || constellationId === undefined)
            {
                if (zoomIn)
                    sky.reCenter();
            } else {
                const constellation = data.getSkyElementById(constellationId);

                if(constellation.id && zoomIn)
                    sky.zoomOnConstellation(constellation.boundaries);

                id = constellation.id;
            }

            sky.focusOnConstellation(id);
            d3Chart.onConstellationSelected(id);
        },
        selectStar : (starId) => {},
    }

    return d3Chart;
}

export default d3ChartFactory;
