import {loadAndProcessData} from './loadAndProcessData.js';
import {sizeLegend} from './sizeLegend.js';

const svg = d3.select("svg");

const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);
const radiusValue = d => d.properties['2020']

const g = svg.append('g');

const colorLegendG = svg.append('g')
    .attr('transform', `translate(30, 300)`);

g.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: "Sphere"}));

svg.call(d3.zoom().on('zoom', () => {
    g.attr('transform', d3.event.transform);
}))

//If you access income_grp instead of economy, you can see a map of income in different countries
const colorValue = d => d.properties.economy;

const populationFormat = d3.format(',');

loadAndProcessData().then(countries => {
    
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(countries.features, radiusValue)])
        .range([0, 33]);

     g.selectAll('path').data(countries.features)
        .enter().append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator) 
            .attr('fill', d => d.properties['2020'] ? '#e8e8e8' : '#fecccc')
        .append('title')
            .text(d => isNaN(radiusValue(d))
            ? 'Missing Data'
            : [
                d.properties['Region, subregion, country or area *'],
                populationFormat(radiusValue(d))
            ].join(': '));

    countries.featureWithPopulation.forEach(d => {
       d.properties.projected = projection(d3.geoCentroid(d));
    });

    g.selectAll('circle').data(countries.featureWithPopulation)
        .enter().append('circle')
            .attr('class', 'country-circle')
            .attr('cx', d =>  d.properties.projected[0])
            .attr('cy', d =>  d.properties.projected[1])
            .attr('r', d => sizeScale(radiusValue(d)));


    g.append('g')
        .attr('transform', `translate(55, 215)`)
        .call(sizeLegend, {
            sizeScale,
            spacing: 45,
            textOffset: 10,
            numTicks: 5,
            tickFormat: populationFormat
    })

    .append('text')
        .attr('class', 'legend-title')
        .text('Population')
        .attr('y', -50)
        .attr('x', -30)
});

