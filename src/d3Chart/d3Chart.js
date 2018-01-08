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
 * The state returns a sate brand new state object featuring the sky chart position on canvas
 */

const data = dataFactory();

const stateFactory = () => {
    const self = {
        centered : true,
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

// create the sky object
const skyFactory = (hook, onEvents) => {
    const sky = {
        width : window.innerWidth,
        height : window.innerHeight,
        graticule : d3.geoGraticule(),
        state : stateFactory(),
        getX : () => sky.state.coords.x,
        getY : () => sky.state.coords.y,
        getScale : () => sky.state.scale,
        svg : d3.select(hook).append('svg'),
        onEvents : onEvents, // lifecycle
    }
    //var projection = d3.geoOrthographic()
    sky.projection = d3.geoStereographic()
            .scale(400)
            .center([0,0])
            .rotate([-2.34, -48.8])
            .translate([sky.width / 2, sky.height / 2]);

    sky.mapLayer = sky.svg.append('g').classed('map-layer', true);

    /** === DRAG BEHAVIOUR === **/

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

        sky.transformSky(oldState, newState);
    }

    const drag = d3.drag()
    .on('start', dragStart)
    .on('drag', dragDrag);

    sky.svg.attr('width', sky.width)
    .attr('height', sky.height)
    .call(drag)
    // .call(d3.zoom().on('zoom', d3Chart.zoom)) zoom deactivated for now


    sky.path = d3.geoPath()
    .projection(sky.projection);

    sky.isSelectedConstellation = (id) => {
        return sky.state.selectedConstellation === id;
    };
    sky.isCentered = () => {
        return sky.state.centered;
    };


    /** === sky manipulation functions === **/

    // when arguments are empty, should return current position
    sky.skyStateFactory = (coords, scale) => {
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

    // low level transformation (translate and scale)
    sky.transformSky = (oldState, newState, durationTime, forceCanvasUpdate=true) => {
        let transformStr = '';

        if (oldState === undefined) {
            oldState = sky.skyStateFactory();
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

    // zoom the whole sky on a constellation using its boundarie box
    sky.zoomOnConstellation = (constellationBoundaries) => {
        if (constellationBoundaries === undefined)
        {
            sky.reCenter();
            return;
        }

        const centroid = sky.path.centroid(constellationBoundaries);
        const bnds = sky.path.bounds(constellationBoundaries)
        const targetScale = Math.min(sky.width*0.5/(bnds[1][0] - bnds[0][0]), sky.height*0.8/(bnds[1][1] - bnds[0][1]));
        sky.state.centered = false;

        sky.move(
            sky.width/(sky.state.centered ? 2 : 3) - centroid[0]*targetScale,
            sky.height/(2) - centroid[1]*targetScale,
            targetScale,
            constants.transitions.constellations
            );
    };

    // recenter the sky
    sky.reCenter = () => {
        sky.state.centered = true;
        sky.move(0, 0, 1,constants.transitions.constellations);
    }

    // move the sky
    sky.move = (x, y, targetScale, delay=0) => {
        const from = sky.skyStateFactory([0,0]);
        const to = sky.skyStateFactory(
                [x, y],
                targetScale);

        sky.transformSky(from, to, delay);

        if (sky.onEvents.onMove)
            sky.onEvents.onMove();
    }

    /** === constellation and stars visual update functions === **/

    // set the focus on a constellation (highlight and display stars)
    // remove focus of previously selected constellation if any
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

    // highlight a constellation (display name and strokes, update font size)
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

    // display / hide a constellation's stars
    sky.displayConstellationStars = (constName, show) => {
        const selector = '.star-constellation-name-'+constName;
        sky.scaleFonts(selector, 20);
        d3.selectAll(selector)
            .transition().delay(show ? constants.transitions.constellations : 0)
            .style('display', show ? 'block' : 'none')
            .style('opacity', show ? '100' : '0');
    };

    // scale a title according to the sky current scale
    sky.scaleFonts = (className, fontBaseSize) => {
        // Update constellations names
        sky.mapLayer.selectAll(className)
            .style('font-size', fontBaseSize/sky.getScale()+'px')
    };

    return sky;
}


const d3ChartFactory = (hook, opts) => {
    // d3 object
    const sky = skyFactory(hook, opts);

    const d3Chart = {
        // true if chart is centered
        isCentered:() => sky.state.centered,
        // call to recenter the sky - if deselect any selected constellation
        reCenter : () => {
            if(sky.state.selectedConstellation)
                d3Chart.selectConstellation();

            sky.reCenter();
        },
        // call to draw chart == bind the data to the DOM
        draw : (state) => {

            // === graticule ===
            sky.mapLayer.append("path")
            .datum(sky.graticule)
            .attr("class", "graticule")
            .attr("d", sky.path);

            // === onstellation as a path ===
            sky.mapLayer.selectAll('.constellations-stroke')
            .data(data.constellations.strokes.features)
            .enter().append('path')
            .attr("class", "constellations-stroke pointer")
            .attr("id", (d) =>"constellations-stroke-"+d.id)
            .attr('d', sky.path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('stroke', 'rgba(110,200,255,0.45)')
            .style('fill', 'none');


            // === Invisible boundaries used for selection ===
            sky.mapLayer.selectAll('.constellations-boundaries')
            .data(data.constellations.boundaries.features)
            .enter().append('path')
            .attr("class", "constellations-boundaries pointer")
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

            // === Constellation names ===
            sky.mapLayer.selectAll(".constellations-name")
            .data(data.constellations.infos.features)
            .enter().append("text")
            .attr('vector-effect', 'non-scaling-stroke')
            .attr("x", (d) => { return sky.projection(d.geometry.coordinates)[0]; })
            .attr("y", (d) => { return sky.projection(d.geometry.coordinates)[1]; })
            .text(function(d) { return d.properties.name; })
            .attr("class", "constellations-name pointer")
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

            // === Stars ===
            sky.mapLayer.selectAll(".stars")
            .data(data.stars.features).enter()
            .append("circle")
            .attr("cx", (d) => { return sky.projection(d.geometry.coordinates)[0]; })
            .attr("cy", (d) => { return sky.projection(d.geometry.coordinates)[1]; })
            .attr("r", (d) => { return 1/Math.exp(Number(d.properties.mag+2)/4)+"px" }) // sirius has the lowest magn : 1.5
            .attr("fill", "#c7f5ff")
            .attr('class', 'stars')

            // === Stars name ===
            sky.mapLayer.selectAll(".star-name")
            .data(data.stars.features.filter(c=>c.properties.name !== ''))
            .enter().append("text")
            .attr('vector-effect', 'non-scaling-stroke')
            .attr("x", (d) => { return sky.projection(d.geometry.coordinates)[0]+1; })
            .attr("y", (d) => { return sky.projection(d.geometry.coordinates)[1]-1; })
            .text(function(d) { return d.properties.name; })
            .attr("class",(d) => { return "star-name star-constellation-name-"+d.properties.con; })
            .style('display', 'none')
            .attr("id", (d)=>"star-name-"+d.id);

        },
        // call to zoom
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
        // call to move the whole sky
        move : (lat, lng) => {},
        // call to select a constellation by its id
        selectConstellation : (constellationId) => {
            let id = undefined;

            if(constellationId=== sky.state.selectedConstellation)
                return;

            if(constellationId !== undefined)
            {
                const constellation = data.getSkyElementById(constellationId);
                sky.zoomOnConstellation(constellation.boundaries);
                id = constellation.id;
            }

            sky.focusOnConstellation(id);

            if(sky.onEvents.onConstellationSelected)
                sky.onEvents.onConstellationSelected(id);
        },
        // call to select a star by its id
        selectStar : (starId) => {},
    }

    return d3Chart;
}

export default d3ChartFactory;
