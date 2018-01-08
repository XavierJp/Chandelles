//import d3Chart from './d3Chart';
import React, { Component } from 'react';
import './searchBar.css';

/**
* Search bar
**/

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.textInput = '';
        this.selectAndClearInput = this.selectAndClearInput.bind(this);
        this.clearInput = this.clearInput.bind(this);
    }

    selectAndClearInput(id) {
        this.props.select(id);
        this.clearInput();
    }

    clearInput() {
        this.textInput.value = '';
        this.props.search();
    }

    render() {
        const { results, search } = this.props;
        return (
            <div id="search-bar">
                <input
                    ref={(input) => this.textInput = input }
                    type="text"
                    placeholder="Search a constellation"
                    onChange={()=>search(this.textInput.value)}/>
                { results.length > 0 &&
                    <SearchResultContainer select={this.selectAndClearInput} results={results}/>
                }
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
    return <div className="result-item pointer" onClick={props.select}>{props.result.descr}</div>
}

export default SearchBar;
