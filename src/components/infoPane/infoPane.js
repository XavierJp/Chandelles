import './infoPane.css';

import React from 'react';


/**
* Simple React component that display info on the selected star / constellation
**/

const InfoPane= (props) => {
    return (
        <div id="info-pane" style={{ display: props.selectedItem ? 'initial' : 'none'}}>
            <div id="info-pane-title">{props.selectedItem}</div>
            <div id="info-pane-content">bla bla bal Andromeda bla bla bal</div>
        </div>
    );
}

export default InfoPane;
