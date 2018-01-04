//import d3Chart from './d3Chart';
import React, { Component } from 'react';
import './searchBar.css';
import searchFactory from './searchCore';

/**
* Search bar
**/

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.textInput = '';

        this.state = {
            searchEngine : searchFactory(),
            searchResults : [],
            inputText:''
        };

        this.updateSearch = this.updateSearch.bind(this);
        this.selectAndClearInput = this.selectAndClearInput.bind(this);
    }

    // work on component will update and a better handle on ref vs onChange
    updateSearch() {
        const val = this.textInput.value;
        this.setState({
            searchResults : val ? this.state.searchEngine.search(val) : []
        });
    }

    selectAndClearInput(id) {
        this.textInput.value = '';
        this.props.select(id);
        this.updateSearch();
    }

    render() {
        return (
            <div id="search-bar">
                <input
                    ref={(input) => this.textInput = input }
                    type="text"
                    placeholder="Search a constellation or star"
                    onChange={()=>this.updateSearch()}/>
                <SearchResultContainer select={this.selectAndClearInput} results={this.state.searchResults}/>
            </div>
        );
    }
}

const SearchResultContainer = (props) => {
    return <div id="result-container">
        {
            props.results.map(result=> {
                return <SearchResultItem
                        key={result.descr}
                        select={()=>props.select(result.id)}
                        result={result} />
            })
        }
    </div>
}

const SearchResultItem = (props) => {
    return <div className="result-item" onClick={props.select}>{props.result.descr}</div>
}

export default SearchBar;
