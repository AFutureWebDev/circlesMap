export const loadAndProcessData = () =>
Promise.all([
    d3.csv('2019pop.csv'), 
    d3.json('https://unpkg.com/visionscarto-world-atlas@0.0.4/world/50m.json')
]).then(([unData, topoJSONdata]) => {
    console.log(unData)
    
    //Using reduce to get the country name to show on hover (Cleaner approach)
    const rowById = unData.reduce((accumulator, d) => {
        accumulator[d['Country code']] = d;
        return accumulator;
    }, {});

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

    countries.features.forEach(d => {
        Object.assign(d.properties, rowById[+d.id]);
    });
    const featureWithPopulation = countries.features
        .filter(d => d.properties['2020'])
        .map(d => {
            d.properties['2020'] = +d.properties['2020'].replace(/ /g, '') * 1000;
            return d;
        });

    return {
        features: countries.features,
        featureWithPopulation
    };
});