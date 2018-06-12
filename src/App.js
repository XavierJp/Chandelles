import React, { Component } from 'react';
import InfoPane from './components/infoPane/infoPane'
import SearchBar from './components/search/searchBar'

import d3ChartFactory from './d3Chart/d3Chart';
import xhrFactory from './utils/xhr';
import dataFactory from './resources/data';


/** Chart wrapper ensure the smooth binding between D3 and React
* Some articles online advise to have D3 handling the MAth and React handling the DOM manipulation :
* - http://www.ahmadchatha.com/writings/article1.html
* - https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71
* BUT :
* I would rather have all the chart logic in a single js file:
* - If needed it will be easy to dissociate the d3 chart from the React app.
* - Not even sure React is faster at DOM manipulation
*
* REACT does not even handle the data. It si only an UI layer. It s the V in MVC
*/

const FETCHING = 'fetching data from wikipedia...';
const ERROR = 'Cannot find element on wikipedia.';
const WIKI_URL_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const WIKI_URL_MAIN = 'https://en.wikipedia.org/wiki/';

/**
* APP is the main react component and the only one with a state
**/

class App extends Component {
    constructor() {
        super();

        this.data = dataFactory();

        this.state = {
            selectedConstellation : { id: undefined },
            chart: undefined,
            chartCentered : true,
            content : FETCHING,
            searchResults : [],
            lat: 0,
            lng: 0,
        };

        this.searchElement = this.searchElement.bind(this);
    }

    // retreive data from wikipedia - constellation only so far
    fetchWiki (constellation) {
        if (constellation.id === undefined) {
            this.setState({content : FETCHING});
            return;
        }

        const wikiXhr = xhrFactory();
        const urlSummary = `${WIKI_URL_SUMMARY}${constellation.name}_(constellation)`;
        const targetUrl = `${WIKI_URL_MAIN}${constellation.name}_(constellation)`;

        wikiXhr.init(urlSummary)
            .send()
            .then(
                (response)=>this.setState({content : JSON.parse(response).extract, targetUrl:targetUrl}),
                (error)=> this.setState({content : ERROR})
            )
    }

    // search element (based on its id)
    searchElement(elemId) {
        this.setState({searchResults : elemId ? this.data.search(elemId) : []});
    }

    componentDidMount() {

        // define actions to be triggered on Events
        const chartOpts = {
            onConstellationSelected : (id)=> {
                const cons = this.data.getSkyElementById(id);
                this.setState(
                    {selectedConstellation:cons},
                    ()=>this.fetchWiki(cons)
                );
            },
            onMove : () => {
                this.setState({chartCentered:this.state.chart.isCentered()})
            }
        }

        // draw chart
        this.setState(
            {chart:d3ChartFactory('#chart-container', chartOpts)},
            ()=>{
                this.state.chart.draw(this.state.chartState);
            }
        );

        navigator.geolocation.getCurrentPosition(
            (position) => this.setState({lat:position.coords.latitude,
                lng:position.coords.longitude}),
            (err)=>console.log(err))
    }

    render() {
        return (
            <div className="background">
                <SearchBar
                    select={(id)=>this.state.chart.selectConstellation(id)}
                    search={this.searchElement}
                    results={this.state.searchResults}/>
                <ChartContainer />
                { this.state.selectedConstellation.id && this.state.chart &&
                    <InfoPane
                        selectedItem={this.state.selectedConstellation}
                        deSelect={()=>this.state.chart.selectConstellation()}
                        content={this.state.content}
                        targetUrl={this.targetUrl}/>
                }
                <Location />
                { this.state.chart &&  !this.state.chartCentered &&
                    <Recenter reCenter={()=>this.state.chart.reCenter()}/>
                }
            </div>
            );
    }
}

const ChartContainer = () => {
    return (
        <div id="chart-container"></div>
    )
}

const Recenter = (props) => {
    return (
        <div id="recenter-button" className="pointer" onClick={props.reCenter}>&#9737;</div>
    )
}

const Location = () => {
    return (
        <div id="location">Projection : Paris, France</div>
    )
}

export default App;
