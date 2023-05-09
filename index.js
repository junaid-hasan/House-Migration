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
const width = window.innerWidth - 5;
const height = window.innerHeight - 5;
const factor = 0.001;
let legendSvg = d3.select('#legend');
let bubble = false;

// legend colours and position
legendSvg
  .append('circle')
  .attr('cx', 210)
  .attr('cy', 18)
  .attr('r', 6)
  .style('fill', 'red')
  .style('opacity', 0.5);
legendSvg
  .append('circle')
  .attr('cx', 210)
  .attr('cy', 38)
  .attr('r', 6)
  .style('fill', 'blue')
  .style('opacity', 0.5);
legendSvg
  .append('text')
  .attr('x', 220)
  .attr('y', 18)
  .text('Positive net flow')
  .style('font-size', '16px')
  .attr('alignment-baseline', 'middle');
legendSvg
  .append('text')
  .attr('x', 220)
  .attr('y', 38)
  .text('Negative net flow')
  .style('font-size', '16px')
  .attr('alignment-baseline', 'middle');
legendSvg
  .append('rect')
  .attr('x', 395)
  .attr('y', 13)
  .attr('r', 6)
  .attr('width', 18)
  .attr('height', 8)
  .style('fill', 'purple')
  .style('opacity', 0.7);
legendSvg
  .append('rect')
  .attr('x', 395)
  .attr('y', 33)
  .attr('r', 6)
  .attr('width', 18)
  .attr('height', 8)
  .style('fill', 'green')
  .style('opacity', 0.7);
legendSvg
  .append('text')
  .attr('x', 420)
  .attr('y', 18)
  .text('Percentage of incomers moving to the city')
  .style('font-size', '16px')
  .attr('alignment-baseline', 'middle');
legendSvg
  .append('text')
  .attr('x', 420)
  .attr('y', 38)
  .text('Percentage of outgoers leaving from the city')
  .style('font-size', '16px')
  .attr('alignment-baseline', 'middle');

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
let targetDate = new Date('2017/1/1');
let combobox = 'Leaver_Flow';
// 21 quarters.
const targetDates = [
  new Date('2017/1/1'),
  new Date('2017/4/1'),
  new Date('2017/7/1'),
  new Date('2017/10/1'),
  new Date('2018/1/1'),
  new Date('2018/4/1'),
  new Date('2018/7/1'),
  new Date('2018/10/1'),
  new Date('2019/1/1'),
  new Date('2019/4/1'),
  new Date('2019/7/1'),
  new Date('2019/10/1'),
  new Date('2020/1/1'),
  new Date('2020/4/1'),
  new Date('2020/7/1'),
  new Date('2020/10/1'),
  new Date('2021/1/1'),
  new Date('2021/4/1'),
  new Date('2021/7/1'),
  new Date('2021/10/1'),
  new Date('2022/1/1'),
];

// Filter the data based on the target date
// let dateData = data.filter(function(d) {
//   return d.date.getTime() === targetDate.getTime();
// });

const clearButton = document.getElementById(
  'clearButton'
);
// clear button clears all
const handleClearButtonClick = function () {
  selectAll('.line-leaver').remove();
  selectAll('.line-incomer').remove();
  selectAll('.pos-bubble').remove();
  selectAll('.neg-bubble').remove();
  selectAll('.flowtext').remove();
  selectAll('.city-clicked').remove();
  selectAll('.des-circle').remove();
  selectAll('.ori-circle').remove();
  selectAll('.city-name').remove();
  selectAll('.city').remove();
  bubble=false;
      if (combobox === 'Leaver_Flow') {
      svg.call(updateLeaverFlow);
    } else if (combobox === 'Incomer_Flow') {
      svg.call(updateIncomerFlow);}
};
clearButton.addEventListener(
  'click',
  handleClearButtonClick
);
// starting season 
let season = 'Oct-Dec, 2016';

// USA MAP
const projection = d3
  .geoAlbersUsa()
  .translate([(width / 2)*1100*factor, (height / 2)*900*factor])
  .scale(850*width*factor);
const path = d3.geoPath().projection(projection);

let radiusScale = d3
  .scaleLinear()
  .domain([0, 31000])
  .range([10, 100]);

json(
  'https://unpkg.com/us-atlas@3.0.0/states-10m.json'
).then((us) => {
  // Converting the topojson to geojson.
  console.log(us);
  const us1 = feature(us, us.objects.states);
  let ini_dest_city = 'Seattle'; // our home city!
  let ini_origin_city = 'Seattle';
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
    { value: 'Leaver_Flow', text: 'Outgoer Flow' },
    {
      value: 'Incomer_Flow',
      text: 'Incomer Flow',
    },
    //{ value: 'clear_map', text: 'Clear Map' },
  ];
  const iniDate = svg
    .append('text')
    .attr('x', 400*width*factor) // can we make it relative and not absolute?
    .attr('y', 56*height*factor)	// so that it works on all devices?
    .attr('class', 'date-text')
    .attr('font-size', 22)
    .attr('fill', 'black')
    .text(
      `Period: ${season}`
    );
  let slider = document.getElementById(
    'dateSlider1'
  );

  //const slider = d3.select("#dateSlider");
  console.log(slider);
    const playButton = document.getElementById('playButton');
  let interval;
  let isPlaying = false;

  // Function to handle the automatic slider play
  const playSlider = () => {
    let value = parseInt(slider.value);
    const maxValue = parseInt(slider.max);

    interval = setInterval(() => {
      if (value >= maxValue) {
        slider.value = 0;
        stopSlider();
            isPlaying = false;
    playButton.textContent = 'Play';
        return;
      }
      targetDate = targetDates[value];
			console.log(targetDate);
      value++;
      slider.value = value;
      slider.dispatchEvent(new Event('input'));
    }, 500); 
  };

  // Function to stop the automatic slider play
const stopSlider = () => {
  clearInterval(interval);
};

  // Add event listener to the play button
  playButton.addEventListener('click', () => {
      if (isPlaying) {
    // Auto-play is already active, stop it
    stopSlider();
    isPlaying = false;
    playButton.textContent = 'Play';
  } else {
    // Auto-play is not active, start it
    playSlider();
    isPlaying = true;
    playButton.textContent = 'Stop';
  }
  });
  slider.addEventListener('input', function () {
    const index = parseInt(this.value);
    selectAll('.date-text').remove();

    const newDate = targetDates[index];
    targetDate = targetDates[index];
    console.log(targetDate);
    console.log(combobox);
		// date to human readable quarter
    if (
      targetDate.getTime() ===
      targetDates[0].getTime()
    ) {
      season = 'Oct-Dec, 2016';
    } else if (
      targetDate.getTime() ===
      targetDates[1].getTime()
    ) {
      season = 'Jan-Mar, 2017';
    } else if (
      targetDate.getTime() ===
      targetDates[2].getTime()
    ) {
      season = 'Apr-Jun, 2017';
    } else if (
      targetDate.getTime() ===
      targetDates[3].getTime()
    ) {
      season = 'Jul-Sep, 2017';
    } else if (
      targetDate.getTime() ===
      targetDates[4].getTime()
    ) {
      season = 'Oct-Dec, 2017';
    } else if (
      targetDate.getTime() ===
      targetDates[5].getTime()
    ) {
      season = 'Jan-Mar, 2018';
    } else if (
      targetDate.getTime() ===
      targetDates[6].getTime()
    ) {
      season = 'Apr-Jun, 2018';
    } else if (
      targetDate.getTime() ===
      targetDates[7].getTime()
    ) {
      season = 'Jul-Sep, 2018';
    } else if (
      targetDate.getTime() ===
      targetDates[8].getTime()
    ) {
      season = 'Oct-Dec, 2018';
    } else if (
      targetDate.getTime() ===
      targetDates[9].getTime()
    ) {
      season = 'Jan-Mar, 2019';
    } else if (
      targetDate.getTime() ===
      targetDates[10].getTime()
    ) {
      season = 'Apr-Jun, 2019';
    } else if (
      targetDate.getTime() ===
      targetDates[11].getTime()
    ) {
      season = 'Jul-Sep, 2019';
    } else if (
      targetDate.getTime() ===
      targetDates[12].getTime()
    ) {
      season = 'Oct-Dec, 2019';
    } else if (
      targetDate.getTime() ===
      targetDates[13].getTime()
    ) {
      season = 'Jan-Mar, 2020';
    } else if (
      targetDate.getTime() ===
      targetDates[14].getTime()
    ) {
      season = 'Apr-Jun, 2020';
    } else if (
      targetDate.getTime() ===
      targetDates[15].getTime()
    ) {
      season = 'Jul-Sep, 2020';
    } else if (
      targetDate.getTime() ===
      targetDates[16].getTime()
    ) {
      season = 'Oct-Dec, 2020';
    } else if (
      targetDate.getTime() ===
      targetDates[17].getTime()
    ) {
      season = 'Jan-Mar, 2021';
    } else if (
      targetDate.getTime() ===
      targetDates[18].getTime()
    ) {
      season = 'Apr-Jun, 2021';
    } else if (
      targetDate.getTime() ===
      targetDates[19].getTime()
    ) {
      season = 'Jul-Sep, 2021';
    } else if (
      targetDate.getTime() ===
      targetDates[20].getTime()
    ) {
      season = 'Oct-Dec, 2021';
    }

    const citynametext = svg
      .append('text')
      .attr('x', 400*width*factor) // relative position needed?
      .attr('y', 56*height*factor) // or absolute works?
      .attr('class', 'date-text')
      .attr('font-size', 22)
      .attr('fill', 'black')
      .text(
        `Period: ${season}`
      );

    if (bubble===true){
      selectAll('.line-leaver').remove();
      selectAll('.line-incomer').remove();
      selectAll('.pos-bubble').remove();
      selectAll('.neg-bubble').remove();
      selectAll('.flowtext').remove();
      selectAll('.city-clicked').remove();
      selectAll('.des-circle').remove();
      selectAll('.ori-circle').remove();
      selectAll('.city-name').remove();
      selectAll('.city').remove();
      svg.call(handleBubbleButtonClick);
    }else{
    if (combobox === 'Leaver_Flow') {
      // selectAll('.line-leaver').remove();
      // selectAll('.line-incomer').remove();
      selectAll('.pos-bubble').remove();
      selectAll('.neg-bubble').remove();
      selectAll('.flowtext').remove();
      // selectAll('.city-clicked').remove();
      // selectAll('.des-circle').remove();
      // selectAll('.ori-circle').remove();
      //selectAll('.city-name').remove();
      selectAll('.city').remove();
      svg.call(updateLeaverFlow);
    } else if (combobox === 'Incomer_Flow') {
      // selectAll('.line-leaver').remove();
      // selectAll('.line-incomer').remove();
      selectAll('.pos-bubble').remove();
      selectAll('.neg-bubble').remove();
      selectAll('.flowtext').remove();
      // selectAll('.city-clicked').remove();
      // selectAll('.des-circle').remove();
      // selectAll('.ori-circle').remove();
      //selectAll('.city-name').remove();
      selectAll('.city').remove();
      svg.call(updateIncomerFlow);
    }}
  });



  const bubbleButton = document.getElementById(
    'bubbleButton'
  );
    const leaverButton = document.getElementById(
    'leaverButton'
  );
    const incomerButton = document.getElementById(
    'incomerButton'
  );

  const handleBubbleButtonClick = function () {
    selectAll('.line-leaver').remove();
    selectAll('.line-incomer').remove();
    selectAll('.pos-bubble').remove();
    selectAll('.neg-bubble').remove();
    selectAll('.flowtext').remove();
    selectAll('.city-clicked').remove();
    selectAll('.des-circle').remove();
    selectAll('.ori-circle').remove();
    selectAll('.city-name').remove();
    selectAll('.city').remove();
    console.log(targetDate);
    console.log(combobox);
    //date,city,state,netflow,lat,lon
    bubble = true;
    csv('clean_netflow.csv', (d) => {
      return {
        date: new Date(d.date),
        city: d.city,
        netflow: +d.netflow,
        lat: +d.lat,
        lon: +d.lon,
      };
    }).then((cities) => {
      const oneDateCitiesData = cities.filter(
        (d) =>
          d.date.getTime() ===
          targetDate.getTime()
      );
      const positiveBubble = oneDateCitiesData.filter(
        (d) => d.netflow >= 0
      );
      const negativeBubble = oneDateCitiesData.filter(
        (d) => d.netflow < 0
      );
      console.log(positiveBubble);
      let cityCircles1 = svg
        .selectAll('.neg-bubble')
        .data(negativeBubble)
        .enter()
        .append('circle')
        .attr('class', 'neg-bubble')
        .attr('cx', (d) => {
          return projection([d.lon, d.lat])[0];
        })
        .attr('cy', (d) => {
          return projection([d.lon, d.lat])[1];
        })
        .attr('r', (d) => {
          if (d.netflow < 0) {
            return radiusScale(-d.netflow * 0.5);
          }
        })
        .style('fill', 'blue')
        .style('stroke', '#fff')
        .style('stroke-width', '1px')
        .style('opacity', 0.5)
        .on('mouseover', function (mouseD) {
          console.log(mouseD);
          const citynametext = svg
            .append('text')
            .attr('x', 640*width*factor) // can this also be made relative position
            .attr('y', 27*height*factor) // can this also be made relative position
            .attr('class', 'city-name')
            .attr('font-size', 18)
            .attr('fill', 'black')
            .text(
              `${mouseD.srcElement.__data__.city}: ${mouseD.srcElement.__data__.netflow} `
            );
        })
        .on('mouseout', function (mouseD) {
          selectAll('.city-name').remove();
        });
      let cityCircles = svg
        .selectAll('.pos-bubble')
        .data(positiveBubble)
        .enter()
        .append('circle')
        .attr('class', 'pos-bubble')
        .attr('cx', (d) => {
          return projection([d.lon, d.lat])[0];
        })
        .attr('cy', (d) => {
          return projection([d.lon, d.lat])[1];
        })
        .attr('r', (d) => {
          if (d.netflow >= 0) {
            return radiusScale(d.netflow * 0.5);
          }
        })
        .style('fill', 'red')
        .style('stroke', '#fff')
        .style('stroke-width', '1px')
        .style('opacity', 0.5)
        .on('mouseover', function (mouseD) {
          console.log(mouseD);
          const citynametext = svg
            .append('text')
            .attr('x', 640*width*factor) // relative position?
            .attr('y', 27*height*factor) // relative position?
            .attr('class', 'city-name')
            .attr('font-size', 18)
            .attr('fill', 'black')
            .text(
              `${mouseD.srcElement.__data__.city}: ${mouseD.srcElement.__data__.netflow} `
            );
        })
        .on('mouseout', function (mouseD) {
          selectAll('.city-name').remove();
        });
    });
  };
  
  const handleleaverButtonClick = function (){
      selectAll('.line-leaver').remove();
    selectAll('.line-incomer').remove();
    selectAll('.pos-bubble').remove();
    selectAll('.neg-bubble').remove();
    selectAll('.flowtext').remove();
    selectAll('.city-clicked').remove();
    selectAll('.des-circle').remove();
    selectAll('.ori-circle').remove();
    selectAll('.city-name').remove();
    selectAll('.city').remove();
    //date,city,state,netflow,lat,lon
    bubble = false;
        combobox = 'Leaver_Flow';
    ini_origin_city = ini_dest_city;
    svg.call(updateLeaverFlow);
  }
    const handleincomerButtonClick = function (){
      selectAll('.line-leaver').remove();
    selectAll('.line-incomer').remove();
    selectAll('.pos-bubble').remove();
    selectAll('.neg-bubble').remove();
    selectAll('.flowtext').remove();
    selectAll('.city-clicked').remove();
    selectAll('.des-circle').remove();
    selectAll('.ori-circle').remove();
    selectAll('.city-name').remove();
    selectAll('.city').remove();
    //date,city,state,netflow,lat,lon
    bubble = false;
      combobox = 'Incomer_Flow';
      ini_dest_city = ini_origin_city;
    svg.call(updateIncomerFlow);
  }
  bubbleButton.addEventListener(
    'click',
    handleBubbleButtonClick
  );
    leaverButton.addEventListener(
    'click',
    handleleaverButtonClick
  );
    incomerButton.addEventListener(
    'click',
    handleincomerButtonClick
  );

  svg.call(handleBubbleButtonClick);
  // menuContainer.call(menu());
  xMenu.call(
    menu()
      .id('x-menu')
      .labelText('Flow Options:  ')
      .options(options)
      .on('change', (column) => {
        // console.log('in index.js');
        console.log(column);
        combobox = column;
        bubble=false;
        if (column === 'Leaver_Flow') {
          selectAll('.line-leaver').remove();
          selectAll('.line-incomer').remove();
          selectAll('.flowtext').remove();
          selectAll('.city-clicked').remove();
          selectAll('.des-circle').remove();
          selectAll('.ori-circle').remove();
					selectAll('.pos-bubble').remove();
          selectAll('.neg-bubble').remove();
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
          selectAll('.pos-bubble').remove();
          selectAll('.neg-bubble').remove();
          selectAll('.city-name').remove();
          selectAll('.city').remove();
          svg.call(updateIncomerFlow);
        }
      })
  );
  //date,origin,dest,pct_leavers,netflow,origin_lat,origin_lon,dest_lat,dest_lon,origin_city,dest_city
  function updateIncomerFlow() {
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
      console.log(targetDate);
      const oneDateCitiesData = cities.filter(
        (d) =>
          d.date.getTime() ===
          targetDate.getTime()
      );
      // Draw the cities
      let filteredCities = oneDateCitiesData.filter(
        function (oneDateCitiesData) {
          return (
            ini_dest_city ===
            oneDateCitiesData.dest_city
          );
        }
      );
      console.log(filteredCities);
      selectAll('.line-incomer').remove();
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
            (origin[0] + destination[0]) / 4,
            (origin[1] + destination[1]) / 4,
          ];
          let midPoint1 = [
            ((origin[0] + destination[0]) * 3) /
              8,
            ((origin[1] + destination[1]) * 3) /
              8,
          ];
          let midPoint2 = [
            (origin[0] + destination[0]) / 2,
            (origin[1] + destination[1]) / 2,
          ];
          let midPoint3 = [
            ((origin[0] + destination[0]) * 5) /
              8,
            ((origin[1] + destination[1]) * 5) /
              8,
          ];

          let midPoint4 = [
            ((origin[0] + destination[0]) * 6) /
              8,
            ((origin[1] + destination[1]) * 6) /
              8,
          ];
          let midPoint5 = [
            ((origin[0] + destination[0]) * 7) /
              8,
            ((origin[1] + destination[1]) * 7) /
              8,
          ];
          let lineData = [
            origin,
            midPoint,
            midPoint1,
            midPoint2,
            midPoint3,
            midPoint4,
            midPoint5,
            destination,
          ];
          //console.log(lineData);
          return lineGenerator(lineData);
        })
        .attr('class', 'line-incomer')
        .style('stroke', 'purple')
        .style('stroke-width', (d) => {
          //console.log(d);
          return parseFloat(
            d.pct_incomers.replace('%', '')
          );
        })
        .style('opacity', 0.6)
        .attr('fill', 'none')
        .on('mouseover', function (mouseD) {
          console.log(mouseD);
          const citynametext = svg
            .append('text')
            .attr('x', 640*width*factor) // relative position?
            .attr('y', 27*height*factor) // relative position?
            .attr('class', 'city-name')
            .attr('font-size', 18)
            .attr('fill', 'black')
            .text(
              `Incoming ${mouseD.srcElement.__data__.origin_city}: ${mouseD.srcElement.__data__.pct_incomers}`
            );
        })
        .on('mouseout', function (mouseD) {
          selectAll('.city-name').remove();
        });

      let cityCircles = svg
        .selectAll('.city')
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
            .attr('r', (rData) => {
              if (
                d.srcElement.__data__.netflow >= 0
              ) {
                return radiusScale(
                  d.srcElement.__data__.netflow *
                    0.5
                );
              } else {
                return radiusScale(
                  -d.srcElement.__data__.netflow *
                    0.5
                );
              }
            })
            .style('fill',(rData) => {
              if (
                d.srcElement.__data__.netflow >= 0
              ) {
                return 'red';
              } else {
                return 'blue';
              }
            })  .style('opacity', 0.5);;
          const citynametext = svg
            .append('text')
            .attr('x', 640*width*factor) // relative position?
            .attr('y', 30*height*factor) // relative position?
            .attr('class', 'city-name')
            .attr('font-size', 18)
            .attr('fill', 'black')
            .text(
              `${d.srcElement.__data__.dest_city}, Netflow: ${d.srcElement.__data__.netflow}`
            );
        })
        .on('mouseout', function (d) {
          selectAll('.city-name').remove();
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
            .attr('r', (rData) => {
              if (
                d.srcElement.__data__.netflow >= 0
              ) {
                return radiusScale(
                  d.srcElement.__data__.netflow *
                    0.5
                );
              } else {
                return radiusScale(
                  -d.srcElement.__data__.netflow *
                    0.5
                );
              }
            })
            .attr('r', 5)
            .style('fill', 'purple')
            .style('stroke', '#fff')
            .style('stroke-width', '1px')
            .style('opacity', 0.7);

          //Remove the clicked circle
          //clickedCity.remove();
          //console.log(clickedCity);
          const text = svg
            .append('text')
            .attr('x', 640*width*factor)
            .attr('y', 72*height*factor)
            .attr('class', 'flowtext')
            .attr('font-size', 14)
            .attr('fill', 'black')
            .text(`Netflow: ${d.srcElement.__data__.netflow}`);
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
          ini_dest_city =
            d.srcElement.__data__.dest_city;
          console.log(filteredCities);
          svg
            .selectAll('line-incomer')
            .data(filteredCities)
            .enter()
            .append('path')
            .attr('d', function (d) {
              let curve = d3.curveBundle.beta(
                0.05
              );

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
                (origin[0] + destination[0]) / 4,
                (origin[1] + destination[1]) / 4,
              ];
              let midPoint1 = [
                ((origin[0] + destination[0]) *
                  3) /
                  8,
                ((origin[1] + destination[1]) *
                  3) /
                  8,
              ];
              let midPoint2 = [
                (origin[0] + destination[0]) / 2,
                (origin[1] + destination[1]) / 2,
              ];
              let midPoint3 = [
                ((origin[0] + destination[0]) *
                  5) /
                  8,
                ((origin[1] + destination[1]) *
                  5) /
                  8,
              ];

              let midPoint4 = [
                ((origin[0] + destination[0]) *
                  6) /
                  8,
                ((origin[1] + destination[1]) *
                  6) /
                  8,
              ];
              let midPoint5 = [
                ((origin[0] + destination[0]) *
                  7) /
                  8,
                ((origin[1] + destination[1]) *
                  7) /
                  8,
              ];
              let lineData = [
                origin,
                midPoint,
                midPoint1,
                midPoint2,
                midPoint3,
                midPoint4,
                midPoint5,
                destination,
              ];
              //console.log(lineData);
              return lineGenerator(lineData);
            })
            .attr('class', 'line-incomer')
            .style('stroke', 'purple')
            .style('stroke-width', (d) => {
              //console.log(d);
              return parseFloat(
                d.pct_incomers.replace('%', '')
              );
            })
            .style('opacity', 0.6)
            .attr('fill', 'none')
            .on('mouseover', function (mouseD) {
              console.log(mouseD);
              const citynametext = svg
                .append('text')
                .attr('x', 640*width*factor) // relative?
                .attr('y', 27*height*factor) // relative?
                .attr('class', 'city-name')
                .attr('font-size', 18)
                .attr('fill', 'black')
                .text(
                  `Incoming ${mouseD.srcElement.__data__.origin_city}: ${mouseD.srcElement.__data__.pct_incomers}`
                );
            })
            .on('mouseout', function (mouseD) {
              selectAll('.city-name').remove();
            });
          //console.log(lineData);
          // const ori_cities = svg
          //   .selectAll('.ori-circle')
          //   .data(filteredCities)
          //   .enter()
          //   .append('circle')
          //   .attr('cx', function (d) {
          //     return projection([
          //       d.origin_lon,
          //       d.origin_lat,
          //     ])[0];
          //   })
          //   .attr('cy', function (d) {
          //     return projection([
          //       d.origin_lon,
          //       d.origin_lat,
          //     ])[1];
          //   })
          //   .attr('r', 5)
          //   .attr('class', 'ori-circle')
          //   .style('fill', 'pink')
          //   .style('stroke', '#fff')
          //   .style('stroke-width', '1px')
          //   .on('mouseover', function (mouseD) {
          //     console.log(mouseD);
          //     const citynametext = svg
          //       .append('text')
          //       .attr('x', 635)
          //       .attr('y', 300)
          //       .attr('class', 'city-name')
          //       .attr('font-size', 12)
          //       .attr('fill', 'blue')
          //       .text(
          //         `${mouseD.srcElement.__data__.origin_city}, Pct of Incomers: ${mouseD.srcElement.__data__.pct_incomers}`
          //       );
          //   })
          //   .on('mouseout', function (mouseD) {
          //     selectAll('.city-name').remove();
          //   });
        });
    });
  }
  function updateLeaverFlow() {
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
      const oneDateCitiesData = cities.filter(
        (d) =>
          d.date.getTime() ===
          targetDate.getTime()
      );
      let filteredCities = oneDateCitiesData.filter(
        function (oneDateCitiesData) {
          return (
            ini_origin_city ===
            oneDateCitiesData.origin_city
          );
        }
      );
      selectAll('.line-leaver').remove();
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
            (origin[0] + destination[0]) / 4,
            (origin[1] + destination[1]) / 4,
          ];
          let midPoint1 = [
            ((origin[0] + destination[0]) * 3) /
              8,
            ((origin[1] + destination[1]) * 3) /
              8,
          ];
          let midPoint2 = [
            (origin[0] + destination[0]) / 2,
            (origin[1] + destination[1]) / 2,
          ];
          let midPoint3 = [
            ((origin[0] + destination[0]) * 5) /
              8,
            ((origin[1] + destination[1]) * 5) /
              8,
          ];

          let midPoint4 = [
            ((origin[0] + destination[0]) * 6) /
              8,
            ((origin[1] + destination[1]) * 6) /
              8,
          ];
          let midPoint5 = [
            ((origin[0] + destination[0]) * 7) /
              8,
            ((origin[1] + destination[1]) * 7) /
              8,
          ];
          let lineData = [
            origin,
            midPoint,
            midPoint1,
            midPoint2,
            midPoint3,
            midPoint4,
            midPoint5,
            destination,
          ];
          console.log(lineData);
          return lineGenerator(lineData);
        })
        .attr('class', 'line-leaver')
        .style('stroke', 'green')
        .style('stroke-width', (d) => {
          console.log(d);
          return parseFloat(
            d.pct_leavers.replace('%', '')
          );
        })
        .style('opacity', 0.6)
        .attr('fill', 'none')
        .on('mouseover', function (mouseD) {
          console.log(mouseD);
          const citynametext = svg
            .append('text')
            .attr('x', 640*width*factor) // relative?
            .attr('y', 27*width*factor) // relative?
            .attr('class', 'city-name')
            .attr('font-size', 18)
            .attr('fill', 'black')
            .text(
              `Outgoing ${mouseD.srcElement.__data__.dest_city}:  ${mouseD.srcElement.__data__.pct_leavers}`
            );
        })
        .on('mouseout', function (mouseD) {
          selectAll('.city-name').remove();
        });
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
            .attr('r', (rData) => {
              if (
                d.srcElement.__data__.netflow >= 0
              ) {
                return radiusScale(
                  d.srcElement.__data__.netflow *
                    0.5
                );
              } else {
                return radiusScale(
                  -d.srcElement.__data__.netflow *
                    0.5
                );
              }
            })
            //.style('fill', 'blue')
          .style('fill',(rData) => {
              if (
                d.srcElement.__data__.netflow >= 0
              ) {
                return 'red';
              } else {
                return 'blue';
              }
            })  .style('opacity', 0.5);;

          const citynametext = svg
            .append('text')
            .attr('x', 640*width*factor) //relative?
            .attr('y', 30*height*factor) //relative?
            .attr('class', 'city-name')
            .attr('font-size', 18)
            .attr('fill', 'black')
            .text(
              `${d.srcElement.__data__.origin_city}, Netflow: ${d.srcElement.__data__.netflow}`
            );
        })
        .on('mouseout', function (d) {
          selectAll('.city-name').remove();
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
            .attr('r', (rData) => {
              if (
                d.srcElement.__data__.netflow >= 0
              ) {
                return radiusScale(
                  d.srcElement.__data__.netflow *
                    0.5
                );
              } else {
                return radiusScale(
                  -d.srcElement.__data__.netflow *
                    0.5
                );
              }
            })
            .attr('r', 5)
            .style('fill', 'green')
            .style('stroke', '#fff')
            .style('stroke-width', '1px')
            .style('opacity', 0.7);

          //Remove the clicked circle
          //clickedCity.remove();
          //console.log(clickedCity);
          const text = svg
            .append('text')
            .attr('x', 640*width*factor)
            .attr('y', 72*height*factor)
            .attr('class', 'flowtext')
            .attr('font-size', 14)
            .attr('fill', 'black')
            .text(`Netflow: ${d.srcElement.__data__.netflow}`);
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
          ini_origin_city =
            d.srcElement.__data__.origin_city;
          console.log(filteredCities);

          svg
            .selectAll('line-leaver')
            .data(filteredCities)
            .enter()
            .append('path')
            .attr('d', function (d) {
              let curve = d3.curveBundle.beta(
                0.05
              );

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
                (origin[0] + destination[0]) / 4,
                (origin[1] + destination[1]) / 4,
              ];
              let midPoint1 = [
                ((origin[0] + destination[0]) *
                  3) /
                  8,
                ((origin[1] + destination[1]) *
                  3) /
                  8,
              ];
              let midPoint2 = [
                (origin[0] + destination[0]) / 2,
                (origin[1] + destination[1]) / 2,
              ];
              let midPoint3 = [
                ((origin[0] + destination[0]) *
                  5) /
                  8,
                ((origin[1] + destination[1]) *
                  5) /
                  8,
              ];

              let midPoint4 = [
                ((origin[0] + destination[0]) *
                  6) /
                  8,
                ((origin[1] + destination[1]) *
                  6) /
                  8,
              ];
              let midPoint5 = [
                ((origin[0] + destination[0]) *
                  7) /
                  8,
                ((origin[1] + destination[1]) *
                  7) /
                  8,
              ];
              let lineData = [
                origin,
                midPoint,
                midPoint1,
                midPoint2,
                midPoint3,
                midPoint4,
                midPoint5,
                destination,
              ];
              console.log(lineData);
              return lineGenerator(lineData);
            })
            .attr('class', 'line-leaver')
            .style('stroke', 'green')
            .style('stroke-width', (d) => {
              console.log(d);
              return parseFloat(
                d.pct_leavers.replace('%', '')
              );
            })
            .style('opacity', 0.6)
            .attr('fill', 'none')
            .on('mouseover', function (mouseD) {
              console.log(mouseD);
              const citynametext = svg
                .append('text')
                .attr('x', 640*width*factor) //relative?
                .attr('y', 27*height*factor) //relative?
                .attr('class', 'city-name')
                .attr('font-size', 18)
                .attr('fill', 'black')
                .text(
                  `Outgoing ${mouseD.srcElement.__data__.dest_city}: ${mouseD.srcElement.__data__.pct_leavers}`
                );
            })
            .on('mouseout', function (mouseD) {
              selectAll('.city-name').remove();
            });

          // const des_cities = svg
          //   .selectAll('.des-circle')
          //   .data(filteredCities)
          //   .enter()
          //   .append('circle')
          //   .attr('cx', function (d) {
          //     return projection([
          //       d.dest_lon,
          //       d.dest_lat,
          //     ])[0];
          //   })
          //   .attr('cy', function (d) {
          //     return projection([
          //       d.dest_lon,
          //       d.dest_lat,
          //     ])[1];
          //   })
          //   .attr('r', 5)
          //   .attr('class', 'des-circle')
          //   .style('fill', 'gold')
          //   .style('stroke', '#fff')
          //   .style('stroke-width', '1px')
          //   .on('mouseover', function (mouseD) {
          //     console.log(mouseD);
          //     const citynametext = svg
          //       .append('text')
          //       .attr('x', 635)
          //       .attr('y', 300)
          //       .attr('class', 'city-name')
          //       .attr('font-size', 12)
          //       .attr('fill', 'blue')
          //       .text(
          //         `${mouseD.srcElement.__data__.dest_city}, Pct of Leavers: ${mouseD.srcElement.__data__.pct_leavers}`
          //       );
          //   })
          //   .on('mouseout', function (mouseD) {
          //     selectAll('.city-name').remove();
          //   });
        });
    });
  }
});
