import dataFactory from '../../resources/data';

/** basic implem of the search engine.
* Entirely text based
* Constellations only for now
**/
const data = dataFactory();

const searchFactory = () => {

    const constellations = data.constellations.infos.features.map(cons=> {
        return {
            id : cons.id,
            descr: cons.properties.name
        };
    })

    const self = {
        search : (item) => {
            const searchItem = item.toLowerCase();
            return constellations.reduce((acc, el)=> {
                if(el.descr.toLowerCase().indexOf(searchItem) >= 0)
                    acc.push(el);
                return acc;
            }, []);
        }
    }
    return self;
}

export default searchFactory;
