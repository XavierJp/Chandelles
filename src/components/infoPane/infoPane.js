import './infoPane.css';
import React from 'react';

/**
* Simple React component that display info on the selected star / constellation
**/

const InfoPane = (props) => {
    return (
        <div id="info-pane">
            <div id="info-pane-title">
                {props.selectedItem.name}
                <span onClick={props.deSelect} id="info-pane-kill" className="pointer">&#9587;</span>
            </div>
            <div id="info-pane-content">
                {props.content}
            </div>
        </div>
    );
}

export default InfoPane;
