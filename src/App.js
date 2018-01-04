import React, { Component } from 'react';
import InfoPane from './components/infoPane/infoPane'
import SearchBar from './components/searchBar/searchBar'

import d3ChartFactory from './d3Chart/d3Chart';


/** Chart wrapper ensure the smooth binding between D3 and React
* Some articles online advise to have D3 handling the MAth and React handling the DOM manipulation :
* - http://www.ahmadchatha.com/writings/article1.html
* - https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71
* BUT :
* I would rather have all the chart logic in a single js file:
* - If needed it will be easy to dissociate the d3 chart from the React app.
* - It is the way I use D3 best
* - Not even sure React is faster at DOM manipulation
*
* REACT does not even handle the data. IT si only an interface layer. It s the V in MVC
*/

class App extends Component {
    constructor() {
        super();

        this.state = {
            selectedConstellation : undefined,
            chart: undefined
        };
    }

    componentDidMount() {
        const chartIntialState = {
                selectedConstellation : undefined,
                selectedStar : undefined,
                zoom : 1,
                position : [0,0],
            };

        const chartOpts = {
            onConstellationSelected : (id)=> this.setState({selectedConstellation:id}),
        }

        this.setState({chart:d3ChartFactory('#chart-container', chartOpts)},
            ()=>{
                this.state.chart.draw(this.state.chartState);
            });

        /**
            chart exposes several methods :
            Draw(hook, initialState)
            SelectStar(starId)
            SelectConstellation(constellationId)
            Move(lat,long)
            Zoom(in/out, lat, long)
            GetState()

            AND takes several input :
            onStarSelected()
            onConstellationSelected()
            onZoom()
            onMove()
        **/
    }

    render() {
        return (
            <div className="background">
                <SearchBar select={(id)=>this.state.chart.selectConstellation(id)}/>
                <div id="chart-container"></div>
                <InfoPane selectedItem={this.state.selectedConstellation} />
            </div>
            );
    }
}

export default App;
