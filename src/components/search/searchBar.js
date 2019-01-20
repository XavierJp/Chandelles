import React, { Fragment, Component } from 'react';
import './searchBar.css';

/**
* Search bar
**/
class SearchBar extends Component {
    constructor() {
        super();

        this.textInput = '';
        this.state = {
            opened:false, 
            preOpened:false,
        };
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
        if (this.state.opened) {
            return;
        }
        this.setState({opened:true},
            ()=> {
                console.log('open')
                this.animateOpen();
                this.searchBar.addEventListener('click', this.stopProp);          
                this.resultPane.addEventListener('click', this.stopProp);          
                window.addEventListener('click', () => this.selfClose()); 
            }
        )
    }
    
    selfClose = (e) => {
        console.log('hey')
        if (!this.state.opened) {
            return;
        }
        this.setState({opened:false},
            ()=> {
                this.animateClose();
                //this.searchBar.addEventListener('mouseDown', this.stopProp);          
                //this.resultPane.addEventListener('mouseDown', this.stopProp);          
                window.addEventListener('click', this.selfClose); 
            }
        )
    }

    stopProp = (e) => {
        if (e.type==='click') {
            e.stopPropagation();
        }
    }

    selfPreActivate = () => {
        if (!this.state.preOpened && !this.state.opened) {
            this.setState({preOpened:true},
               () => this.searchBar.classList.add('pre-active')
            )
        }
    }

    selfDeActivate = () => {
        if (this.state.preOpened && !this.state.opened) {
            this.setState({preOpened:false},
               () => this.searchBar.classList.remove('pre-active')
            )
        }
    }

    animateOpen = () => {
        this.searchBar.animate(
        [{
            left:'-220px',
        },
        {
            left:'10px',
        }], 
        {
            duration:150, 
            fill:'forwards',
            easing:'ease-in-out',
        });
        this.searchBar.animate(
            [{
                borderRadius:'40px',
                backgroundColor:'rgba(0,0,0,0.3)',
            },
            {
                borderRadius:'5px',
                backgroundColor:'rgba(0, 0, 0, 0.6)',
            }], 
            {
                duration:400, 
                fill:'forwards',
                easing:'ease-out',
                delay:150,
            });
        this.textInput.animate(
            [{
                visibility:'hidden',
                opacity:0,
            },
            {
                visibility:'visible',
                opacity:1
            }], 
            {
                duration:200, 
                fill:'forwards',
                easing:'ease-out',
                delay:550,
            });

        this.resultPane.animate(
            [{
                opacity:0,
            },
            {
                opacity:1,
            }], 
            {
                duration:600, 
                delay:200,
                fill:'forwards',
                easing:'ease-out',
            });
        setTimeout(()=>{
            this.searchBar.style.background='transparent';
        },550)
    }
    animateClose = () => {
        this.searchBar.animate(
            [{
                left:'10px',
            },
            {
                left:'-220px',
            }], 
            {
                duration:150,
                delay:50, 
                fill:'forwards',
                easing:'ease-in-out',
            });
            this.searchBar.animate(
                [{
                    borderRadius:'5px',
                    backgroundColor:'rgba(0, 0, 0, 0.6)',
                },
                {
                    borderRadius:'40px',
                    backgroundColor:'rgba(0,0,0,0.3)',
                }], 
                {
                    duration:150, 
                    fill:'forwards',
                    easing:'ease-out',
                });
            this.textInput.animate(
                [{
                    visibility:'visible',
                    opacity:1
                },
                {
                    visibility:'hidden',
                    opacity:0,
                }], 
                {
                    duration:150, 
                    fill:'forwards',
                    easing:'ease-out',
                });
    
            setTimeout(()=>{
                this.searchBar.style.background='initial';
            },150);

            this.resultPane.animate(
                [{
                    opacity:1,
                },
                {
                    opacity:0,
                }], 
                {
                    duration:150, 
                    delay:0,
                    fill:'forwards',
                    easing:'ease-out',
                });
    }

    render() {
        const { results, search } = this.props;
        return (
            <Fragment
            >
                <span onClick={this.selfClose} className="cross spin-hover">&#9587;</span>
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