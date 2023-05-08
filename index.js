import {
  csv,
  select,
  selectAll,
  scaleLinear,
  json,
  geoAlbersUsa,
} from 'd3';
import { feature } from 'topojson';
import { menu } from './menu';
const width = window.innerWidth;
const height = window.innerHeight;

const svg = select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);


const menuContainer = select('body')
  .append('div')
  .attr('class', 'menu-container');
const xMenu = menuContainer.append('div');
//const yMenu = menuContainer.append('div');
// Define the target date for filtering
let targetDate = new Date("2017/1/1");

const targetDates = [
  new Date("2017/1/1"),
  new Date("2017/4/1"),
  new Date("2017/7/1"),
  new Date("2017/10/1"),
  new Date("2018/1/1")
];


                        


// Filter the data based on the target date
// let dateData = data.filter(function(d) {
//   return d.date.getTime() === targetDate.getTime();
// });

const projection = d3
  .geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(width);
const path = d3.geoPath().projection(projection);

var radiusScale = d3.scaleLinear()
  .domain([0, 31000]) 
  .range([10, 100]);

json(
  'https://unpkg.com/us-atlas@3.0.0/states-10m.json'
).then((us) => {
  // Converting the topojson to geojson.
  console.log(us);
  const us1 = feature(us, us.objects.states);
  svg
    .append('g')
    .selectAll('path')
    .data(us1.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('fill', '#ccc')
    .style('stroke', '#fff')
    .style('stroke-width', '0.5px');
    const options = [
    { value: 'Leaver_Flow', text: 'Leaver Flow' },
    { value: 'Incomer_Flow', text: 'Incomer Flow' },
      { value: 'clear_map', text: 'Clear Map' },

  ];

   let slider = document.getElementById('dateSlider1');

//const slider = d3.select("#dateSlider");
console.log(slider);
slider.addEventListener('change', function (){
const index = parseInt(this.value); 
  console.log(this.value);
  const newDate = targetDates[index]; 
console.log(newDate);});
  
  d3.select("#dateSlider")
  .on("input", function() {
    console.log(this.value);
  });
  
  // menuContainer.call(menu());
  xMenu.call(
    menu()
      .id('x-menu')
      .labelText('Flow Options:  ')
      .options(options)
      .on('change', (column) => {
        // console.log('in index.js');
        console.log(column);
        if (column === 'Leaver_Flow') {
          selectAll('.line-leaver').remove();
          selectAll('.line-incomer').remove();
          selectAll('.flowtext').remove();
          selectAll('.city-clicked').remove();
          selectAll('.des-circle').remove();
          selectAll('.ori-circle').remove();
          selectAll('.city-name').remove();
          selectAll('.city').remove();
          svg.call(updateLeaverFlow);
        } else if (column === 'Incomer_Flow') {
          selectAll('.line-leaver').remove();
          selectAll('.line-incomer').remove();
          selectAll('.flowtext').remove();
          selectAll('.city-clicked').remove();
          selectAll('.des-circle').remove();
          selectAll('.ori-circle').remove();
          selectAll('.city-name').remove();
          selectAll('.city').remove();
          svg.call(updateIncomerFlow);
        } else if (column === 'clear_map') {
          selectAll('.line-leaver').remove();
          selectAll('.line-incomer').remove();
          selectAll('.flowtext').remove();
          selectAll('.city-clicked').remove();
          selectAll('.des-circle').remove();
          selectAll('.ori-circle').remove();
          selectAll('.city-name').remove();
          selectAll('.city').remove();
        }
        //svg.call(plot.xValue((d) => d[column]));
      })
  );
  //date,origin,dest,pct_leavers,netflow,origin_lat,origin_lon,dest_lat,dest_lon,origin_city,dest_city
    function updateIncomerFlow(){
    csv('clean_dest_incomers.csv', (d) => {
    return {
      date: new Date(d.date),
      pct_incomers: d.pct_incomers,
      //pct_leavers : parseFloat(d.pct_leavers.replace('%', '')),
      netflow: +d.netflow,
      origin_lat: +d.origin_lat,
      origin_lon: +d.origin_lon,
      dest_lat: +d.dest_lat,
      dest_lon: +d.dest_lon,
      origin_city: d.origin_city,
      dest_city: d.dest_city,
    };
  }).then((cities) => {
    // const scaleRadius = scaleLinear()
    //   .domain([0, d3.max(cities, (d) => d.flow)])
    //   .range([2, 20]);
    console.log(cities);
    const oneDateCitiesData = cities.filter((d) => d.date.getTime() === targetDate.getTime());
    // Draw the cities
    
    let cityCircles = svg
      .selectAll('circle')
      .data(oneDateCitiesData)
      .enter()
      .append('circle')
      .attr('class', 'city')
      .attr('cx', (d) => {
        return projection([
          d.dest_lon,
          d.dest_lat,
        ])[0];
      })
      .attr('cy', (d) => {
        return projection([
          d.dest_lon,
          d.dest_lat,
        ])[1];
      })
      .attr('r', 5)
      .style('fill', 'pink')
      .style('stroke', '#fff')
      .style('stroke-width', '1px')
      .on('mouseover', function (d) {
        //console.log(d);
        console.log(
          d.srcElement.__data__.netflow
        );
        //selectAll('.flowtext').remove();
        d3.select(this)
          .transition()
          .duration(200)
          //.attr('r', 10)
          .attr(
            'r',
            rData => {
            if (d.srcElement.__data__.netflow>=0) {return radiusScale(d.srcElement.__data__.netflow*0.5);} 
                else {
                return radiusScale(-d.srcElement.__data__.netflow *0.5);}}
          )
          .style('fill', 'blue');
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .transition()
          .attr('r', 5)
          .style('fill', 'pink');
      })
      .on('click', function (d) {
        console.log(d);
        console.log(
          d.srcElement.__data__.netflow
        );
        selectAll('.line-incomer').remove();
        selectAll('.flowtext').remove();
        selectAll('.city-clicked').remove();
        selectAll('.ori-circle').remove();
        selectAll('.city-name').remove();
        let clickedCity = select(this);

        // console.log(clickedCity);
        // const curve = d3.line().curve(d3.curveNatural);
        const newCircle = svg
          .append('circle')
          .attr('class', 'city-clicked')
          .attr('cx', clickedCity.attr('cx'))
          .attr('cy', clickedCity.attr('cy'))
          .attr('r', rData => {
            if (d.srcElement.__data__.netflow>=0) {return radiusScale(d.srcElement.__data__.netflow*0.5);} 
                else {
                return radiusScale(-d.srcElement.__data__.netflow *0.5);}}) // Adjust the scaling factor as needed for the clicked state
          .style('fill', 'purple')
          .style('stroke', '#fff')
          .style('stroke-width', '1px')
          .style('opacity', 0.7);

        //Remove the clicked circle
        //clickedCity.remove();
        //console.log(clickedCity);
        const text = svg
          .append('text')
          .attr('x', d.x)
          .attr('y', d.y)
          .attr('class', 'flowtext')
          .attr('font-size', 20)
          .attr('fill', 'red')
          .text(d.srcElement.__data__.netflow);
        let clickedCityCoords = [
          parseFloat(clickedCity.attr('cx')),
          parseFloat(clickedCity.attr('cy')),
        ];
        console.log(oneDateCitiesData);
        let filteredCities = oneDateCitiesData.filter(
          function (oneDateCitiesData) {
            return (
              d.srcElement.__data__
                .dest_city ===
              oneDateCitiesData.dest_city
            );
          }
        );
        console.log(filteredCities);

        svg
          .selectAll('line-incomer')
          .data(filteredCities)
          .enter()
          .append('path')
          .attr('d', function (d) {
            let curve = d3.curveBundle.beta(0.05);

            // Create the line generator
            let lineGenerator = d3
              .line()
              .x(function (d) {
                return d[0];
              })
              .y(function (d) {
                return d[1];
              })
              .curve(curve);
            let origin = projection([
              d.origin_lon,
              d.origin_lat,
            ]);
            let destination = projection([
              d.dest_lon,
              d.dest_lat,
            ]);
            let midPoint = [
              (origin[0] + destination[0]) / 3,
              (origin[1] + destination[1]) / 3,
            ];
            let midPoint1 = [
              (origin[0] + destination[0])*2 / 3,
              (origin[1] + destination[1])*2 / 3,
            ];
            let lineData = [
              origin,
              midPoint,
              midPoint1,
              destination
            ];
            //console.log(lineData);
            return lineGenerator(lineData);
          })
          .attr('class', 'line-incomer')
          .style('stroke', 'purple')
          .style(
            'stroke-width',
            (d) => {
              //console.log(d);
          return parseFloat(d.pct_incomers.replace("%", ""))}
          )
          .style('opacity', 0.6)
          .attr('fill', 'none');
        //console.log(lineData);
        const ori_cities = svg
          .selectAll('.ori-circle')
          .data(filteredCities)
          .enter()
          .append('circle')
          .attr('cx', function (d) {
            return projection([
              d.origin_lon,
              d.origin_lat,
            ])[0];
          })
          .attr('cy', function (d) {
            return projection([
              d.origin_lon,
              d.origin_lat,
            ])[1];
          })
          .attr('r', 5)
          .attr('class', 'ori-circle')
          .style('fill', 'red')
          .style('stroke', '#fff')
          .style('stroke-width', '1px')
          .on('click', function (mouseD) {
            console.log(mouseD);
            const citynametext = svg
              .append('text')
              .attr('x', mouseD.x)
              .attr('y', mouseD.y)
              .attr('class', 'city-name')
              .attr('font-size', 10)
              .attr('fill', 'blue')
              .text(
                `City: ${mouseD.srcElement.__data__.origin_city}, Pct of Incomers: ${mouseD.srcElement.__data__.pct_incomers}`
              );
          });
      });
  });}
  function updateLeaverFlow(){
    csv('clean_origin_leavers.csv', (d) => {
    return {
      date: new Date(d.date),
      pct_leavers: d.pct_leavers,
      //pct_leavers : parseFloat(d.pct_leavers.replace('%', '')),
      netflow: +d.netflow,
      origin_lat: +d.origin_lat,
      origin_lon: +d.origin_lon,
      dest_lat: +d.dest_lat,
      dest_lon: +d.dest_lon,
      origin_city: d.origin_city,
      dest_city: d.dest_city,
    };
  }).then((cities) => {
    // const scaleRadius = scaleLinear()
    //   .domain([0, d3.max(cities, (d) => d.flow)])
    //   .range([2, 20]);
    console.log(cities);
    const oneDateCitiesData = cities.filter((d) => d.date.getTime() === targetDate.getTime());
    // Draw the cities
    
    let cityCircles = svg
      .selectAll('circle')
      .data(oneDateCitiesData)
      .enter()
      .append('circle')
      .attr('class', 'city')
      .attr('cx', (d) => {
        return projection([
          d.origin_lon,
          d.origin_lat,
        ])[0];
      })
      .attr('cy', (d) => {
        return projection([
          d.origin_lon,
          d.origin_lat,
        ])[1];
      })
      .attr('r', 5)
      .style('fill', 'gold')
      .style('stroke', '#fff')
      .style('stroke-width', '1px')
      .on('mouseover', function (d) {
        //console.log(d);
        console.log(
          d.srcElement.__data__.netflow
        );
        //selectAll('.flowtext').remove();
        d3.select(this)
          .transition()
          .duration(200)
          //.attr('r', 10)
          .attr(
            'r',
            rData => {
            if (d.srcElement.__data__.netflow>=0) {return radiusScale(d.srcElement.__data__.netflow*0.5);} 
                else {
                return radiusScale(-d.srcElement.__data__.netflow *0.5);}}
          )
          .style('fill', 'blue');
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .transition()
          .attr('r', 5)
          .style('fill', 'gold');
      })
      .on('click', function (d) {
        console.log(d);
        console.log(
          d.srcElement.__data__.netflow
        );
        selectAll('.line-leaver').remove();
        selectAll('.flowtext').remove();
        selectAll('.city-clicked').remove();
        selectAll('.des-circle').remove();
        selectAll('.city-name').remove();
        let clickedCity = select(this);

        // console.log(clickedCity);
        // const curve = d3.line().curve(d3.curveNatural);
        const newCircle = svg
          .append('circle')
          .attr('class', 'city-clicked')
          .attr('cx', clickedCity.attr('cx'))
          .attr('cy', clickedCity.attr('cy'))
          .attr('r', rData => {
            if (d.srcElement.__data__.netflow>=0) {return radiusScale(d.srcElement.__data__.netflow*0.5);} 
                else {
                return radiusScale(-d.srcElement.__data__.netflow *0.5);}}) // Adjust the scaling factor as needed for the clicked state
          .style('fill', 'green')
          .style('stroke', '#fff')
          .style('stroke-width', '1px')
          .style('opacity', 0.7);

        //Remove the clicked circle
        //clickedCity.remove();
        //console.log(clickedCity);
        const text = svg
          .append('text')
          .attr('x', d.x)
          .attr('y', d.y)
          .attr('class', 'flowtext')
          .attr('font-size', 20)
          .attr('fill', 'red')
          .text(d.srcElement.__data__.netflow);
        let clickedCityCoords = [
          parseFloat(clickedCity.attr('cx')),
          parseFloat(clickedCity.attr('cy')),
        ];
        console.log(oneDateCitiesData);
        let filteredCities = oneDateCitiesData.filter(
          function (oneDateCitiesData) {
            return (
              d.srcElement.__data__
                .origin_city ===
              oneDateCitiesData.origin_city
            );
          }
        );
        console.log(filteredCities);

        svg
          .selectAll('line-leaver')
          .data(filteredCities)
          .enter()
          .append('path')
          .attr('d', function (d) {
            let curve = d3.curveBundle.beta(0.05);

            // Create the line generator
            let lineGenerator = d3
              .line()
              .x(function (d) {
                return d[0];
              })
              .y(function (d) {
                return d[1];
              })
              .curve(curve);
            let origin = projection([
              d.origin_lon,
              d.origin_lat,
            ]);
            let destination = projection([
              d.dest_lon,
              d.dest_lat,
            ]);
            let midPoint = [
              (origin[0] + destination[0]) / 3,
              (origin[1] + destination[1]) / 3,
            ];
            let midPoint1 = [
              (origin[0] + destination[0])*2 / 3,
              (origin[1] + destination[1])*2 / 3,
            ];
            let lineData = [
              origin,
              midPoint,
              midPoint1,
              destination
            ];
            console.log(lineData);
            return lineGenerator(lineData);
          })
          .attr('class', 'line-leaver')
          .style('stroke', 'green')
          .style(
            'stroke-width',
            (d) => {
              console.log(d);
          return parseFloat(d.pct_leavers.replace("%", ""))}
          )
          .style('opacity', 0.6)
          .attr('fill', 'none');

        const des_cities = svg
          .selectAll('.des-circle')
          .data(filteredCities)
          .enter()
          .append('circle')
          .attr('cx', function (d) {
            return projection([
              d.dest_lon,
              d.dest_lat,
            ])[0];
          })
          .attr('cy', function (d) {
            return projection([
              d.dest_lon,
              d.dest_lat,
            ])[1];
          })
          .attr('r', 5)
          .attr('class', 'des-circle')
          .style('fill', 'red')
          .style('stroke', '#fff')
          .style('stroke-width', '1px')
          .on('click', function (mouseD) {
            console.log(mouseD);
            const citynametext = svg
              .append('text')
              .attr('x', mouseD.x)
              .attr('y', mouseD.y)
              .attr('class', 'city-name')
              .attr('font-size', 10)
              .attr('fill', 'blue')
              .text(
                `City: ${mouseD.srcElement.__data__.dest_city}, Pct of Leavers: ${mouseD.srcElement.__data__.pct_leavers}`
              );
          });
      });
  });}
});

// csv("citydata.csv").then(cities => {

//     // Draw the cities
//     svg.append("g")
//       .selectAll("circle")
//       .data(cities)
//       .enter()
//       .append("circle")
//       .attr("class", "city")
//       .attr("cx", d => { return projection([d.lon, d.lat])[0]; })
//       .attr("cy", d => { return projection([d.lon, d.lat])[1]; })
//       .attr("r", 5)
//       .style("fill", "red")
//       .style("stroke", "#fff")
//       .style("stroke-width", "1px")
//       .on("mouseover", function(d) {
//         d3.select(this)
//           .transition()
//           .duration(200)
//           .attr("r", 10)
//           .style("fill", "blue");
//       })
//       .on("mouseout", function(d) {
//         d3.select(this)
//           .transition()
//           .duration(200)
//           .attr("r", 5)
//           .style("fill", "red");
//       })
//       .on("click", function(d) {
//         //console.log(d.name + " (" + d.lat + ", " + d.lon + ")");
//       console.log(d.srcElement.__data__);

//       });
//   });
