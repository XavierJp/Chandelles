import React, { Fragment, Component } from 'react';
import './searchBar.css';
import { timeout } from 'd3-timer';

/**
* Search bar
**/
class SearchBar extends Component {
    constructor() {
        super();

        this.textInput = '';
        this.state = {open:false};
    }

    selectAndClearInput = (id) => {
        if (this.props.select) {
            this.props.select(id);
        }
        this.selfClose();
        this.clearInput();
    }

    clearInput = () => {
        this.textInput.value = '';
        this.props.search();
    }

    selfOpen = (e) => {
        e.stopPropagation();
        //this.searchBar.classList.add('active');
        this.openAimation();
        setTimeout(()=>this.resultPane.classList.add('active'), 100);
        //this.searchBar.addEventListener('mouseDown', this.stopProp);          
        //this.resultPane.addEventListener('mouseDown', this.stopProp);          
        window.addEventListener('mouseDown', this.selfClose); 
    }
    
    selfClose = (e) => {
        this.resultPane.classList.remove('active');
        setTimeout(()=>this.searchBar.classList.remove('active'), 100);
        window.removeEventListener('mouseDown', this.selfClose);  
        this.searchBar.removeEventListener('mouseDown', this.stopProp);          
        this.resultPane.removeEventListener('mouseDown', this.stopProp); 
        
    }

    stopProp = (e) => {
        if (e.type==='click') {
            e.stopPropagation();
        }
    }

    selfPreActivate = () => {
        //this.searchBar.classList.add('pre-active');
    }

    selfDeActivate = () => {
            this.searchBar.classList.remove('pre-active');
    }

    openAimation = () => {
        this.searchBar.animate(
        [{
            left:'-220px',
            borderRadius:'40px',
        },
        {
            left:'10px',
            borderRadius:'5px',
        }], 
        {
            duration:200, 
            fill:'forwards',
            easing:'ease-out',
        });
        setTimeout(()=>{
            this.searchBar.style.background='transparent';
            this.textInput.style.visibility= 'visible';
        },200)
    }


    render() {
        const { results, search } = this.props;
        return (
            <Fragment
            >
                <div 
                className="search-bar" 
                ref={bar=> this.searchBar = bar} 
                onMouseEnter={this.selfPreActivate}
                onMouseLeave={this.selfDeActivate}
                onClick={this.selfOpen}                
                >
                    <input
                        ref={(input) => this.textInput = input }
                        type="text"
                        placeholder="Search in the sky"
                        onChange={()=>search(this.textInput.value)}/>
                </div>
                <div className="result-pane" ref={pane=> this.resultPane = pane}>
                { results.length > 0 &&
                    <SearchResultContainer select={this.selectAndClearInput} results={results}/>
                }
                </div>
                </Fragment>
        );
    }
}

const SearchResultContainer = (props) => {
    return <div className="result-container">
        {
            props.results.map((result,index)=> {
                return (
                <Fragment>
                    {index > 0 &&

                        <div className="separator">
                <div></div>
                <div>&#x25cb;</div>
                <div></div>
            </div>
                    }
            <SearchResultItem
                        key={`${result.name.trim()}-${result.id}`}
                        select={()=>props.select(result.id)}
                        result={result} />
                        </Fragment>)
            })
        }
    </div>
}

const SearchResultItem = (props) => {
    return <div className="result-item pointer" onClick={props.select}>{props.result.name}</div>
}

export default SearchBar;
