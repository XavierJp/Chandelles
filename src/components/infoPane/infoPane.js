import './infoPane.css';
import React, { Component } from 'react';

const xhrFactory = () => {
    const xhr = new XMLHttpRequest();
    let body = undefined;
    const self = {
        init : function (url, verb) {
            xhr.open(verb || 'GET', url)
            return this;
        },
        body : function (b) {
            body = b;
            return this;
        },
        header: function (headers) {
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
            return this;
        },
        send : function () {
            return new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(xhr.statusText);
                    }
                };
                xhr.onerror = () => reject(xhr.statusText);
                xhr.send(body);
            });
        }
    }

    return self;
};

const FETCHING = 'fetching data from wikipedia...';
const ERROR = 'Cannot find element on wikipedia.';
const WIKI_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
/**
* Simple React component that display info on the selected star / constellation
**/
class InfoPane extends Component {
    constructor() {
        super();
        this.state = { content : FETCHING}
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedItem.name === undefined)
            return;

        const wikiXhr = xhrFactory();
        const url = WIKI_URL+nextProps.selectedItem.name+'_(constellation)';
        wikiXhr.init(url)
            .send()
            .then(
                (response)=>this.setState({content : JSON.parse(response).extract}),
                (error)=> this.setState({content : ERROR})
            )
    }

    componentWillUnMount() {
        this.setState({content : FETCHING})
    }

    render() {
        const { selectedItem, stars, deSelect } = this.props;
        return (
            <div id="info-pane" style={{ display: selectedItem.name ? 'initial' : 'none'}}>
                <div id="info-pane-title">{selectedItem.name}<span onClick={deSelect} id="info-pane-kill">&#9587;</span></div>
                <div id="info-pane-content">
                    { stars &&
                        {stars}
                    }
                    {this.state.content}
                </div>
            </div>
        );
    }
}

export default InfoPane;
