(function (d3$1, topojson) {
  'use strict';

  const menu = () => {
    let id;
    let labelText;
    let options;
    const listeners = d3$1.dispatch('change');
    const my = (selection) => {
      // the selection is div
      selection
        .selectAll('label')
        .data([null])
        .join('label')
        .attr('for', id)
        .text(labelText);

      selection
        .selectAll('select')
        .data([null])
        .join('select')
        .attr('name', id)
        .attr('id', id)
        .on('change', (event) => {
          //console.log(event.target.value);
          listeners.call(
            'change',
            null,
            event.target.value
          );
        })
        .selectAll('option')
        .data(options)
        .join('option')
        .attr('value', (d) => d.value)
        .text((d) => d.text);
    };

    my.id = function (_) {
      return arguments.length
        ? ((id = _), my) //return my
        : id;
    };
    my.labelText = function (_) {
      return arguments.length
        ? ((labelText = _), my) //return my
        : labelText;
    };

    my.options = function (_) {
      return arguments.length
        ? ((options = _), my) //return my
        : options;
    };

    my.on = function () {
      let value = listeners.on.apply(
        listeners,
        arguments
      );
      return value === listeners ? my : value;
    };
    return my;
  };

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

  const svg = d3$1.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const menuContainer = d3$1.select('body')
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
    d3$1.selectAll('.line-leaver').remove();
    d3$1.selectAll('.line-incomer').remove();
    d3$1.selectAll('.pos-bubble').remove();
    d3$1.selectAll('.neg-bubble').remove();
    d3$1.selectAll('.flowtext').remove();
    d3$1.selectAll('.city-clicked').remove();
    d3$1.selectAll('.des-circle').remove();
    d3$1.selectAll('.ori-circle').remove();
    d3$1.selectAll('.city-name').remove();
    d3$1.selectAll('.city').remove();
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

  d3$1.json(
    'https://unpkg.com/us-atlas@3.0.0/states-10m.json'
  ).then((us) => {
    // Converting the topojson to geojson.
    console.log(us);
    const us1 = topojson.feature(us, us.objects.states);
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
      d3$1.selectAll('.date-text').remove();
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
        d3$1.selectAll('.line-leaver').remove();
        d3$1.selectAll('.line-incomer').remove();
        d3$1.selectAll('.pos-bubble').remove();
        d3$1.selectAll('.neg-bubble').remove();
        d3$1.selectAll('.flowtext').remove();
        d3$1.selectAll('.city-clicked').remove();
        d3$1.selectAll('.des-circle').remove();
        d3$1.selectAll('.ori-circle').remove();
        d3$1.selectAll('.city-name').remove();
        d3$1.selectAll('.city').remove();
        svg.call(handleBubbleButtonClick);
      }else {
      if (combobox === 'Leaver_Flow') {
        // selectAll('.line-leaver').remove();
        // selectAll('.line-incomer').remove();
        d3$1.selectAll('.pos-bubble').remove();
        d3$1.selectAll('.neg-bubble').remove();
        d3$1.selectAll('.flowtext').remove();
        // selectAll('.city-clicked').remove();
        // selectAll('.des-circle').remove();
        // selectAll('.ori-circle').remove();
        //selectAll('.city-name').remove();
        d3$1.selectAll('.city').remove();
        svg.call(updateLeaverFlow);
      } else if (combobox === 'Incomer_Flow') {
        // selectAll('.line-leaver').remove();
        // selectAll('.line-incomer').remove();
        d3$1.selectAll('.pos-bubble').remove();
        d3$1.selectAll('.neg-bubble').remove();
        d3$1.selectAll('.flowtext').remove();
        // selectAll('.city-clicked').remove();
        // selectAll('.des-circle').remove();
        // selectAll('.ori-circle').remove();
        //selectAll('.city-name').remove();
        d3$1.selectAll('.city').remove();
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
      d3$1.selectAll('.line-leaver').remove();
      d3$1.selectAll('.line-incomer').remove();
      d3$1.selectAll('.pos-bubble').remove();
      d3$1.selectAll('.neg-bubble').remove();
      d3$1.selectAll('.flowtext').remove();
      d3$1.selectAll('.city-clicked').remove();
      d3$1.selectAll('.des-circle').remove();
      d3$1.selectAll('.ori-circle').remove();
      d3$1.selectAll('.city-name').remove();
      d3$1.selectAll('.city').remove();
      console.log(targetDate);
      console.log(combobox);
      //date,city,state,netflow,lat,lon
      bubble = true;
      d3$1.csv('clean_netflow.csv', (d) => {
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
            d3$1.selectAll('.city-name').remove();
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
            d3$1.selectAll('.city-name').remove();
          });
      });
    };
    
    const handleleaverButtonClick = function (){
        d3$1.selectAll('.line-leaver').remove();
      d3$1.selectAll('.line-incomer').remove();
      d3$1.selectAll('.pos-bubble').remove();
      d3$1.selectAll('.neg-bubble').remove();
      d3$1.selectAll('.flowtext').remove();
      d3$1.selectAll('.city-clicked').remove();
      d3$1.selectAll('.des-circle').remove();
      d3$1.selectAll('.ori-circle').remove();
      d3$1.selectAll('.city-name').remove();
      d3$1.selectAll('.city').remove();
      //date,city,state,netflow,lat,lon
      bubble = false;
          combobox = 'Leaver_Flow';
      ini_origin_city = ini_dest_city;
      svg.call(updateLeaverFlow);
    };
      const handleincomerButtonClick = function (){
        d3$1.selectAll('.line-leaver').remove();
      d3$1.selectAll('.line-incomer').remove();
      d3$1.selectAll('.pos-bubble').remove();
      d3$1.selectAll('.neg-bubble').remove();
      d3$1.selectAll('.flowtext').remove();
      d3$1.selectAll('.city-clicked').remove();
      d3$1.selectAll('.des-circle').remove();
      d3$1.selectAll('.ori-circle').remove();
      d3$1.selectAll('.city-name').remove();
      d3$1.selectAll('.city').remove();
      //date,city,state,netflow,lat,lon
      bubble = false;
        combobox = 'Incomer_Flow';
        ini_dest_city = ini_origin_city;
      svg.call(updateIncomerFlow);
    };
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
            d3$1.selectAll('.line-leaver').remove();
            d3$1.selectAll('.line-incomer').remove();
            d3$1.selectAll('.flowtext').remove();
            d3$1.selectAll('.city-clicked').remove();
            d3$1.selectAll('.des-circle').remove();
            d3$1.selectAll('.ori-circle').remove();
  					d3$1.selectAll('.pos-bubble').remove();
            d3$1.selectAll('.neg-bubble').remove();
            d3$1.selectAll('.city-name').remove();
            d3$1.selectAll('.city').remove();
            svg.call(updateLeaverFlow);
          } else if (column === 'Incomer_Flow') {
            d3$1.selectAll('.line-leaver').remove();
            d3$1.selectAll('.line-incomer').remove();
            d3$1.selectAll('.flowtext').remove();
            d3$1.selectAll('.city-clicked').remove();
            d3$1.selectAll('.des-circle').remove();
            d3$1.selectAll('.ori-circle').remove();
            d3$1.selectAll('.pos-bubble').remove();
            d3$1.selectAll('.neg-bubble').remove();
            d3$1.selectAll('.city-name').remove();
            d3$1.selectAll('.city').remove();
            svg.call(updateIncomerFlow);
          }
        })
    );
    //date,origin,dest,pct_leavers,netflow,origin_lat,origin_lon,dest_lat,dest_lon,origin_city,dest_city
    function updateIncomerFlow() {
      d3$1.csv('clean_dest_incomers.csv', (d) => {
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
        d3$1.selectAll('.line-incomer').remove();
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
            d3$1.selectAll('.city-name').remove();
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
              })  .style('opacity', 0.5);          const citynametext = svg
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
            d3$1.selectAll('.city-name').remove();
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
            d3$1.selectAll('.line-incomer').remove();
            d3$1.selectAll('.flowtext').remove();
            d3$1.selectAll('.city-clicked').remove();
            d3$1.selectAll('.ori-circle').remove();
            d3$1.selectAll('.city-name').remove();
            let clickedCity = d3$1.select(this);

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
                d3$1.selectAll('.city-name').remove();
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
      d3$1.csv('clean_origin_leavers.csv', (d) => {
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
        d3$1.selectAll('.line-leaver').remove();
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
            d3$1.selectAll('.city-name').remove();
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
              })  .style('opacity', 0.5);
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
            d3$1.selectAll('.city-name').remove();
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
            d3$1.selectAll('.line-leaver').remove();
            d3$1.selectAll('.flowtext').remove();
            d3$1.selectAll('.city-clicked').remove();
            d3$1.selectAll('.des-circle').remove();
            d3$1.selectAll('.city-name').remove();
            let clickedCity = d3$1.select(this);

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
                d3$1.selectAll('.city-name').remove();
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

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm1lbnUuanMiLCJpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJ2QzJztcbmV4cG9ydCBjb25zdCBtZW51ID0gKCkgPT4ge1xuICBsZXQgaWQ7XG4gIGxldCBsYWJlbFRleHQ7XG4gIGxldCBvcHRpb25zO1xuICBjb25zdCBsaXN0ZW5lcnMgPSBkaXNwYXRjaCgnY2hhbmdlJyk7XG4gIGNvbnN0IG15ID0gKHNlbGVjdGlvbikgPT4ge1xuICAgIC8vIHRoZSBzZWxlY3Rpb24gaXMgZGl2XG4gICAgc2VsZWN0aW9uXG4gICAgICAuc2VsZWN0QWxsKCdsYWJlbCcpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignbGFiZWwnKVxuICAgICAgLmF0dHIoJ2ZvcicsIGlkKVxuICAgICAgLnRleHQobGFiZWxUZXh0KTtcblxuICAgIHNlbGVjdGlvblxuICAgICAgLnNlbGVjdEFsbCgnc2VsZWN0JylcbiAgICAgIC5kYXRhKFtudWxsXSlcbiAgICAgIC5qb2luKCdzZWxlY3QnKVxuICAgICAgLmF0dHIoJ25hbWUnLCBpZClcbiAgICAgIC5hdHRyKCdpZCcsIGlkKVxuICAgICAgLm9uKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICBsaXN0ZW5lcnMuY2FsbChcbiAgICAgICAgICAnY2hhbmdlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAuZGF0YShvcHRpb25zKVxuICAgICAgLmpvaW4oJ29wdGlvbicpXG4gICAgICAuYXR0cigndmFsdWUnLCAoZCkgPT4gZC52YWx1ZSlcbiAgICAgIC50ZXh0KChkKSA9PiBkLnRleHQpO1xuICB9O1xuXG4gIG15LmlkID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKGlkID0gXyksIG15KSAvL3JldHVybiBteVxuICAgICAgOiBpZDtcbiAgfTtcbiAgbXkubGFiZWxUZXh0ID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKGxhYmVsVGV4dCA9IF8pLCBteSkgLy9yZXR1cm4gbXlcbiAgICAgIDogbGFiZWxUZXh0O1xuICB9O1xuXG4gIG15Lm9wdGlvbnMgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/ICgob3B0aW9ucyA9IF8pLCBteSkgLy9yZXR1cm4gbXlcbiAgICAgIDogb3B0aW9ucztcbiAgfTtcblxuICBteS5vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgdmFsdWUgPSBsaXN0ZW5lcnMub24uYXBwbHkoXG4gICAgICBsaXN0ZW5lcnMsXG4gICAgICBhcmd1bWVudHNcbiAgICApO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbGlzdGVuZXJzID8gbXkgOiB2YWx1ZTtcbiAgfTtcbiAgcmV0dXJuIG15O1xufTsiLCJpbXBvcnQge1xuICBjc3YsXG4gIHNlbGVjdCxcbiAgc2VsZWN0QWxsLFxuICBzY2FsZUxpbmVhcixcbiAganNvbixcbiAgZ2VvQWxiZXJzVXNhLFxufSBmcm9tICdkMyc7XG5pbXBvcnQgeyBmZWF0dXJlIH0gZnJvbSAndG9wb2pzb24nO1xuaW1wb3J0IHsgbWVudSB9IGZyb20gJy4vbWVudSc7XG5jb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gNTtcbmNvbnN0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDU7XG5jb25zdCBmYWN0b3IgPSAwLjAwMTtcbmxldCBsZWdlbmRTdmcgPSBkMy5zZWxlY3QoJyNsZWdlbmQnKTtcbmxldCBidWJibGUgPSBmYWxzZTtcblxuLy8gbGVnZW5kIGNvbG91cnMgYW5kIHBvc2l0aW9uXG5sZWdlbmRTdmdcbiAgLmFwcGVuZCgnY2lyY2xlJylcbiAgLmF0dHIoJ2N4JywgMjEwKVxuICAuYXR0cignY3knLCAxOClcbiAgLmF0dHIoJ3InLCA2KVxuICAuc3R5bGUoJ2ZpbGwnLCAncmVkJylcbiAgLnN0eWxlKCdvcGFjaXR5JywgMC41KTtcbmxlZ2VuZFN2Z1xuICAuYXBwZW5kKCdjaXJjbGUnKVxuICAuYXR0cignY3gnLCAyMTApXG4gIC5hdHRyKCdjeScsIDM4KVxuICAuYXR0cigncicsIDYpXG4gIC5zdHlsZSgnZmlsbCcsICdibHVlJylcbiAgLnN0eWxlKCdvcGFjaXR5JywgMC41KTtcbmxlZ2VuZFN2Z1xuICAuYXBwZW5kKCd0ZXh0JylcbiAgLmF0dHIoJ3gnLCAyMjApXG4gIC5hdHRyKCd5JywgMTgpXG4gIC50ZXh0KCdQb3NpdGl2ZSBuZXQgZmxvdycpXG4gIC5zdHlsZSgnZm9udC1zaXplJywgJzE2cHgnKVxuICAuYXR0cignYWxpZ25tZW50LWJhc2VsaW5lJywgJ21pZGRsZScpO1xubGVnZW5kU3ZnXG4gIC5hcHBlbmQoJ3RleHQnKVxuICAuYXR0cigneCcsIDIyMClcbiAgLmF0dHIoJ3knLCAzOClcbiAgLnRleHQoJ05lZ2F0aXZlIG5ldCBmbG93JylcbiAgLnN0eWxlKCdmb250LXNpemUnLCAnMTZweCcpXG4gIC5hdHRyKCdhbGlnbm1lbnQtYmFzZWxpbmUnLCAnbWlkZGxlJyk7XG5sZWdlbmRTdmdcbiAgLmFwcGVuZCgncmVjdCcpXG4gIC5hdHRyKCd4JywgMzk1KVxuICAuYXR0cigneScsIDEzKVxuICAuYXR0cigncicsIDYpXG4gIC5hdHRyKCd3aWR0aCcsIDE4KVxuICAuYXR0cignaGVpZ2h0JywgOClcbiAgLnN0eWxlKCdmaWxsJywgJ3B1cnBsZScpXG4gIC5zdHlsZSgnb3BhY2l0eScsIDAuNyk7XG5sZWdlbmRTdmdcbiAgLmFwcGVuZCgncmVjdCcpXG4gIC5hdHRyKCd4JywgMzk1KVxuICAuYXR0cigneScsIDMzKVxuICAuYXR0cigncicsIDYpXG4gIC5hdHRyKCd3aWR0aCcsIDE4KVxuICAuYXR0cignaGVpZ2h0JywgOClcbiAgLnN0eWxlKCdmaWxsJywgJ2dyZWVuJylcbiAgLnN0eWxlKCdvcGFjaXR5JywgMC43KTtcbmxlZ2VuZFN2Z1xuICAuYXBwZW5kKCd0ZXh0JylcbiAgLmF0dHIoJ3gnLCA0MjApXG4gIC5hdHRyKCd5JywgMTgpXG4gIC50ZXh0KCdQZXJjZW50YWdlIG9mIGluY29tZXJzIG1vdmluZyB0byB0aGUgY2l0eScpXG4gIC5zdHlsZSgnZm9udC1zaXplJywgJzE2cHgnKVxuICAuYXR0cignYWxpZ25tZW50LWJhc2VsaW5lJywgJ21pZGRsZScpO1xubGVnZW5kU3ZnXG4gIC5hcHBlbmQoJ3RleHQnKVxuICAuYXR0cigneCcsIDQyMClcbiAgLmF0dHIoJ3knLCAzOClcbiAgLnRleHQoJ1BlcmNlbnRhZ2Ugb2Ygb3V0Z29lcnMgbGVhdmluZyBmcm9tIHRoZSBjaXR5JylcbiAgLnN0eWxlKCdmb250LXNpemUnLCAnMTZweCcpXG4gIC5hdHRyKCdhbGlnbm1lbnQtYmFzZWxpbmUnLCAnbWlkZGxlJyk7XG5cbmNvbnN0IHN2ZyA9IHNlbGVjdCgnYm9keScpXG4gIC5hcHBlbmQoJ3N2ZycpXG4gIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuY29uc3QgbWVudUNvbnRhaW5lciA9IHNlbGVjdCgnYm9keScpXG4gIC5hcHBlbmQoJ2RpdicpXG4gIC5hdHRyKCdjbGFzcycsICdtZW51LWNvbnRhaW5lcicpO1xuY29uc3QgeE1lbnUgPSBtZW51Q29udGFpbmVyLmFwcGVuZCgnZGl2Jyk7XG4vL2NvbnN0IHlNZW51ID0gbWVudUNvbnRhaW5lci5hcHBlbmQoJ2RpdicpO1xuLy8gRGVmaW5lIHRoZSB0YXJnZXQgZGF0ZSBmb3IgZmlsdGVyaW5nXG5sZXQgdGFyZ2V0RGF0ZSA9IG5ldyBEYXRlKCcyMDE3LzEvMScpO1xubGV0IGNvbWJvYm94ID0gJ0xlYXZlcl9GbG93Jztcbi8vIDIxIHF1YXJ0ZXJzLlxuY29uc3QgdGFyZ2V0RGF0ZXMgPSBbXG4gIG5ldyBEYXRlKCcyMDE3LzEvMScpLFxuICBuZXcgRGF0ZSgnMjAxNy80LzEnKSxcbiAgbmV3IERhdGUoJzIwMTcvNy8xJyksXG4gIG5ldyBEYXRlKCcyMDE3LzEwLzEnKSxcbiAgbmV3IERhdGUoJzIwMTgvMS8xJyksXG4gIG5ldyBEYXRlKCcyMDE4LzQvMScpLFxuICBuZXcgRGF0ZSgnMjAxOC83LzEnKSxcbiAgbmV3IERhdGUoJzIwMTgvMTAvMScpLFxuICBuZXcgRGF0ZSgnMjAxOS8xLzEnKSxcbiAgbmV3IERhdGUoJzIwMTkvNC8xJyksXG4gIG5ldyBEYXRlKCcyMDE5LzcvMScpLFxuICBuZXcgRGF0ZSgnMjAxOS8xMC8xJyksXG4gIG5ldyBEYXRlKCcyMDIwLzEvMScpLFxuICBuZXcgRGF0ZSgnMjAyMC80LzEnKSxcbiAgbmV3IERhdGUoJzIwMjAvNy8xJyksXG4gIG5ldyBEYXRlKCcyMDIwLzEwLzEnKSxcbiAgbmV3IERhdGUoJzIwMjEvMS8xJyksXG4gIG5ldyBEYXRlKCcyMDIxLzQvMScpLFxuICBuZXcgRGF0ZSgnMjAyMS83LzEnKSxcbiAgbmV3IERhdGUoJzIwMjEvMTAvMScpLFxuICBuZXcgRGF0ZSgnMjAyMi8xLzEnKSxcbl07XG5cbi8vIEZpbHRlciB0aGUgZGF0YSBiYXNlZCBvbiB0aGUgdGFyZ2V0IGRhdGVcbi8vIGxldCBkYXRlRGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbi8vICAgcmV0dXJuIGQuZGF0ZS5nZXRUaW1lKCkgPT09IHRhcmdldERhdGUuZ2V0VGltZSgpO1xuLy8gfSk7XG5cbmNvbnN0IGNsZWFyQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICdjbGVhckJ1dHRvbidcbik7XG4vLyBjbGVhciBidXR0b24gY2xlYXJzIGFsbFxuY29uc3QgaGFuZGxlQ2xlYXJCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZWN0QWxsKCcubGluZS1sZWF2ZXInKS5yZW1vdmUoKTtcbiAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gIHNlbGVjdEFsbCgnLnBvcy1idWJibGUnKS5yZW1vdmUoKTtcbiAgc2VsZWN0QWxsKCcubmVnLWJ1YmJsZScpLnJlbW92ZSgpO1xuICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpLnJlbW92ZSgpO1xuICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG4gIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICBzZWxlY3RBbGwoJy5jaXR5JykucmVtb3ZlKCk7XG4gIGJ1YmJsZT1mYWxzZTtcbiAgICAgIGlmIChjb21ib2JveCA9PT0gJ0xlYXZlcl9GbG93Jykge1xuICAgICAgc3ZnLmNhbGwodXBkYXRlTGVhdmVyRmxvdyk7XG4gICAgfSBlbHNlIGlmIChjb21ib2JveCA9PT0gJ0luY29tZXJfRmxvdycpIHtcbiAgICAgIHN2Zy5jYWxsKHVwZGF0ZUluY29tZXJGbG93KTt9XG59O1xuY2xlYXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcbiAgJ2NsaWNrJyxcbiAgaGFuZGxlQ2xlYXJCdXR0b25DbGlja1xuKTtcbi8vIHN0YXJ0aW5nIHNlYXNvbiBcbmxldCBzZWFzb24gPSAnT2N0LURlYywgMjAxNic7XG5cbi8vIFVTQSBNQVBcbmNvbnN0IHByb2plY3Rpb24gPSBkM1xuICAuZ2VvQWxiZXJzVXNhKClcbiAgLnRyYW5zbGF0ZShbKHdpZHRoIC8gMikqMTEwMCpmYWN0b3IsIChoZWlnaHQgLyAyKSo5MDAqZmFjdG9yXSlcbiAgLnNjYWxlKDg1MCp3aWR0aCpmYWN0b3IpO1xuY29uc3QgcGF0aCA9IGQzLmdlb1BhdGgoKS5wcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuXG5sZXQgcmFkaXVzU2NhbGUgPSBkM1xuICAuc2NhbGVMaW5lYXIoKVxuICAuZG9tYWluKFswLCAzMTAwMF0pXG4gIC5yYW5nZShbMTAsIDEwMF0pO1xuXG5qc29uKFxuICAnaHR0cHM6Ly91bnBrZy5jb20vdXMtYXRsYXNAMy4wLjAvc3RhdGVzLTEwbS5qc29uJ1xuKS50aGVuKCh1cykgPT4ge1xuICAvLyBDb252ZXJ0aW5nIHRoZSB0b3BvanNvbiB0byBnZW9qc29uLlxuICBjb25zb2xlLmxvZyh1cyk7XG4gIGNvbnN0IHVzMSA9IGZlYXR1cmUodXMsIHVzLm9iamVjdHMuc3RhdGVzKTtcbiAgbGV0IGluaV9kZXN0X2NpdHkgPSAnU2VhdHRsZSc7IC8vIG91ciBob21lIGNpdHkhXG4gIGxldCBpbmlfb3JpZ2luX2NpdHkgPSAnU2VhdHRsZSc7XG4gIHN2Z1xuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgIC5kYXRhKHVzMS5mZWF0dXJlcylcbiAgICAuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgIC5hdHRyKCdkJywgcGF0aClcbiAgICAuc3R5bGUoJ2ZpbGwnLCAnI2NjYycpXG4gICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMC41cHgnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IFtcbiAgICB7IHZhbHVlOiAnTGVhdmVyX0Zsb3cnLCB0ZXh0OiAnT3V0Z29lciBGbG93JyB9LFxuICAgIHtcbiAgICAgIHZhbHVlOiAnSW5jb21lcl9GbG93JyxcbiAgICAgIHRleHQ6ICdJbmNvbWVyIEZsb3cnLFxuICAgIH0sXG4gICAgLy97IHZhbHVlOiAnY2xlYXJfbWFwJywgdGV4dDogJ0NsZWFyIE1hcCcgfSxcbiAgXTtcbiAgY29uc3QgaW5pRGF0ZSA9IHN2Z1xuICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgIC5hdHRyKCd4JywgNDAwKndpZHRoKmZhY3RvcikgLy8gY2FuIHdlIG1ha2UgaXQgcmVsYXRpdmUgYW5kIG5vdCBhYnNvbHV0ZT9cbiAgICAuYXR0cigneScsIDU2KmhlaWdodCpmYWN0b3IpXHQvLyBzbyB0aGF0IGl0IHdvcmtzIG9uIGFsbCBkZXZpY2VzP1xuICAgIC5hdHRyKCdjbGFzcycsICdkYXRlLXRleHQnKVxuICAgIC5hdHRyKCdmb250LXNpemUnLCAyMilcbiAgICAuYXR0cignZmlsbCcsICdibGFjaycpXG4gICAgLnRleHQoXG4gICAgICBgUGVyaW9kOiAke3NlYXNvbn1gXG4gICAgKTtcbiAgbGV0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICdkYXRlU2xpZGVyMSdcbiAgKTtcblxuICAvL2NvbnN0IHNsaWRlciA9IGQzLnNlbGVjdChcIiNkYXRlU2xpZGVyXCIpO1xuICBjb25zb2xlLmxvZyhzbGlkZXIpO1xuICAgIGNvbnN0IHBsYXlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheUJ1dHRvbicpO1xuICBsZXQgaW50ZXJ2YWw7XG4gIGxldCBpc1BsYXlpbmcgPSBmYWxzZTtcblxuICAvLyBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGF1dG9tYXRpYyBzbGlkZXIgcGxheVxuICBjb25zdCBwbGF5U2xpZGVyID0gKCkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KHNsaWRlci52YWx1ZSk7XG4gICAgY29uc3QgbWF4VmFsdWUgPSBwYXJzZUludChzbGlkZXIubWF4KTtcblxuICAgIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHZhbHVlID49IG1heFZhbHVlKSB7XG4gICAgICAgIHNsaWRlci52YWx1ZSA9IDA7XG4gICAgICAgIHN0b3BTbGlkZXIoKTtcbiAgICAgICAgICAgIGlzUGxheWluZyA9IGZhbHNlO1xuICAgIHBsYXlCdXR0b24udGV4dENvbnRlbnQgPSAnUGxheSc7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRhcmdldERhdGUgPSB0YXJnZXREYXRlc1t2YWx1ZV07XG5cdFx0XHRjb25zb2xlLmxvZyh0YXJnZXREYXRlKTtcbiAgICAgIHZhbHVlKys7XG4gICAgICBzbGlkZXIudmFsdWUgPSB2YWx1ZTtcbiAgICAgIHNsaWRlci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnKSk7XG4gICAgfSwgNTAwKTsgXG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gdG8gc3RvcCB0aGUgYXV0b21hdGljIHNsaWRlciBwbGF5XG5jb25zdCBzdG9wU2xpZGVyID0gKCkgPT4ge1xuICBjbGVhckludGVydmFsKGludGVydmFsKTtcbn07XG5cbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBwbGF5IGJ1dHRvblxuICBwbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgaWYgKGlzUGxheWluZykge1xuICAgIC8vIEF1dG8tcGxheSBpcyBhbHJlYWR5IGFjdGl2ZSwgc3RvcCBpdFxuICAgIHN0b3BTbGlkZXIoKTtcbiAgICBpc1BsYXlpbmcgPSBmYWxzZTtcbiAgICBwbGF5QnV0dG9uLnRleHRDb250ZW50ID0gJ1BsYXknO1xuICB9IGVsc2Uge1xuICAgIC8vIEF1dG8tcGxheSBpcyBub3QgYWN0aXZlLCBzdGFydCBpdFxuICAgIHBsYXlTbGlkZXIoKTtcbiAgICBpc1BsYXlpbmcgPSB0cnVlO1xuICAgIHBsYXlCdXR0b24udGV4dENvbnRlbnQgPSAnU3RvcCc7XG4gIH1cbiAgfSk7XG4gIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KHRoaXMudmFsdWUpO1xuICAgIHNlbGVjdEFsbCgnLmRhdGUtdGV4dCcpLnJlbW92ZSgpO1xuXG4gICAgY29uc3QgbmV3RGF0ZSA9IHRhcmdldERhdGVzW2luZGV4XTtcbiAgICB0YXJnZXREYXRlID0gdGFyZ2V0RGF0ZXNbaW5kZXhdO1xuICAgIGNvbnNvbGUubG9nKHRhcmdldERhdGUpO1xuICAgIGNvbnNvbGUubG9nKGNvbWJvYm94KTtcblx0XHQvLyBkYXRlIHRvIGh1bWFuIHJlYWRhYmxlIHF1YXJ0ZXJcbiAgICBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzBdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ09jdC1EZWMsIDIwMTYnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzFdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0phbi1NYXIsIDIwMTcnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzJdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0Fwci1KdW4sIDIwMTcnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzNdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0p1bC1TZXAsIDIwMTcnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzRdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ09jdC1EZWMsIDIwMTcnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzVdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0phbi1NYXIsIDIwMTgnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzZdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0Fwci1KdW4sIDIwMTgnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzddLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0p1bC1TZXAsIDIwMTgnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzhdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ09jdC1EZWMsIDIwMTgnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzldLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0phbi1NYXIsIDIwMTknO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzEwXS5nZXRUaW1lKClcbiAgICApIHtcbiAgICAgIHNlYXNvbiA9ICdBcHItSnVuLCAyMDE5JztcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGFyZ2V0RGF0ZS5nZXRUaW1lKCkgPT09XG4gICAgICB0YXJnZXREYXRlc1sxMV0uZ2V0VGltZSgpXG4gICAgKSB7XG4gICAgICBzZWFzb24gPSAnSnVsLVNlcCwgMjAxOSc7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRhcmdldERhdGUuZ2V0VGltZSgpID09PVxuICAgICAgdGFyZ2V0RGF0ZXNbMTJdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ09jdC1EZWMsIDIwMTknO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzEzXS5nZXRUaW1lKClcbiAgICApIHtcbiAgICAgIHNlYXNvbiA9ICdKYW4tTWFyLCAyMDIwJztcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGFyZ2V0RGF0ZS5nZXRUaW1lKCkgPT09XG4gICAgICB0YXJnZXREYXRlc1sxNF0uZ2V0VGltZSgpXG4gICAgKSB7XG4gICAgICBzZWFzb24gPSAnQXByLUp1biwgMjAyMCc7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRhcmdldERhdGUuZ2V0VGltZSgpID09PVxuICAgICAgdGFyZ2V0RGF0ZXNbMTVdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0p1bC1TZXAsIDIwMjAnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzE2XS5nZXRUaW1lKClcbiAgICApIHtcbiAgICAgIHNlYXNvbiA9ICdPY3QtRGVjLCAyMDIwJztcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGFyZ2V0RGF0ZS5nZXRUaW1lKCkgPT09XG4gICAgICB0YXJnZXREYXRlc1sxN10uZ2V0VGltZSgpXG4gICAgKSB7XG4gICAgICBzZWFzb24gPSAnSmFuLU1hciwgMjAyMSc7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRhcmdldERhdGUuZ2V0VGltZSgpID09PVxuICAgICAgdGFyZ2V0RGF0ZXNbMThdLmdldFRpbWUoKVxuICAgICkge1xuICAgICAgc2Vhc29uID0gJ0Fwci1KdW4sIDIwMjEnO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgIHRhcmdldERhdGVzWzE5XS5nZXRUaW1lKClcbiAgICApIHtcbiAgICAgIHNlYXNvbiA9ICdKdWwtU2VwLCAyMDIxJztcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGFyZ2V0RGF0ZS5nZXRUaW1lKCkgPT09XG4gICAgICB0YXJnZXREYXRlc1syMF0uZ2V0VGltZSgpXG4gICAgKSB7XG4gICAgICBzZWFzb24gPSAnT2N0LURlYywgMjAyMSc7XG4gICAgfVxuXG4gICAgY29uc3QgY2l0eW5hbWV0ZXh0ID0gc3ZnXG4gICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyKCd4JywgNDAwKndpZHRoKmZhY3RvcikgLy8gcmVsYXRpdmUgcG9zaXRpb24gbmVlZGVkP1xuICAgICAgLmF0dHIoJ3knLCA1NipoZWlnaHQqZmFjdG9yKSAvLyBvciBhYnNvbHV0ZSB3b3Jrcz9cbiAgICAgIC5hdHRyKCdjbGFzcycsICdkYXRlLXRleHQnKVxuICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDIyKVxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgLnRleHQoXG4gICAgICAgIGBQZXJpb2Q6ICR7c2Vhc29ufWBcbiAgICAgICk7XG5cbiAgICBpZiAoYnViYmxlPT09dHJ1ZSl7XG4gICAgICBzZWxlY3RBbGwoJy5saW5lLWxlYXZlcicpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5wb3MtYnViYmxlJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5uZWctYnViYmxlJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcuY2l0eS1jbGlja2VkJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5kZXMtY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLmNpdHknKS5yZW1vdmUoKTtcbiAgICAgIHN2Zy5jYWxsKGhhbmRsZUJ1YmJsZUJ1dHRvbkNsaWNrKTtcbiAgICB9ZWxzZXtcbiAgICBpZiAoY29tYm9ib3ggPT09ICdMZWF2ZXJfRmxvdycpIHtcbiAgICAgIC8vIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgICAvLyBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLnBvcy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLm5lZy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gICAgICAvLyBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICAgIC8vIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgIC8vIHNlbGVjdEFsbCgnLm9yaS1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgIC8vc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5jaXR5JykucmVtb3ZlKCk7XG4gICAgICBzdmcuY2FsbCh1cGRhdGVMZWF2ZXJGbG93KTtcbiAgICB9IGVsc2UgaWYgKGNvbWJvYm94ID09PSAnSW5jb21lcl9GbG93Jykge1xuICAgICAgLy8gc2VsZWN0QWxsKCcubGluZS1sZWF2ZXInKS5yZW1vdmUoKTtcbiAgICAgIC8vIHNlbGVjdEFsbCgnLmxpbmUtaW5jb21lcicpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcucG9zLWJ1YmJsZScpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcubmVnLWJ1YmJsZScpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICAgIC8vIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgICAgLy8gc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgLy8gc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgLy9zZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLmNpdHknKS5yZW1vdmUoKTtcbiAgICAgIHN2Zy5jYWxsKHVwZGF0ZUluY29tZXJGbG93KTtcbiAgICB9fVxuICB9KTtcblxuXG5cbiAgY29uc3QgYnViYmxlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgJ2J1YmJsZUJ1dHRvbidcbiAgKTtcbiAgICBjb25zdCBsZWF2ZXJCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAnbGVhdmVyQnV0dG9uJ1xuICApO1xuICAgIGNvbnN0IGluY29tZXJCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAnaW5jb21lckJ1dHRvbidcbiAgKTtcblxuICBjb25zdCBoYW5kbGVCdWJibGVCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICBzZWxlY3RBbGwoJy5saW5lLWxlYXZlcicpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmxpbmUtaW5jb21lcicpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLnBvcy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5uZWctYnViYmxlJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5kZXMtY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmNpdHknKS5yZW1vdmUoKTtcbiAgICBjb25zb2xlLmxvZyh0YXJnZXREYXRlKTtcbiAgICBjb25zb2xlLmxvZyhjb21ib2JveCk7XG4gICAgLy9kYXRlLGNpdHksc3RhdGUsbmV0ZmxvdyxsYXQsbG9uXG4gICAgYnViYmxlID0gdHJ1ZTtcbiAgICBjc3YoJ2NsZWFuX25ldGZsb3cuY3N2JywgKGQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKGQuZGF0ZSksXG4gICAgICAgIGNpdHk6IGQuY2l0eSxcbiAgICAgICAgbmV0ZmxvdzogK2QubmV0ZmxvdyxcbiAgICAgICAgbGF0OiArZC5sYXQsXG4gICAgICAgIGxvbjogK2QubG9uLFxuICAgICAgfTtcbiAgICB9KS50aGVuKChjaXRpZXMpID0+IHtcbiAgICAgIGNvbnN0IG9uZURhdGVDaXRpZXNEYXRhID0gY2l0aWVzLmZpbHRlcihcbiAgICAgICAgKGQpID0+XG4gICAgICAgICAgZC5kYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgICAgICB0YXJnZXREYXRlLmdldFRpbWUoKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHBvc2l0aXZlQnViYmxlID0gb25lRGF0ZUNpdGllc0RhdGEuZmlsdGVyKFxuICAgICAgICAoZCkgPT4gZC5uZXRmbG93ID49IDBcbiAgICAgICk7XG4gICAgICBjb25zdCBuZWdhdGl2ZUJ1YmJsZSA9IG9uZURhdGVDaXRpZXNEYXRhLmZpbHRlcihcbiAgICAgICAgKGQpID0+IGQubmV0ZmxvdyA8IDBcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhwb3NpdGl2ZUJ1YmJsZSk7XG4gICAgICBsZXQgY2l0eUNpcmNsZXMxID0gc3ZnXG4gICAgICAgIC5zZWxlY3RBbGwoJy5uZWctYnViYmxlJylcbiAgICAgICAgLmRhdGEobmVnYXRpdmVCdWJibGUpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICduZWctYnViYmxlJylcbiAgICAgICAgLmF0dHIoJ2N4JywgKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbZC5sb24sIGQubGF0XSlbMF07XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdjeScsIChkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW2QubG9uLCBkLmxhdF0pWzFdO1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cigncicsIChkKSA9PiB7XG4gICAgICAgICAgaWYgKGQubmV0ZmxvdyA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZSgtZC5uZXRmbG93ICogMC41KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdHlsZSgnZmlsbCcsICdibHVlJylcbiAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzFweCcpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDAuNSlcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgY29uc29sZS5sb2cobW91c2VEKTtcbiAgICAgICAgICBjb25zdCBjaXR5bmFtZXRleHQgPSBzdmdcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ3gnLCA2NDAqd2lkdGgqZmFjdG9yKSAvLyBjYW4gdGhpcyBhbHNvIGJlIG1hZGUgcmVsYXRpdmUgcG9zaXRpb25cbiAgICAgICAgICAgIC5hdHRyKCd5JywgMjcqaGVpZ2h0KmZhY3RvcikgLy8gY2FuIHRoaXMgYWxzbyBiZSBtYWRlIHJlbGF0aXZlIHBvc2l0aW9uXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1uYW1lJylcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxOClcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICBgJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5jaXR5fTogJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93fSBgXG4gICAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIGxldCBjaXR5Q2lyY2xlcyA9IHN2Z1xuICAgICAgICAuc2VsZWN0QWxsKCcucG9zLWJ1YmJsZScpXG4gICAgICAgIC5kYXRhKHBvc2l0aXZlQnViYmxlKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAncG9zLWJ1YmJsZScpXG4gICAgICAgIC5hdHRyKCdjeCcsIChkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW2QubG9uLCBkLmxhdF0pWzBdO1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cignY3knLCAoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbiwgZC5sYXRdKVsxXTtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ3InLCAoZCkgPT4ge1xuICAgICAgICAgIGlmIChkLm5ldGZsb3cgPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHJhZGl1c1NjYWxlKGQubmV0ZmxvdyAqIDAuNSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmVkJylcbiAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzFweCcpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDAuNSlcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgY29uc29sZS5sb2cobW91c2VEKTtcbiAgICAgICAgICBjb25zdCBjaXR5bmFtZXRleHQgPSBzdmdcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ3gnLCA2NDAqd2lkdGgqZmFjdG9yKSAvLyByZWxhdGl2ZSBwb3NpdGlvbj9cbiAgICAgICAgICAgIC5hdHRyKCd5JywgMjcqaGVpZ2h0KmZhY3RvcikgLy8gcmVsYXRpdmUgcG9zaXRpb24/XG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1uYW1lJylcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxOClcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICBgJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5jaXR5fTogJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93fSBgXG4gICAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgXG4gIGNvbnN0IGhhbmRsZWxlYXZlckJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCl7XG4gICAgICBzZWxlY3RBbGwoJy5saW5lLWxlYXZlcicpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmxpbmUtaW5jb21lcicpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLnBvcy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5uZWctYnViYmxlJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5kZXMtY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmNpdHknKS5yZW1vdmUoKTtcbiAgICAvL2RhdGUsY2l0eSxzdGF0ZSxuZXRmbG93LGxhdCxsb25cbiAgICBidWJibGUgPSBmYWxzZTtcbiAgICAgICAgY29tYm9ib3ggPSAnTGVhdmVyX0Zsb3cnO1xuICAgIGluaV9vcmlnaW5fY2l0eSA9IGluaV9kZXN0X2NpdHk7XG4gICAgc3ZnLmNhbGwodXBkYXRlTGVhdmVyRmxvdyk7XG4gIH1cbiAgICBjb25zdCBoYW5kbGVpbmNvbWVyQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKXtcbiAgICAgIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcucG9zLWJ1YmJsZScpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLm5lZy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcuY2l0eScpLnJlbW92ZSgpO1xuICAgIC8vZGF0ZSxjaXR5LHN0YXRlLG5ldGZsb3csbGF0LGxvblxuICAgIGJ1YmJsZSA9IGZhbHNlO1xuICAgICAgY29tYm9ib3ggPSAnSW5jb21lcl9GbG93JztcbiAgICAgIGluaV9kZXN0X2NpdHkgPSBpbmlfb3JpZ2luX2NpdHk7XG4gICAgc3ZnLmNhbGwodXBkYXRlSW5jb21lckZsb3cpO1xuICB9XG4gIGJ1YmJsZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICdjbGljaycsXG4gICAgaGFuZGxlQnViYmxlQnV0dG9uQ2xpY2tcbiAgKTtcbiAgICBsZWF2ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAnY2xpY2snLFxuICAgIGhhbmRsZWxlYXZlckJ1dHRvbkNsaWNrXG4gICk7XG4gICAgaW5jb21lckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICdjbGljaycsXG4gICAgaGFuZGxlaW5jb21lckJ1dHRvbkNsaWNrXG4gICk7XG5cbiAgc3ZnLmNhbGwoaGFuZGxlQnViYmxlQnV0dG9uQ2xpY2spO1xuICAvLyBtZW51Q29udGFpbmVyLmNhbGwobWVudSgpKTtcbiAgeE1lbnUuY2FsbChcbiAgICBtZW51KClcbiAgICAgIC5pZCgneC1tZW51JylcbiAgICAgIC5sYWJlbFRleHQoJ0Zsb3cgT3B0aW9uczogICcpXG4gICAgICAub3B0aW9ucyhvcHRpb25zKVxuICAgICAgLm9uKCdjaGFuZ2UnLCAoY29sdW1uKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdpbiBpbmRleC5qcycpO1xuICAgICAgICBjb25zb2xlLmxvZyhjb2x1bW4pO1xuICAgICAgICBjb21ib2JveCA9IGNvbHVtbjtcbiAgICAgICAgYnViYmxlPWZhbHNlO1xuICAgICAgICBpZiAoY29sdW1uID09PSAnTGVhdmVyX0Zsb3cnKSB7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1sZWF2ZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0c2VsZWN0QWxsKCcucG9zLWJ1YmJsZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLm5lZy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5JykucmVtb3ZlKCk7XG4gICAgICAgICAgc3ZnLmNhbGwodXBkYXRlTGVhdmVyRmxvdyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29sdW1uID09PSAnSW5jb21lcl9GbG93Jykge1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5kZXMtY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLnBvcy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5uZWctYnViYmxlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eScpLnJlbW92ZSgpO1xuICAgICAgICAgIHN2Zy5jYWxsKHVwZGF0ZUluY29tZXJGbG93KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgKTtcbiAgLy9kYXRlLG9yaWdpbixkZXN0LHBjdF9sZWF2ZXJzLG5ldGZsb3csb3JpZ2luX2xhdCxvcmlnaW5fbG9uLGRlc3RfbGF0LGRlc3RfbG9uLG9yaWdpbl9jaXR5LGRlc3RfY2l0eVxuICBmdW5jdGlvbiB1cGRhdGVJbmNvbWVyRmxvdygpIHtcbiAgICBjc3YoJ2NsZWFuX2Rlc3RfaW5jb21lcnMuY3N2JywgKGQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKGQuZGF0ZSksXG4gICAgICAgIHBjdF9pbmNvbWVyczogZC5wY3RfaW5jb21lcnMsXG4gICAgICAgIC8vcGN0X2xlYXZlcnMgOiBwYXJzZUZsb2F0KGQucGN0X2xlYXZlcnMucmVwbGFjZSgnJScsICcnKSksXG4gICAgICAgIG5ldGZsb3c6ICtkLm5ldGZsb3csXG4gICAgICAgIG9yaWdpbl9sYXQ6ICtkLm9yaWdpbl9sYXQsXG4gICAgICAgIG9yaWdpbl9sb246ICtkLm9yaWdpbl9sb24sXG4gICAgICAgIGRlc3RfbGF0OiArZC5kZXN0X2xhdCxcbiAgICAgICAgZGVzdF9sb246ICtkLmRlc3RfbG9uLFxuICAgICAgICBvcmlnaW5fY2l0eTogZC5vcmlnaW5fY2l0eSxcbiAgICAgICAgZGVzdF9jaXR5OiBkLmRlc3RfY2l0eSxcbiAgICAgIH07XG4gICAgfSkudGhlbigoY2l0aWVzKSA9PiB7XG4gICAgICAvLyBjb25zdCBzY2FsZVJhZGl1cyA9IHNjYWxlTGluZWFyKClcbiAgICAgIC8vICAgLmRvbWFpbihbMCwgZDMubWF4KGNpdGllcywgKGQpID0+IGQuZmxvdyldKVxuICAgICAgLy8gICAucmFuZ2UoWzIsIDIwXSk7XG4gICAgICBjb25zb2xlLmxvZyh0YXJnZXREYXRlKTtcbiAgICAgIGNvbnN0IG9uZURhdGVDaXRpZXNEYXRhID0gY2l0aWVzLmZpbHRlcihcbiAgICAgICAgKGQpID0+XG4gICAgICAgICAgZC5kYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgICAgICB0YXJnZXREYXRlLmdldFRpbWUoKVxuICAgICAgKTtcbiAgICAgIC8vIERyYXcgdGhlIGNpdGllc1xuICAgICAgbGV0IGZpbHRlcmVkQ2l0aWVzID0gb25lRGF0ZUNpdGllc0RhdGEuZmlsdGVyKFxuICAgICAgICBmdW5jdGlvbiAob25lRGF0ZUNpdGllc0RhdGEpIHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgaW5pX2Rlc3RfY2l0eSA9PT1cbiAgICAgICAgICAgIG9uZURhdGVDaXRpZXNEYXRhLmRlc3RfY2l0eVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhmaWx0ZXJlZENpdGllcyk7XG4gICAgICBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgIHN2Z1xuICAgICAgICAuc2VsZWN0QWxsKCdsaW5lLWluY29tZXInKVxuICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgncGF0aCcpXG4gICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICBsZXQgY3VydmUgPSBkMy5jdXJ2ZUJ1bmRsZS5iZXRhKDAuMDUpO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsaW5lIGdlbmVyYXRvclxuICAgICAgICAgIGxldCBsaW5lR2VuZXJhdG9yID0gZDNcbiAgICAgICAgICAgIC5saW5lKClcbiAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkWzBdO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkWzFdO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jdXJ2ZShjdXJ2ZSk7XG4gICAgICAgICAgbGV0IG9yaWdpbiA9IHByb2plY3Rpb24oW1xuICAgICAgICAgICAgZC5vcmlnaW5fbG9uLFxuICAgICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgIF0pO1xuICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHByb2plY3Rpb24oW1xuICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgIGQuZGVzdF9sYXQsXG4gICAgICAgICAgXSk7XG4gICAgICAgICAgbGV0IG1pZFBvaW50ID0gW1xuICAgICAgICAgICAgKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAvIDQsXG4gICAgICAgICAgICAob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pIC8gNCxcbiAgICAgICAgICBdO1xuICAgICAgICAgIGxldCBtaWRQb2ludDEgPSBbXG4gICAgICAgICAgICAoKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAqIDMpIC9cbiAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICgob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pICogMykgL1xuICAgICAgICAgICAgICA4LFxuICAgICAgICAgIF07XG4gICAgICAgICAgbGV0IG1pZFBvaW50MiA9IFtcbiAgICAgICAgICAgIChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgLyAyLFxuICAgICAgICAgICAgKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAvIDIsXG4gICAgICAgICAgXTtcbiAgICAgICAgICBsZXQgbWlkUG9pbnQzID0gW1xuICAgICAgICAgICAgKChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgKiA1KSAvXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAoKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAqIDUpIC9cbiAgICAgICAgICAgICAgOCxcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgbGV0IG1pZFBvaW50NCA9IFtcbiAgICAgICAgICAgICgob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pICogNikgL1xuICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgKChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgKiA2KSAvXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgXTtcbiAgICAgICAgICBsZXQgbWlkUG9pbnQ1ID0gW1xuICAgICAgICAgICAgKChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgKiA3KSAvXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAoKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAqIDcpIC9cbiAgICAgICAgICAgICAgOCxcbiAgICAgICAgICBdO1xuICAgICAgICAgIGxldCBsaW5lRGF0YSA9IFtcbiAgICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICAgIG1pZFBvaW50LFxuICAgICAgICAgICAgbWlkUG9pbnQxLFxuICAgICAgICAgICAgbWlkUG9pbnQyLFxuICAgICAgICAgICAgbWlkUG9pbnQzLFxuICAgICAgICAgICAgbWlkUG9pbnQ0LFxuICAgICAgICAgICAgbWlkUG9pbnQ1LFxuICAgICAgICAgICAgZGVzdGluYXRpb24sXG4gICAgICAgICAgXTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGxpbmVEYXRhKTtcbiAgICAgICAgICByZXR1cm4gbGluZUdlbmVyYXRvcihsaW5lRGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5lLWluY29tZXInKVxuICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICdwdXJwbGUnKVxuICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsIChkKSA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcbiAgICAgICAgICAgIGQucGN0X2luY29tZXJzLnJlcGxhY2UoJyUnLCAnJylcbiAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwLjYpXG4gICAgICAgIC5hdHRyKCdmaWxsJywgJ25vbmUnKVxuICAgICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChtb3VzZUQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhtb3VzZUQpO1xuICAgICAgICAgIGNvbnN0IGNpdHluYW1ldGV4dCA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cigneCcsIDY0MCp3aWR0aCpmYWN0b3IpIC8vIHJlbGF0aXZlIHBvc2l0aW9uP1xuICAgICAgICAgICAgLmF0dHIoJ3knLCAyNypoZWlnaHQqZmFjdG9yKSAvLyByZWxhdGl2ZSBwb3NpdGlvbj9cbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LW5hbWUnKVxuICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDE4KVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICAgICAgLnRleHQoXG4gICAgICAgICAgICAgIGBJbmNvbWluZyAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLm9yaWdpbl9jaXR5fTogJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5wY3RfaW5jb21lcnN9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uIChtb3VzZUQpIHtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGxldCBjaXR5Q2lyY2xlcyA9IHN2Z1xuICAgICAgICAuc2VsZWN0QWxsKCcuY2l0eScpXG4gICAgICAgIC5kYXRhKG9uZURhdGVDaXRpZXNEYXRhKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eScpXG4gICAgICAgIC5hdHRyKCdjeCcsIChkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgIGQuZGVzdF9sYXQsXG4gICAgICAgICAgXSlbMF07XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdjeScsIChkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgIGQuZGVzdF9sYXQsXG4gICAgICAgICAgXSlbMV07XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2dvbGQnKVxuICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMXB4JylcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvd1xuICAgICAgICAgICk7XG4gICAgICAgICAgLy9zZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgLmR1cmF0aW9uKDIwMClcbiAgICAgICAgICAgIC8vLmF0dHIoJ3InLCAxMClcbiAgICAgICAgICAgIC5hdHRyKCdyJywgKHJEYXRhKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyA+PSAwXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZShcbiAgICAgICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ICpcbiAgICAgICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkaXVzU2NhbGUoXG4gICAgICAgICAgICAgICAgICAtZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgKlxuICAgICAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywockRhdGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ID49IDBcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdyZWQnO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAnYmx1ZSc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pICAuc3R5bGUoJ29wYWNpdHknLCAwLjUpOztcbiAgICAgICAgICBjb25zdCBjaXR5bmFtZXRleHQgPSBzdmdcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ3gnLCA2NDAqd2lkdGgqZmFjdG9yKSAvLyByZWxhdGl2ZSBwb3NpdGlvbj9cbiAgICAgICAgICAgIC5hdHRyKCd5JywgMzAqaGVpZ2h0KmZhY3RvcikgLy8gcmVsYXRpdmUgcG9zaXRpb24/XG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1uYW1lJylcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxOClcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICBgJHtkLnNyY0VsZW1lbnQuX19kYXRhX18uZGVzdF9jaXR5fSwgTmV0ZmxvdzogJHtkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvd31gXG4gICAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdnb2xkJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3dcbiAgICAgICAgICApO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmxpbmUtaW5jb21lcicpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eS1jbGlja2VkJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgIGxldCBjbGlja2VkQ2l0eSA9IHNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaWNrZWRDaXR5KTtcbiAgICAgICAgICAvLyBjb25zdCBjdXJ2ZSA9IGQzLmxpbmUoKS5jdXJ2ZShkMy5jdXJ2ZU5hdHVyYWwpO1xuICAgICAgICAgIGNvbnN0IG5ld0NpcmNsZSA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LWNsaWNrZWQnKVxuICAgICAgICAgICAgLmF0dHIoJ2N4JywgY2xpY2tlZENpdHkuYXR0cignY3gnKSlcbiAgICAgICAgICAgIC5hdHRyKCdjeScsIGNsaWNrZWRDaXR5LmF0dHIoJ2N5JykpXG4gICAgICAgICAgICAuYXR0cigncicsIChyRGF0YSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgPj0gMFxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkaXVzU2NhbGUoXG4gICAgICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyAqXG4gICAgICAgICAgICAgICAgICAgIDAuNVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhZGl1c1NjYWxlKFxuICAgICAgICAgICAgICAgICAgLWQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ICpcbiAgICAgICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdwdXJwbGUnKVxuICAgICAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxcHgnKVxuICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMC43KTtcblxuICAgICAgICAgIC8vUmVtb3ZlIHRoZSBjbGlja2VkIGNpcmNsZVxuICAgICAgICAgIC8vY2xpY2tlZENpdHkucmVtb3ZlKCk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhjbGlja2VkQ2l0eSk7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cigneCcsIDY0MCp3aWR0aCpmYWN0b3IpXG4gICAgICAgICAgICAuYXR0cigneScsIDcyKmhlaWdodCpmYWN0b3IpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnZmxvd3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDE0KVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICAgICAgLnRleHQoYE5ldGZsb3c6ICR7ZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3d9YCk7XG4gICAgICAgICAgbGV0IGNsaWNrZWRDaXR5Q29vcmRzID0gW1xuICAgICAgICAgICAgcGFyc2VGbG9hdChjbGlja2VkQ2l0eS5hdHRyKCdjeCcpKSxcbiAgICAgICAgICAgIHBhcnNlRmxvYXQoY2xpY2tlZENpdHkuYXR0cignY3knKSksXG4gICAgICAgICAgXTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhvbmVEYXRlQ2l0aWVzRGF0YSk7XG4gICAgICAgICAgbGV0IGZpbHRlcmVkQ2l0aWVzID0gb25lRGF0ZUNpdGllc0RhdGEuZmlsdGVyKFxuICAgICAgICAgICAgZnVuY3Rpb24gKG9uZURhdGVDaXRpZXNEYXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fXG4gICAgICAgICAgICAgICAgICAuZGVzdF9jaXR5ID09PVxuICAgICAgICAgICAgICAgIG9uZURhdGVDaXRpZXNEYXRhLmRlc3RfY2l0eVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgaW5pX2Rlc3RfY2l0eSA9XG4gICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18uZGVzdF9jaXR5O1xuICAgICAgICAgIGNvbnNvbGUubG9nKGZpbHRlcmVkQ2l0aWVzKTtcbiAgICAgICAgICBzdmdcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUtaW5jb21lcicpXG4gICAgICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAgICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgbGV0IGN1cnZlID0gZDMuY3VydmVCdW5kbGUuYmV0YShcbiAgICAgICAgICAgICAgICAwLjA1XG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsaW5lIGdlbmVyYXRvclxuICAgICAgICAgICAgICBsZXQgbGluZUdlbmVyYXRvciA9IGQzXG4gICAgICAgICAgICAgICAgLmxpbmUoKVxuICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZFswXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZFsxXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jdXJ2ZShjdXJ2ZSk7XG4gICAgICAgICAgICAgIGxldCBvcmlnaW4gPSBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgICAgICBkLmRlc3RfbGF0LFxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50ID0gW1xuICAgICAgICAgICAgICAgIChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgLyA0LFxuICAgICAgICAgICAgICAgIChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgLyA0LFxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICBsZXQgbWlkUG9pbnQxID0gW1xuICAgICAgICAgICAgICAgICgob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pICpcbiAgICAgICAgICAgICAgICAgIDMpIC9cbiAgICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgICAgKChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgKlxuICAgICAgICAgICAgICAgICAgMykgL1xuICAgICAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50MiA9IFtcbiAgICAgICAgICAgICAgICAob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pIC8gMixcbiAgICAgICAgICAgICAgICAob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pIC8gMixcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50MyA9IFtcbiAgICAgICAgICAgICAgICAoKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAqXG4gICAgICAgICAgICAgICAgICA1KSAvXG4gICAgICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICAgICgob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pICpcbiAgICAgICAgICAgICAgICAgIDUpIC9cbiAgICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50NCA9IFtcbiAgICAgICAgICAgICAgICAoKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAqXG4gICAgICAgICAgICAgICAgICA2KSAvXG4gICAgICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICAgICgob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pICpcbiAgICAgICAgICAgICAgICAgIDYpIC9cbiAgICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIGxldCBtaWRQb2ludDUgPSBbXG4gICAgICAgICAgICAgICAgKChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgKlxuICAgICAgICAgICAgICAgICAgNykgL1xuICAgICAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICAgICAoKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAqXG4gICAgICAgICAgICAgICAgICA3KSAvXG4gICAgICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICBsZXQgbGluZURhdGEgPSBbXG4gICAgICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgICAgIG1pZFBvaW50LFxuICAgICAgICAgICAgICAgIG1pZFBvaW50MSxcbiAgICAgICAgICAgICAgICBtaWRQb2ludDIsXG4gICAgICAgICAgICAgICAgbWlkUG9pbnQzLFxuICAgICAgICAgICAgICAgIG1pZFBvaW50NCxcbiAgICAgICAgICAgICAgICBtaWRQb2ludDUsXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24sXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobGluZURhdGEpO1xuICAgICAgICAgICAgICByZXR1cm4gbGluZUdlbmVyYXRvcihsaW5lRGF0YSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmUtaW5jb21lcicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICdwdXJwbGUnKVxuICAgICAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAoZCkgPT4ge1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGQpO1xuICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcbiAgICAgICAgICAgICAgICBkLnBjdF9pbmNvbWVycy5yZXBsYWNlKCclJywgJycpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMC42KVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAgICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChtb3VzZUQpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cobW91c2VEKTtcbiAgICAgICAgICAgICAgY29uc3QgY2l0eW5hbWV0ZXh0ID0gc3ZnXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCA2NDAqd2lkdGgqZmFjdG9yKSAvLyByZWxhdGl2ZT9cbiAgICAgICAgICAgICAgICAuYXR0cigneScsIDI3KmhlaWdodCpmYWN0b3IpIC8vIHJlbGF0aXZlP1xuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LW5hbWUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxOClcbiAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICdibGFjaycpXG4gICAgICAgICAgICAgICAgLnRleHQoXG4gICAgICAgICAgICAgICAgICBgSW5jb21pbmcgJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5vcmlnaW5fY2l0eX06ICR7bW91c2VELnNyY0VsZW1lbnQuX19kYXRhX18ucGN0X2luY29tZXJzfWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhsaW5lRGF0YSk7XG4gICAgICAgICAgLy8gY29uc3Qgb3JpX2NpdGllcyA9IHN2Z1xuICAgICAgICAgIC8vICAgLnNlbGVjdEFsbCgnLm9yaS1jaXJjbGUnKVxuICAgICAgICAgIC8vICAgLmRhdGEoZmlsdGVyZWRDaXRpZXMpXG4gICAgICAgICAgLy8gICAuZW50ZXIoKVxuICAgICAgICAgIC8vICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAvLyAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgLy8gICAgIHJldHVybiBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAvLyAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgLy8gICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgIC8vICAgICBdKVswXTtcbiAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgLy8gICAuYXR0cignY3knLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIC8vICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgLy8gICAgICAgZC5vcmlnaW5fbG9uLFxuICAgICAgICAgIC8vICAgICAgIGQub3JpZ2luX2xhdCxcbiAgICAgICAgICAvLyAgICAgXSlbMV07XG4gICAgICAgICAgLy8gICB9KVxuICAgICAgICAgIC8vICAgLmF0dHIoJ3InLCA1KVxuICAgICAgICAgIC8vICAgLmF0dHIoJ2NsYXNzJywgJ29yaS1jaXJjbGUnKVxuICAgICAgICAgIC8vICAgLnN0eWxlKCdmaWxsJywgJ3BpbmsnKVxuICAgICAgICAgIC8vICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgLy8gICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxcHgnKVxuICAgICAgICAgIC8vICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKG1vdXNlRCk7XG4gICAgICAgICAgLy8gICAgIGNvbnN0IGNpdHluYW1ldGV4dCA9IHN2Z1xuICAgICAgICAgIC8vICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCd4JywgNjM1KVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCd5JywgMzAwKVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LW5hbWUnKVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxMilcbiAgICAgICAgICAvLyAgICAgICAuYXR0cignZmlsbCcsICdibHVlJylcbiAgICAgICAgICAvLyAgICAgICAudGV4dChcbiAgICAgICAgICAvLyAgICAgICAgIGAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLm9yaWdpbl9jaXR5fSwgUGN0IG9mIEluY29tZXJzOiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLnBjdF9pbmNvbWVyc31gXG4gICAgICAgICAgLy8gICAgICAgKTtcbiAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgLy8gICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgIC8vICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAvLyAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVMZWF2ZXJGbG93KCkge1xuICAgIGNzdignY2xlYW5fb3JpZ2luX2xlYXZlcnMuY3N2JywgKGQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKGQuZGF0ZSksXG4gICAgICAgIHBjdF9sZWF2ZXJzOiBkLnBjdF9sZWF2ZXJzLFxuICAgICAgICAvL3BjdF9sZWF2ZXJzIDogcGFyc2VGbG9hdChkLnBjdF9sZWF2ZXJzLnJlcGxhY2UoJyUnLCAnJykpLFxuICAgICAgICBuZXRmbG93OiArZC5uZXRmbG93LFxuICAgICAgICBvcmlnaW5fbGF0OiArZC5vcmlnaW5fbGF0LFxuICAgICAgICBvcmlnaW5fbG9uOiArZC5vcmlnaW5fbG9uLFxuICAgICAgICBkZXN0X2xhdDogK2QuZGVzdF9sYXQsXG4gICAgICAgIGRlc3RfbG9uOiArZC5kZXN0X2xvbixcbiAgICAgICAgb3JpZ2luX2NpdHk6IGQub3JpZ2luX2NpdHksXG4gICAgICAgIGRlc3RfY2l0eTogZC5kZXN0X2NpdHksXG4gICAgICB9O1xuICAgIH0pLnRoZW4oKGNpdGllcykgPT4ge1xuICAgICAgLy8gY29uc3Qgc2NhbGVSYWRpdXMgPSBzY2FsZUxpbmVhcigpXG4gICAgICAvLyAgIC5kb21haW4oWzAsIGQzLm1heChjaXRpZXMsIChkKSA9PiBkLmZsb3cpXSlcbiAgICAgIC8vICAgLnJhbmdlKFsyLCAyMF0pO1xuICAgICAgY29uc29sZS5sb2coY2l0aWVzKTtcbiAgICAgIGNvbnN0IG9uZURhdGVDaXRpZXNEYXRhID0gY2l0aWVzLmZpbHRlcihcbiAgICAgICAgKGQpID0+XG4gICAgICAgICAgZC5kYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgICAgICB0YXJnZXREYXRlLmdldFRpbWUoKVxuICAgICAgKTtcbiAgICAgIGxldCBmaWx0ZXJlZENpdGllcyA9IG9uZURhdGVDaXRpZXNEYXRhLmZpbHRlcihcbiAgICAgICAgZnVuY3Rpb24gKG9uZURhdGVDaXRpZXNEYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGluaV9vcmlnaW5fY2l0eSA9PT1cbiAgICAgICAgICAgIG9uZURhdGVDaXRpZXNEYXRhLm9yaWdpbl9jaXR5XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgICBzdmdcbiAgICAgICAgLnNlbGVjdEFsbCgnbGluZS1sZWF2ZXInKVxuICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgncGF0aCcpXG4gICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICBsZXQgY3VydmUgPSBkMy5jdXJ2ZUJ1bmRsZS5iZXRhKDAuMDUpO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsaW5lIGdlbmVyYXRvclxuICAgICAgICAgIGxldCBsaW5lR2VuZXJhdG9yID0gZDNcbiAgICAgICAgICAgIC5saW5lKClcbiAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkWzBdO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkWzFdO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jdXJ2ZShjdXJ2ZSk7XG4gICAgICAgICAgbGV0IG9yaWdpbiA9IHByb2plY3Rpb24oW1xuICAgICAgICAgICAgZC5vcmlnaW5fbG9uLFxuICAgICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgIF0pO1xuICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHByb2plY3Rpb24oW1xuICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgIGQuZGVzdF9sYXQsXG4gICAgICAgICAgXSk7XG4gICAgICAgICAgbGV0IG1pZFBvaW50ID0gW1xuICAgICAgICAgICAgKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAvIDQsXG4gICAgICAgICAgICAob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pIC8gNCxcbiAgICAgICAgICBdO1xuICAgICAgICAgIGxldCBtaWRQb2ludDEgPSBbXG4gICAgICAgICAgICAoKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAqIDMpIC9cbiAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICgob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pICogMykgL1xuICAgICAgICAgICAgICA4LFxuICAgICAgICAgIF07XG4gICAgICAgICAgbGV0IG1pZFBvaW50MiA9IFtcbiAgICAgICAgICAgIChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgLyAyLFxuICAgICAgICAgICAgKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAvIDIsXG4gICAgICAgICAgXTtcbiAgICAgICAgICBsZXQgbWlkUG9pbnQzID0gW1xuICAgICAgICAgICAgKChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgKiA1KSAvXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAoKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAqIDUpIC9cbiAgICAgICAgICAgICAgOCxcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgbGV0IG1pZFBvaW50NCA9IFtcbiAgICAgICAgICAgICgob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pICogNikgL1xuICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgKChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgKiA2KSAvXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgXTtcbiAgICAgICAgICBsZXQgbWlkUG9pbnQ1ID0gW1xuICAgICAgICAgICAgKChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgKiA3KSAvXG4gICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAoKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAqIDcpIC9cbiAgICAgICAgICAgICAgOCxcbiAgICAgICAgICBdO1xuICAgICAgICAgIGxldCBsaW5lRGF0YSA9IFtcbiAgICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICAgIG1pZFBvaW50LFxuICAgICAgICAgICAgbWlkUG9pbnQxLFxuICAgICAgICAgICAgbWlkUG9pbnQyLFxuICAgICAgICAgICAgbWlkUG9pbnQzLFxuICAgICAgICAgICAgbWlkUG9pbnQ0LFxuICAgICAgICAgICAgbWlkUG9pbnQ1LFxuICAgICAgICAgICAgZGVzdGluYXRpb24sXG4gICAgICAgICAgXTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhsaW5lRGF0YSk7XG4gICAgICAgICAgcmV0dXJuIGxpbmVHZW5lcmF0b3IobGluZURhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnbGluZS1sZWF2ZXInKVxuICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICdncmVlbicpXG4gICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgKGQpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcbiAgICAgICAgICAgIGQucGN0X2xlYXZlcnMucmVwbGFjZSgnJScsICcnKVxuICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDAuNilcbiAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAgIC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKG1vdXNlRCk7XG4gICAgICAgICAgY29uc3QgY2l0eW5hbWV0ZXh0ID0gc3ZnXG4gICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKCd4JywgNjQwKndpZHRoKmZhY3RvcikgLy8gcmVsYXRpdmU/XG4gICAgICAgICAgICAuYXR0cigneScsIDI3KndpZHRoKmZhY3RvcikgLy8gcmVsYXRpdmU/XG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1uYW1lJylcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxOClcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICBgT3V0Z29pbmcgJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5kZXN0X2NpdHl9OiAgJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5wY3RfbGVhdmVyc31gXG4gICAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIGxldCBjaXR5Q2lyY2xlcyA9IHN2Z1xuICAgICAgICAuc2VsZWN0QWxsKCdjaXJjbGUnKVxuICAgICAgICAuZGF0YShvbmVEYXRlQ2l0aWVzRGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NpdHknKVxuICAgICAgICAuYXR0cignY3gnLCAoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgIGQub3JpZ2luX2xvbixcbiAgICAgICAgICAgIGQub3JpZ2luX2xhdCxcbiAgICAgICAgICBdKVswXTtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2N5JywgKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICBkLm9yaWdpbl9sYXQsXG4gICAgICAgICAgXSlbMV07XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2dvbGQnKVxuICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMXB4JylcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvd1xuICAgICAgICAgICk7XG4gICAgICAgICAgLy9zZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgLmR1cmF0aW9uKDIwMClcbiAgICAgICAgICAgIC8vLmF0dHIoJ3InLCAxMClcbiAgICAgICAgICAgIC5hdHRyKCdyJywgKHJEYXRhKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyA+PSAwXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZShcbiAgICAgICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ICpcbiAgICAgICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkaXVzU2NhbGUoXG4gICAgICAgICAgICAgICAgICAtZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgKlxuICAgICAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy8uc3R5bGUoJ2ZpbGwnLCAnYmx1ZScpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywockRhdGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ID49IDBcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdyZWQnO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAnYmx1ZSc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pICAuc3R5bGUoJ29wYWNpdHknLCAwLjUpOztcblxuICAgICAgICAgIGNvbnN0IGNpdHluYW1ldGV4dCA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cigneCcsIDY0MCp3aWR0aCpmYWN0b3IpIC8vcmVsYXRpdmU/XG4gICAgICAgICAgICAuYXR0cigneScsIDMwKmhlaWdodCpmYWN0b3IpIC8vcmVsYXRpdmU/XG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1uYW1lJylcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxOClcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICBgJHtkLnNyY0VsZW1lbnQuX19kYXRhX18ub3JpZ2luX2NpdHl9LCBOZXRmbG93OiAke2Quc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93fWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgLmF0dHIoJ3InLCA1KVxuICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2dvbGQnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvd1xuICAgICAgICAgICk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1sZWF2ZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBsZXQgY2xpY2tlZENpdHkgPSBzZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjbGlja2VkQ2l0eSk7XG4gICAgICAgICAgLy8gY29uc3QgY3VydmUgPSBkMy5saW5lKCkuY3VydmUoZDMuY3VydmVOYXR1cmFsKTtcbiAgICAgICAgICBjb25zdCBuZXdDaXJjbGUgPSBzdmdcbiAgICAgICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1jbGlja2VkJylcbiAgICAgICAgICAgIC5hdHRyKCdjeCcsIGNsaWNrZWRDaXR5LmF0dHIoJ2N4JykpXG4gICAgICAgICAgICAuYXR0cignY3knLCBjbGlja2VkQ2l0eS5hdHRyKCdjeScpKVxuICAgICAgICAgICAgLmF0dHIoJ3InLCAockRhdGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ID49IDBcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhZGl1c1NjYWxlKFxuICAgICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgKlxuICAgICAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZShcbiAgICAgICAgICAgICAgICAgIC1kLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyAqXG4gICAgICAgICAgICAgICAgICAgIDAuNVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYXR0cigncicsIDUpXG4gICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnZ3JlZW4nKVxuICAgICAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxcHgnKVxuICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMC43KTtcblxuICAgICAgICAgIC8vUmVtb3ZlIHRoZSBjbGlja2VkIGNpcmNsZVxuICAgICAgICAgIC8vY2xpY2tlZENpdHkucmVtb3ZlKCk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhjbGlja2VkQ2l0eSk7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cigneCcsIDY0MCp3aWR0aCpmYWN0b3IpXG4gICAgICAgICAgICAuYXR0cigneScsIDcyKmhlaWdodCpmYWN0b3IpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnZmxvd3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDE0KVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICAgICAgLnRleHQoYE5ldGZsb3c6ICR7ZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3d9YCk7XG4gICAgICAgICAgbGV0IGNsaWNrZWRDaXR5Q29vcmRzID0gW1xuICAgICAgICAgICAgcGFyc2VGbG9hdChjbGlja2VkQ2l0eS5hdHRyKCdjeCcpKSxcbiAgICAgICAgICAgIHBhcnNlRmxvYXQoY2xpY2tlZENpdHkuYXR0cignY3knKSksXG4gICAgICAgICAgXTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhvbmVEYXRlQ2l0aWVzRGF0YSk7XG4gICAgICAgICAgbGV0IGZpbHRlcmVkQ2l0aWVzID0gb25lRGF0ZUNpdGllc0RhdGEuZmlsdGVyKFxuICAgICAgICAgICAgZnVuY3Rpb24gKG9uZURhdGVDaXRpZXNEYXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fXG4gICAgICAgICAgICAgICAgICAub3JpZ2luX2NpdHkgPT09XG4gICAgICAgICAgICAgICAgb25lRGF0ZUNpdGllc0RhdGEub3JpZ2luX2NpdHlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICAgIGluaV9vcmlnaW5fY2l0eSA9XG4gICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ub3JpZ2luX2NpdHk7XG4gICAgICAgICAgY29uc29sZS5sb2coZmlsdGVyZWRDaXRpZXMpO1xuXG4gICAgICAgICAgc3ZnXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lLWxlYXZlcicpXG4gICAgICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAgICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgbGV0IGN1cnZlID0gZDMuY3VydmVCdW5kbGUuYmV0YShcbiAgICAgICAgICAgICAgICAwLjA1XG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsaW5lIGdlbmVyYXRvclxuICAgICAgICAgICAgICBsZXQgbGluZUdlbmVyYXRvciA9IGQzXG4gICAgICAgICAgICAgICAgLmxpbmUoKVxuICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZFswXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZFsxXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jdXJ2ZShjdXJ2ZSk7XG4gICAgICAgICAgICAgIGxldCBvcmlnaW4gPSBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgICAgICBkLmRlc3RfbGF0LFxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50ID0gW1xuICAgICAgICAgICAgICAgIChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgLyA0LFxuICAgICAgICAgICAgICAgIChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgLyA0LFxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICBsZXQgbWlkUG9pbnQxID0gW1xuICAgICAgICAgICAgICAgICgob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pICpcbiAgICAgICAgICAgICAgICAgIDMpIC9cbiAgICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgICAgKChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgKlxuICAgICAgICAgICAgICAgICAgMykgL1xuICAgICAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50MiA9IFtcbiAgICAgICAgICAgICAgICAob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pIC8gMixcbiAgICAgICAgICAgICAgICAob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pIC8gMixcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50MyA9IFtcbiAgICAgICAgICAgICAgICAoKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAqXG4gICAgICAgICAgICAgICAgICA1KSAvXG4gICAgICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICAgICgob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pICpcbiAgICAgICAgICAgICAgICAgIDUpIC9cbiAgICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50NCA9IFtcbiAgICAgICAgICAgICAgICAoKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAqXG4gICAgICAgICAgICAgICAgICA2KSAvXG4gICAgICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICAgICgob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pICpcbiAgICAgICAgICAgICAgICAgIDYpIC9cbiAgICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIGxldCBtaWRQb2ludDUgPSBbXG4gICAgICAgICAgICAgICAgKChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgKlxuICAgICAgICAgICAgICAgICAgNykgL1xuICAgICAgICAgICAgICAgICAgOCxcbiAgICAgICAgICAgICAgICAoKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAqXG4gICAgICAgICAgICAgICAgICA3KSAvXG4gICAgICAgICAgICAgICAgICA4LFxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICBsZXQgbGluZURhdGEgPSBbXG4gICAgICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgICAgIG1pZFBvaW50LFxuICAgICAgICAgICAgICAgIG1pZFBvaW50MSxcbiAgICAgICAgICAgICAgICBtaWRQb2ludDIsXG4gICAgICAgICAgICAgICAgbWlkUG9pbnQzLFxuICAgICAgICAgICAgICAgIG1pZFBvaW50NCxcbiAgICAgICAgICAgICAgICBtaWRQb2ludDUsXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24sXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGxpbmVEYXRhKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGxpbmVHZW5lcmF0b3IobGluZURhdGEpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5lLWxlYXZlcicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICdncmVlbicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsIChkKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcbiAgICAgICAgICAgICAgICBkLnBjdF9sZWF2ZXJzLnJlcGxhY2UoJyUnLCAnJylcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwLjYpXG4gICAgICAgICAgICAuYXR0cignZmlsbCcsICdub25lJylcbiAgICAgICAgICAgIC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtb3VzZUQpO1xuICAgICAgICAgICAgICBjb25zdCBjaXR5bmFtZXRleHQgPSBzdmdcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgICAgICAuYXR0cigneCcsIDY0MCp3aWR0aCpmYWN0b3IpIC8vcmVsYXRpdmU/XG4gICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAyNypoZWlnaHQqZmFjdG9yKSAvL3JlbGF0aXZlP1xuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LW5hbWUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxOClcbiAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICdibGFjaycpXG4gICAgICAgICAgICAgICAgLnRleHQoXG4gICAgICAgICAgICAgICAgICBgT3V0Z29pbmcgJHttb3VzZUQuc3JjRWxlbWVudC5fX2RhdGFfXy5kZXN0X2NpdHl9OiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLnBjdF9sZWF2ZXJzfWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBjb25zdCBkZXNfY2l0aWVzID0gc3ZnXG4gICAgICAgICAgLy8gICAuc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpXG4gICAgICAgICAgLy8gICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgICAvLyAgIC5lbnRlcigpXG4gICAgICAgICAgLy8gICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgIC8vICAgLmF0dHIoJ2N4JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAvLyAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgIC8vICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgLy8gICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICAvLyAgICAgXSlbMF07XG4gICAgICAgICAgLy8gICB9KVxuICAgICAgICAgIC8vICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAvLyAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgIC8vICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgLy8gICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICAvLyAgICAgXSlbMV07XG4gICAgICAgICAgLy8gICB9KVxuICAgICAgICAgIC8vICAgLmF0dHIoJ3InLCA1KVxuICAgICAgICAgIC8vICAgLmF0dHIoJ2NsYXNzJywgJ2Rlcy1jaXJjbGUnKVxuICAgICAgICAgIC8vICAgLnN0eWxlKCdmaWxsJywgJ2dvbGQnKVxuICAgICAgICAgIC8vICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgLy8gICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxcHgnKVxuICAgICAgICAgIC8vICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKG1vdXNlRCk7XG4gICAgICAgICAgLy8gICAgIGNvbnN0IGNpdHluYW1ldGV4dCA9IHN2Z1xuICAgICAgICAgIC8vICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCd4JywgNjM1KVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCd5JywgMzAwKVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LW5hbWUnKVxuICAgICAgICAgIC8vICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxMilcbiAgICAgICAgICAvLyAgICAgICAuYXR0cignZmlsbCcsICdibHVlJylcbiAgICAgICAgICAvLyAgICAgICAudGV4dChcbiAgICAgICAgICAvLyAgICAgICAgIGAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLmRlc3RfY2l0eX0sIFBjdCBvZiBMZWF2ZXJzOiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLnBjdF9sZWF2ZXJzfWBcbiAgICAgICAgICAvLyAgICAgICApO1xuICAgICAgICAgIC8vICAgfSlcbiAgICAgICAgICAvLyAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgLy8gICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgIC8vICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTtcbiJdLCJuYW1lcyI6WyJkaXNwYXRjaCIsInNlbGVjdCIsInNlbGVjdEFsbCIsImpzb24iLCJmZWF0dXJlIiwiY3N2Il0sIm1hcHBpbmdzIjoiOzs7RUFDTyxNQUFNLElBQUksR0FBRyxNQUFNO0VBQzFCLEVBQUUsSUFBSSxFQUFFLENBQUM7RUFDVCxFQUFFLElBQUksU0FBUyxDQUFDO0VBQ2hCLEVBQUUsSUFBSSxPQUFPLENBQUM7RUFDZCxFQUFFLE1BQU0sU0FBUyxHQUFHQSxhQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDdkMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFNBQVMsS0FBSztFQUM1QjtFQUNBLElBQUksU0FBUztFQUNiLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQztFQUN6QixPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztFQUNwQixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO0VBQ3RCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZCO0VBQ0EsSUFBSSxTQUFTO0VBQ2IsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDO0VBQzFCLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQ3JCLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7RUFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztFQUNyQixPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEtBQUs7RUFDL0I7RUFDQSxRQUFRLFNBQVMsQ0FBQyxJQUFJO0VBQ3RCLFVBQVUsUUFBUTtFQUNsQixVQUFVLElBQUk7RUFDZCxVQUFVLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSztFQUM1QixTQUFTLENBQUM7RUFDVixPQUFPLENBQUM7RUFDUixPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7RUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0VBQ3BCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztFQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztFQUNwQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDM0IsR0FBRyxDQUFDO0FBQ0o7RUFDQSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLEVBQUU7RUFDdkIsSUFBSSxPQUFPLFNBQVMsQ0FBQyxNQUFNO0VBQzNCLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7RUFDckIsUUFBUSxFQUFFLENBQUM7RUFDWCxHQUFHLENBQUM7RUFDSixFQUFFLEVBQUUsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLEVBQUU7RUFDOUIsSUFBSSxPQUFPLFNBQVMsQ0FBQyxNQUFNO0VBQzNCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUU7RUFDNUIsUUFBUSxTQUFTLENBQUM7RUFDbEIsR0FBRyxDQUFDO0FBQ0o7RUFDQSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLEVBQUU7RUFDNUIsSUFBSSxPQUFPLFNBQVMsQ0FBQyxNQUFNO0VBQzNCLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUU7RUFDMUIsUUFBUSxPQUFPLENBQUM7RUFDaEIsR0FBRyxDQUFDO0FBQ0o7RUFDQSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsWUFBWTtFQUN0QixJQUFJLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSztFQUNsQyxNQUFNLFNBQVM7RUFDZixNQUFNLFNBQVM7RUFDZixLQUFLLENBQUM7RUFDTixJQUFJLE9BQU8sS0FBSyxLQUFLLFNBQVMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDO0VBQzVDLEdBQUcsQ0FBQztFQUNKLEVBQUUsT0FBTyxFQUFFLENBQUM7RUFDWixDQUFDOztFQ25ERCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztFQUNwQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztFQUN0QyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUM7RUFDckIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUNyQyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDbkI7RUFDQTtFQUNBLFNBQVM7RUFDVCxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDbkIsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztFQUNsQixHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO0VBQ2pCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7RUFDZixHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO0VBQ3ZCLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUN6QixTQUFTO0VBQ1QsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ25CLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7RUFDbEIsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztFQUNqQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0VBQ2YsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztFQUN4QixHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDekIsU0FBUztFQUNULEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNqQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ2pCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7RUFDaEIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7RUFDNUIsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQztFQUM3QixHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQztFQUN4QyxTQUFTO0VBQ1QsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2pCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDakIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztFQUNoQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztFQUM1QixHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO0VBQzdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0VBQ3hDLFNBQVM7RUFDVCxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDakIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUNqQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0VBQ2hCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7RUFDZixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO0VBQ3BCLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7RUFDcEIsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztFQUMxQixHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDekIsU0FBUztFQUNULEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNqQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ2pCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7RUFDaEIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztFQUNmLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7RUFDcEIsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztFQUNwQixHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQ3pCLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUN6QixTQUFTO0VBQ1QsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2pCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDakIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztFQUNoQixHQUFHLElBQUksQ0FBQywyQ0FBMkMsQ0FBQztFQUNwRCxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO0VBQzdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0VBQ3hDLFNBQVM7RUFDVCxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDakIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUNqQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0VBQ2hCLEdBQUcsSUFBSSxDQUFDLDhDQUE4QyxDQUFDO0VBQ3ZELEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7RUFDN0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEM7RUFDQSxNQUFNLEdBQUcsR0FBR0MsV0FBTSxDQUFDLE1BQU0sQ0FBQztFQUMxQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7RUFDaEIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQztFQUN2QixHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDMUI7RUFDQSxNQUFNLGFBQWEsR0FBR0EsV0FBTSxDQUFDLE1BQU0sQ0FBQztFQUNwQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7RUFDaEIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7RUFDbkMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUMxQztFQUNBO0VBQ0EsSUFBSSxVQUFVLEdBQUcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdEMsSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDO0VBQzdCO0VBQ0EsTUFBTSxXQUFXLEdBQUc7RUFDcEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7RUFDdkIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7RUFDdkIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7RUFDdkIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7RUFDdkIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7RUFDdkIsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7RUFDdEIsQ0FBQyxDQUFDO0FBQ0Y7RUFDQTtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0EsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWM7RUFDM0MsRUFBRSxhQUFhO0VBQ2YsQ0FBQyxDQUFDO0VBQ0Y7RUFDQSxNQUFNLHNCQUFzQixHQUFHLFlBQVk7RUFDM0MsRUFBRUMsY0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JDLEVBQUVBLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QyxFQUFFQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDcEMsRUFBRUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3BDLEVBQUVBLGNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNsQyxFQUFFQSxjQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEMsRUFBRUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3BDLEVBQUVBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNwQyxFQUFFQSxjQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDbkMsRUFBRUEsY0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzlCLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQztFQUNmLE1BQU0sSUFBSSxRQUFRLEtBQUssYUFBYSxFQUFFO0VBQ3RDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQ2pDLEtBQUssTUFBTSxJQUFJLFFBQVEsS0FBSyxjQUFjLEVBQUU7RUFDNUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztFQUNuQyxDQUFDLENBQUM7RUFDRixXQUFXLENBQUMsZ0JBQWdCO0VBQzVCLEVBQUUsT0FBTztFQUNULEVBQUUsc0JBQXNCO0VBQ3hCLENBQUMsQ0FBQztFQUNGO0VBQ0EsSUFBSSxNQUFNLEdBQUcsZUFBZSxDQUFDO0FBQzdCO0VBQ0E7RUFDQSxNQUFNLFVBQVUsR0FBRyxFQUFFO0VBQ3JCLEdBQUcsWUFBWSxFQUFFO0VBQ2pCLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNoRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzNCLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakQ7RUFDQSxJQUFJLFdBQVcsR0FBRyxFQUFFO0VBQ3BCLEdBQUcsV0FBVyxFQUFFO0VBQ2hCLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQ3JCLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEI7QUFDQUMsV0FBSTtFQUNKLEVBQUUsa0RBQWtEO0VBQ3BELENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUs7RUFDZjtFQUNBLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNsQixFQUFFLE1BQU0sR0FBRyxHQUFHQyxnQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzdDLEVBQUUsSUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDO0VBQ2hDLEVBQUUsSUFBSSxlQUFlLEdBQUcsU0FBUyxDQUFDO0VBQ2xDLEVBQUUsR0FBRztFQUNMLEtBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQztFQUNoQixLQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUM7RUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztFQUN2QixLQUFLLEtBQUssRUFBRTtFQUNaLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0VBQ3BCLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7RUFDMUIsS0FBSyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztFQUM1QixLQUFLLEtBQUssQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7RUFDcEMsRUFBRSxNQUFNLE9BQU8sR0FBRztFQUNsQixJQUFJLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFO0VBQ2xELElBQUk7RUFDSixNQUFNLEtBQUssRUFBRSxjQUFjO0VBQzNCLE1BQU0sSUFBSSxFQUFFLGNBQWM7RUFDMUIsS0FBSztFQUNMO0VBQ0EsR0FBRyxDQUFDO0VBQ0osRUFBRSxNQUFNLE9BQU8sR0FBRyxHQUFHO0VBQ3JCLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2hDLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7RUFDL0IsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztFQUMxQixLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQzFCLEtBQUssSUFBSTtFQUNULE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDekIsS0FBSyxDQUFDO0VBQ04sRUFBRSxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYztFQUN0QyxJQUFJLGFBQWE7RUFDakIsR0FBRyxDQUFDO0FBQ0o7RUFDQTtFQUNBLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUN0QixJQUFJLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7RUFDN0QsRUFBRSxJQUFJLFFBQVEsQ0FBQztFQUNmLEVBQUUsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3hCO0VBQ0E7RUFDQSxFQUFFLE1BQU0sVUFBVSxHQUFHLE1BQU07RUFDM0IsSUFBSSxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3ZDLElBQUksTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQztFQUNBLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxNQUFNO0VBQ2pDLE1BQU0sSUFBSSxLQUFLLElBQUksUUFBUSxFQUFFO0VBQzdCLFFBQVEsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7RUFDekIsUUFBUSxVQUFVLEVBQUUsQ0FBQztFQUNyQixZQUFZLFNBQVMsR0FBRyxLQUFLLENBQUM7RUFDOUIsSUFBSSxVQUFVLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztFQUNwQyxRQUFRLE9BQU87RUFDZixPQUFPO0VBQ1AsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3RDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUMzQixNQUFNLEtBQUssRUFBRSxDQUFDO0VBQ2QsTUFBTSxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztFQUMzQixNQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztFQUMvQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDWixHQUFHLENBQUM7QUFDSjtFQUNBO0VBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTTtFQUN6QixFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUMxQixDQUFDLENBQUM7QUFDRjtFQUNBO0VBQ0EsRUFBRSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU07RUFDN0MsTUFBTSxJQUFJLFNBQVMsRUFBRTtFQUNyQjtFQUNBLElBQUksVUFBVSxFQUFFLENBQUM7RUFDakIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0VBQ3RCLElBQUksVUFBVSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7RUFDcEMsR0FBRyxNQUFNO0VBQ1Q7RUFDQSxJQUFJLFVBQVUsRUFBRSxDQUFDO0VBQ2pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztFQUNyQixJQUFJLFVBQVUsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0VBQ3BDLEdBQUc7RUFDSCxHQUFHLENBQUMsQ0FBQztFQUNMLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFZO0VBQy9DLElBQUksTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUN2QyxJQUFJRixjQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFHckMsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3BDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUM1QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDMUI7RUFDQSxJQUFJO0VBQ0osTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzFCLE1BQU0sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtFQUM5QixNQUFNO0VBQ04sTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0VBQy9CLEtBQUssTUFBTTtFQUNYLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUMxQixNQUFNLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDOUIsTUFBTTtFQUNOLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsTUFBTSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0VBQzlCLE1BQU07RUFDTixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7RUFDL0IsS0FBSyxNQUFNO0VBQ1gsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzFCLE1BQU0sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtFQUM5QixNQUFNO0VBQ04sTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0VBQy9CLEtBQUssTUFBTTtFQUNYLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUMxQixNQUFNLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDOUIsTUFBTTtFQUNOLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsTUFBTSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0VBQzlCLE1BQU07RUFDTixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7RUFDL0IsS0FBSyxNQUFNO0VBQ1gsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzFCLE1BQU0sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtFQUM5QixNQUFNO0VBQ04sTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0VBQy9CLEtBQUssTUFBTTtFQUNYLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUMxQixNQUFNLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDOUIsTUFBTTtFQUNOLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsTUFBTSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0VBQzlCLE1BQU07RUFDTixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7RUFDL0IsS0FBSyxNQUFNO0VBQ1gsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzFCLE1BQU0sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtFQUM5QixNQUFNO0VBQ04sTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0VBQy9CLEtBQUssTUFBTTtFQUNYLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUMxQixNQUFNLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDL0IsTUFBTTtFQUNOLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsTUFBTSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFO0VBQy9CLE1BQU07RUFDTixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7RUFDL0IsS0FBSyxNQUFNO0VBQ1gsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzFCLE1BQU0sV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRTtFQUMvQixNQUFNO0VBQ04sTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0VBQy9CLEtBQUssTUFBTTtFQUNYLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUMxQixNQUFNLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDL0IsTUFBTTtFQUNOLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsTUFBTSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFO0VBQy9CLE1BQU07RUFDTixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7RUFDL0IsS0FBSyxNQUFNO0VBQ1gsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzFCLE1BQU0sV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRTtFQUMvQixNQUFNO0VBQ04sTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0VBQy9CLEtBQUssTUFBTTtFQUNYLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUMxQixNQUFNLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDL0IsTUFBTTtFQUNOLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsTUFBTSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFO0VBQy9CLE1BQU07RUFDTixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7RUFDL0IsS0FBSyxNQUFNO0VBQ1gsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzFCLE1BQU0sV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRTtFQUMvQixNQUFNO0VBQ04sTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDO0VBQy9CLEtBQUssTUFBTTtFQUNYLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUMxQixNQUFNLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDL0IsTUFBTTtFQUNOLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDMUIsTUFBTSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFO0VBQy9CLE1BQU07RUFDTixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7RUFDL0IsS0FBSztBQUNMO0VBQ0EsSUFBSSxNQUFNLFlBQVksR0FBRyxHQUFHO0VBQzVCLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNyQixPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDbEMsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2xDLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7RUFDakMsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztFQUM1QixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQzVCLE9BQU8sSUFBSTtFQUNYLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDM0IsT0FBTyxDQUFDO0FBQ1I7RUFDQSxJQUFJLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztFQUN0QixNQUFNQSxjQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDekMsTUFBTUEsY0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzFDLE1BQU1BLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN4QyxNQUFNQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDeEMsTUFBTUEsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLE1BQU1BLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMxQyxNQUFNQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDeEMsTUFBTUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3hDLE1BQU1BLGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN2QyxNQUFNQSxjQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDbEMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7RUFDeEMsS0FBSyxLQUFJO0VBQ1QsSUFBSSxJQUFJLFFBQVEsS0FBSyxhQUFhLEVBQUU7RUFDcEM7RUFDQTtFQUNBLE1BQU1BLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN4QyxNQUFNQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDeEMsTUFBTUEsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsTUFBTUEsY0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2xDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQ2pDLEtBQUssTUFBTSxJQUFJLFFBQVEsS0FBSyxjQUFjLEVBQUU7RUFDNUM7RUFDQTtFQUNBLE1BQU1BLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN4QyxNQUFNQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDeEMsTUFBTUEsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsTUFBTUEsY0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2xDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0VBQ2xDLEtBQUssQ0FBQztFQUNOLEdBQUcsQ0FBQyxDQUFDO0FBQ0w7QUFDQTtBQUNBO0VBQ0EsRUFBRSxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYztFQUM5QyxJQUFJLGNBQWM7RUFDbEIsR0FBRyxDQUFDO0VBQ0osSUFBSSxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYztFQUNoRCxJQUFJLGNBQWM7RUFDbEIsR0FBRyxDQUFDO0VBQ0osSUFBSSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsY0FBYztFQUNqRCxJQUFJLGVBQWU7RUFDbkIsR0FBRyxDQUFDO0FBQ0o7RUFDQSxFQUFFLE1BQU0sdUJBQXVCLEdBQUcsWUFBWTtFQUM5QyxJQUFJQSxjQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdkMsSUFBSUEsY0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3hDLElBQUlBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QyxJQUFJQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEMsSUFBSUEsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3BDLElBQUlBLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN4QyxJQUFJQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEMsSUFBSUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLElBQUlBLGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNyQyxJQUFJQSxjQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDaEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzVCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUMxQjtFQUNBLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztFQUNsQixJQUFJRyxRQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEtBQUs7RUFDcEMsTUFBTSxPQUFPO0VBQ2IsUUFBUSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM5QixRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtFQUNwQixRQUFRLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPO0VBQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUc7RUFDbkIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRztFQUNuQixPQUFPLENBQUM7RUFDUixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUs7RUFDeEIsTUFBTSxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxNQUFNO0VBQzdDLFFBQVEsQ0FBQyxDQUFDO0VBQ1YsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtFQUMxQixVQUFVLFVBQVUsQ0FBQyxPQUFPLEVBQUU7RUFDOUIsT0FBTyxDQUFDO0VBQ1IsTUFBTSxNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNO0VBQ3JELFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDO0VBQzdCLE9BQU8sQ0FBQztFQUNSLE1BQU0sTUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsTUFBTTtFQUNyRCxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztFQUM1QixPQUFPLENBQUM7RUFDUixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDbEMsTUFBTSxJQUFJLFlBQVksR0FBRyxHQUFHO0VBQzVCLFNBQVMsU0FBUyxDQUFDLGFBQWEsQ0FBQztFQUNqQyxTQUFTLElBQUksQ0FBQyxjQUFjLENBQUM7RUFDN0IsU0FBUyxLQUFLLEVBQUU7RUFDaEIsU0FBUyxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3pCLFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUM7RUFDcEMsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQzNCLFVBQVUsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQy9DLFNBQVMsQ0FBQztFQUNWLFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSztFQUMzQixVQUFVLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvQyxTQUFTLENBQUM7RUFDVixTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUs7RUFDMUIsVUFBVSxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFO0VBQzdCLFlBQVksT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQ2pELFdBQVc7RUFDWCxTQUFTLENBQUM7RUFDVixTQUFTLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO0VBQzlCLFNBQVMsS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7RUFDaEMsU0FBUyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQztFQUNyQyxTQUFTLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO0VBQzlCLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLE1BQU0sRUFBRTtFQUMzQyxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDOUIsVUFBVSxNQUFNLFlBQVksR0FBRyxHQUFHO0VBQ2xDLGFBQWEsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUMzQixhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDeEMsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ3hDLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7RUFDdkMsYUFBYSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztFQUNsQyxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQ2xDLGFBQWEsSUFBSTtFQUNqQixjQUFjLENBQUMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7RUFDMUYsYUFBYSxDQUFDO0VBQ2QsU0FBUyxDQUFDO0VBQ1YsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsTUFBTSxFQUFFO0VBQzFDLFVBQVVILGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMzQyxTQUFTLENBQUMsQ0FBQztFQUNYLE1BQU0sSUFBSSxXQUFXLEdBQUcsR0FBRztFQUMzQixTQUFTLFNBQVMsQ0FBQyxhQUFhLENBQUM7RUFDakMsU0FBUyxJQUFJLENBQUMsY0FBYyxDQUFDO0VBQzdCLFNBQVMsS0FBSyxFQUFFO0VBQ2hCLFNBQVMsTUFBTSxDQUFDLFFBQVEsQ0FBQztFQUN6QixTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDO0VBQ3BDLFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSztFQUMzQixVQUFVLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvQyxTQUFTLENBQUM7RUFDVixTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUs7RUFDM0IsVUFBVSxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDL0MsU0FBUyxDQUFDO0VBQ1YsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQzFCLFVBQVUsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRTtFQUM5QixZQUFZLE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7RUFDaEQsV0FBVztFQUNYLFNBQVMsQ0FBQztFQUNWLFNBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7RUFDN0IsU0FBUyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztFQUNoQyxTQUFTLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDO0VBQ3JDLFNBQVMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7RUFDOUIsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsTUFBTSxFQUFFO0VBQzNDLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUM5QixVQUFVLE1BQU0sWUFBWSxHQUFHLEdBQUc7RUFDbEMsYUFBYSxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzNCLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUN4QyxhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDeEMsYUFBYSxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztFQUN2QyxhQUFhLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0VBQ2xDLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7RUFDbEMsYUFBYSxJQUFJO0VBQ2pCLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztFQUMxRixhQUFhLENBQUM7RUFDZCxTQUFTLENBQUM7RUFDVixTQUFTLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxNQUFNLEVBQUU7RUFDMUMsVUFBVUEsY0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzNDLFNBQVMsQ0FBQyxDQUFDO0VBQ1gsS0FBSyxDQUFDLENBQUM7RUFDUCxHQUFHLENBQUM7RUFDSjtFQUNBLEVBQUUsTUFBTSx1QkFBdUIsR0FBRyxXQUFXO0VBQzdDLE1BQU1BLGNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN6QyxJQUFJQSxjQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDeEMsSUFBSUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLElBQUlBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QyxJQUFJQSxjQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDcEMsSUFBSUEsY0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3hDLElBQUlBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QyxJQUFJQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEMsSUFBSUEsY0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JDLElBQUlBLGNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNoQztFQUNBLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztFQUNuQixRQUFRLFFBQVEsR0FBRyxhQUFhLENBQUM7RUFDakMsSUFBSSxlQUFlLEdBQUcsYUFBYSxDQUFDO0VBQ3BDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQy9CLElBQUc7RUFDSCxJQUFJLE1BQU0sd0JBQXdCLEdBQUcsV0FBVztFQUNoRCxNQUFNQSxjQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDekMsSUFBSUEsY0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3hDLElBQUlBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QyxJQUFJQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEMsSUFBSUEsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3BDLElBQUlBLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN4QyxJQUFJQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdEMsSUFBSUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLElBQUlBLGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNyQyxJQUFJQSxjQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDaEM7RUFDQSxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7RUFDbkIsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDO0VBQ2hDLE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQztFQUN0QyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztFQUNoQyxJQUFHO0VBQ0gsRUFBRSxZQUFZLENBQUMsZ0JBQWdCO0VBQy9CLElBQUksT0FBTztFQUNYLElBQUksdUJBQXVCO0VBQzNCLEdBQUcsQ0FBQztFQUNKLElBQUksWUFBWSxDQUFDLGdCQUFnQjtFQUNqQyxJQUFJLE9BQU87RUFDWCxJQUFJLHVCQUF1QjtFQUMzQixHQUFHLENBQUM7RUFDSixJQUFJLGFBQWEsQ0FBQyxnQkFBZ0I7RUFDbEMsSUFBSSxPQUFPO0VBQ1gsSUFBSSx3QkFBd0I7RUFDNUIsR0FBRyxDQUFDO0FBQ0o7RUFDQSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztFQUNwQztFQUNBLEVBQUUsS0FBSyxDQUFDLElBQUk7RUFDWixJQUFJLElBQUksRUFBRTtFQUNWLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztFQUNuQixPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztFQUNuQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7RUFDdkIsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxLQUFLO0VBQ2hDO0VBQ0EsUUFBUSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzVCLFFBQVEsUUFBUSxHQUFHLE1BQU0sQ0FBQztFQUMxQixRQUFRLE1BQU0sQ0FBQyxLQUFLLENBQUM7RUFDckIsUUFBUSxJQUFJLE1BQU0sS0FBSyxhQUFhLEVBQUU7RUFDdEMsVUFBVUEsY0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzdDLFVBQVVBLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM5QyxVQUFVQSxjQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDMUMsVUFBVUEsY0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzlDLFVBQVVBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM1QyxVQUFVQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDNUMsS0FBS0EsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3ZDLFVBQVVBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM1QyxVQUFVQSxjQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDM0MsVUFBVUEsY0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0VBQ3JDLFNBQVMsTUFBTSxJQUFJLE1BQU0sS0FBSyxjQUFjLEVBQUU7RUFDOUMsVUFBVUEsY0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzdDLFVBQVVBLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM5QyxVQUFVQSxjQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDMUMsVUFBVUEsY0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzlDLFVBQVVBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM1QyxVQUFVQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDNUMsVUFBVUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzVDLFVBQVVBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM1QyxVQUFVQSxjQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDM0MsVUFBVUEsY0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0VBQ3RDLFNBQVM7RUFDVCxPQUFPLENBQUM7RUFDUixHQUFHLENBQUM7RUFDSjtFQUNBLEVBQUUsU0FBUyxpQkFBaUIsR0FBRztFQUMvQixJQUFJRyxRQUFHLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLEtBQUs7RUFDMUMsTUFBTSxPQUFPO0VBQ2IsUUFBUSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM5QixRQUFRLFlBQVksRUFBRSxDQUFDLENBQUMsWUFBWTtFQUNwQztFQUNBLFFBQVEsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU87RUFDM0IsUUFBUSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVTtFQUNqQyxRQUFRLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVO0VBQ2pDLFFBQVEsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVE7RUFDN0IsUUFBUSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUTtFQUM3QixRQUFRLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztFQUNsQyxRQUFRLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztFQUM5QixPQUFPLENBQUM7RUFDUixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUs7RUFDeEI7RUFDQTtFQUNBO0VBQ0EsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzlCLE1BQU0sTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsTUFBTTtFQUM3QyxRQUFRLENBQUMsQ0FBQztFQUNWLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7RUFDMUIsVUFBVSxVQUFVLENBQUMsT0FBTyxFQUFFO0VBQzlCLE9BQU8sQ0FBQztFQUNSO0VBQ0EsTUFBTSxJQUFJLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNO0VBQ25ELFFBQVEsVUFBVSxpQkFBaUIsRUFBRTtFQUNyQyxVQUFVO0VBQ1YsWUFBWSxhQUFhO0VBQ3pCLFlBQVksaUJBQWlCLENBQUMsU0FBUztFQUN2QyxZQUFZO0VBQ1osU0FBUztFQUNULE9BQU8sQ0FBQztFQUNSLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztFQUNsQyxNQUFNSCxjQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDMUMsTUFBTSxHQUFHO0VBQ1QsU0FBUyxTQUFTLENBQUMsY0FBYyxDQUFDO0VBQ2xDLFNBQVMsSUFBSSxDQUFDLGNBQWMsQ0FBQztFQUM3QixTQUFTLEtBQUssRUFBRTtFQUNoQixTQUFTLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDdkIsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0VBQ2hDLFVBQVUsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQ7RUFDQTtFQUNBLFVBQVUsSUFBSSxhQUFhLEdBQUcsRUFBRTtFQUNoQyxhQUFhLElBQUksRUFBRTtFQUNuQixhQUFhLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtFQUM1QixjQUFjLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFCLGFBQWEsQ0FBQztFQUNkLGFBQWEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0VBQzVCLGNBQWMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDMUIsYUFBYSxDQUFDO0VBQ2QsYUFBYSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDMUIsVUFBVSxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUM7RUFDbEMsWUFBWSxDQUFDLENBQUMsVUFBVTtFQUN4QixZQUFZLENBQUMsQ0FBQyxVQUFVO0VBQ3hCLFdBQVcsQ0FBQyxDQUFDO0VBQ2IsVUFBVSxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUM7RUFDdkMsWUFBWSxDQUFDLENBQUMsUUFBUTtFQUN0QixZQUFZLENBQUMsQ0FBQyxRQUFRO0VBQ3RCLFdBQVcsQ0FBQyxDQUFDO0VBQ2IsVUFBVSxJQUFJLFFBQVEsR0FBRztFQUN6QixZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzVDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDNUMsV0FBVyxDQUFDO0VBQ1osVUFBVSxJQUFJLFNBQVMsR0FBRztFQUMxQixZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDN0MsY0FBYyxDQUFDO0VBQ2YsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzdDLGNBQWMsQ0FBQztFQUNmLFdBQVcsQ0FBQztFQUNaLFVBQVUsSUFBSSxTQUFTLEdBQUc7RUFDMUIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM1QyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzVDLFdBQVcsQ0FBQztFQUNaLFVBQVUsSUFBSSxTQUFTLEdBQUc7RUFDMUIsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzdDLGNBQWMsQ0FBQztFQUNmLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM3QyxjQUFjLENBQUM7RUFDZixXQUFXLENBQUM7QUFDWjtFQUNBLFVBQVUsSUFBSSxTQUFTLEdBQUc7RUFDMUIsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzdDLGNBQWMsQ0FBQztFQUNmLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM3QyxjQUFjLENBQUM7RUFDZixXQUFXLENBQUM7RUFDWixVQUFVLElBQUksU0FBUyxHQUFHO0VBQzFCLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM3QyxjQUFjLENBQUM7RUFDZixZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDN0MsY0FBYyxDQUFDO0VBQ2YsV0FBVyxDQUFDO0VBQ1osVUFBVSxJQUFJLFFBQVEsR0FBRztFQUN6QixZQUFZLE1BQU07RUFDbEIsWUFBWSxRQUFRO0VBQ3BCLFlBQVksU0FBUztFQUNyQixZQUFZLFNBQVM7RUFDckIsWUFBWSxTQUFTO0VBQ3JCLFlBQVksU0FBUztFQUNyQixZQUFZLFNBQVM7RUFDckIsWUFBWSxXQUFXO0VBQ3ZCLFdBQVcsQ0FBQztFQUNaO0VBQ0EsVUFBVSxPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUN6QyxTQUFTLENBQUM7RUFDVixTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDO0VBQ3RDLFNBQVMsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7RUFDbEMsU0FBUyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQ3RDO0VBQ0EsVUFBVSxPQUFPLFVBQVU7RUFDM0IsWUFBWSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0VBQzNDLFdBQVcsQ0FBQztFQUNaLFNBQVMsQ0FBQztFQUNWLFNBQVMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7RUFDOUIsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztFQUM3QixTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxNQUFNLEVBQUU7RUFDM0MsVUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzlCLFVBQVUsTUFBTSxZQUFZLEdBQUcsR0FBRztFQUNsQyxhQUFhLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDM0IsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0VBQ3hDLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUN4QyxhQUFhLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO0VBQ3ZDLGFBQWEsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7RUFDbEMsYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztFQUNsQyxhQUFhLElBQUk7RUFDakIsY0FBYyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0VBQzlHLGFBQWEsQ0FBQztFQUNkLFNBQVMsQ0FBQztFQUNWLFNBQVMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFVLE1BQU0sRUFBRTtFQUMxQyxVQUFVQSxjQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDM0MsU0FBUyxDQUFDLENBQUM7QUFDWDtFQUNBLE1BQU0sSUFBSSxXQUFXLEdBQUcsR0FBRztFQUMzQixTQUFTLFNBQVMsQ0FBQyxPQUFPLENBQUM7RUFDM0IsU0FBUyxJQUFJLENBQUMsaUJBQWlCLENBQUM7RUFDaEMsU0FBUyxLQUFLLEVBQUU7RUFDaEIsU0FBUyxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3pCLFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7RUFDOUIsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQzNCLFVBQVUsT0FBTyxVQUFVLENBQUM7RUFDNUIsWUFBWSxDQUFDLENBQUMsUUFBUTtFQUN0QixZQUFZLENBQUMsQ0FBQyxRQUFRO0VBQ3RCLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2hCLFNBQVMsQ0FBQztFQUNWLFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSztFQUMzQixVQUFVLE9BQU8sVUFBVSxDQUFDO0VBQzVCLFlBQVksQ0FBQyxDQUFDLFFBQVE7RUFDdEIsWUFBWSxDQUFDLENBQUMsUUFBUTtFQUN0QixXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNoQixTQUFTLENBQUM7RUFDVixTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0VBQ3JCLFNBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7RUFDOUIsU0FBUyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztFQUNoQyxTQUFTLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDO0VBQ3JDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRTtFQUN0QztFQUNBLFVBQVUsT0FBTyxDQUFDLEdBQUc7RUFDckIsWUFBWSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPO0VBQ3pDLFdBQVcsQ0FBQztFQUNaO0VBQ0EsVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztFQUN6QixhQUFhLFVBQVUsRUFBRTtFQUN6QixhQUFhLFFBQVEsQ0FBQyxHQUFHLENBQUM7RUFDMUI7RUFDQSxhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEtBQUs7RUFDbEMsY0FBYztFQUNkLGdCQUFnQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksQ0FBQztFQUNsRCxnQkFBZ0I7RUFDaEIsZ0JBQWdCLE9BQU8sV0FBVztFQUNsQyxrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTztFQUMvQyxvQkFBb0IsR0FBRztFQUN2QixpQkFBaUIsQ0FBQztFQUNsQixlQUFlLE1BQU07RUFDckIsZ0JBQWdCLE9BQU8sV0FBVztFQUNsQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPO0VBQ2hELG9CQUFvQixHQUFHO0VBQ3ZCLGlCQUFpQixDQUFDO0VBQ2xCLGVBQWU7RUFDZixhQUFhLENBQUM7RUFDZCxhQUFhLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEtBQUs7RUFDckMsY0FBYztFQUNkLGdCQUFnQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksQ0FBQztFQUNsRCxnQkFBZ0I7RUFDaEIsZ0JBQWdCLE9BQU8sS0FBSyxDQUFDO0VBQzdCLGVBQWUsTUFBTTtFQUNyQixnQkFBZ0IsT0FBTyxNQUFNLENBQUM7RUFDOUIsZUFBZTtFQUNmLGFBQWEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQ3RDLFVBQVUsTUFBTSxZQUFZLEdBQUcsR0FBRztFQUNsQyxhQUFhLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDM0IsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0VBQ3hDLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUN4QyxhQUFhLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO0VBQ3ZDLGFBQWEsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7RUFDbEMsYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztFQUNsQyxhQUFhLElBQUk7RUFDakIsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUM3RixhQUFhLENBQUM7RUFDZCxTQUFTLENBQUM7RUFDVixTQUFTLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUU7RUFDckMsVUFBVUEsY0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzNDLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7RUFDekIsYUFBYSxVQUFVLEVBQUU7RUFDekIsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztFQUN6QixhQUFhLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDbkMsU0FBUyxDQUFDO0VBQ1YsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0VBQ2xDLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN6QixVQUFVLE9BQU8sQ0FBQyxHQUFHO0VBQ3JCLFlBQVksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTztFQUN6QyxXQUFXLENBQUM7RUFDWixVQUFVQSxjQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDOUMsVUFBVUEsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzFDLFVBQVVBLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM5QyxVQUFVQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDNUMsVUFBVUEsY0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzNDLFVBQVUsSUFBSSxXQUFXLEdBQUdELFdBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QztFQUNBO0VBQ0E7RUFDQSxVQUFVLE1BQU0sU0FBUyxHQUFHLEdBQUc7RUFDL0IsYUFBYSxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQzdCLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUM7RUFDMUMsYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDL0MsYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDL0MsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxLQUFLO0VBQ2xDLGNBQWM7RUFDZCxnQkFBZ0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUM7RUFDbEQsZ0JBQWdCO0VBQ2hCLGdCQUFnQixPQUFPLFdBQVc7RUFDbEMsa0JBQWtCLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU87RUFDL0Msb0JBQW9CLEdBQUc7RUFDdkIsaUJBQWlCLENBQUM7RUFDbEIsZUFBZSxNQUFNO0VBQ3JCLGdCQUFnQixPQUFPLFdBQVc7RUFDbEMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTztFQUNoRCxvQkFBb0IsR0FBRztFQUN2QixpQkFBaUIsQ0FBQztFQUNsQixlQUFlO0VBQ2YsYUFBYSxDQUFDO0VBQ2QsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztFQUN6QixhQUFhLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO0VBQ3BDLGFBQWEsS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7RUFDcEMsYUFBYSxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQztFQUN6QyxhQUFhLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbkM7RUFDQTtFQUNBO0VBQ0E7RUFDQSxVQUFVLE1BQU0sSUFBSSxHQUFHLEdBQUc7RUFDMUIsYUFBYSxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzNCLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUN4QyxhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDeEMsYUFBYSxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQztFQUN0QyxhQUFhLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0VBQ2xDLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7RUFDbEMsYUFBYSxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQy9ELFVBQVUsSUFBSSxpQkFBaUIsR0FBRztFQUNsQyxZQUFZLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlDLFlBQVksVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDOUMsV0FBVyxDQUFDO0VBQ1osVUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7RUFDekMsVUFBVSxJQUFJLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNO0VBQ3ZELFlBQVksVUFBVSxpQkFBaUIsRUFBRTtFQUN6QyxjQUFjO0VBQ2QsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUTtFQUNyQyxtQkFBbUIsU0FBUztFQUM1QixnQkFBZ0IsaUJBQWlCLENBQUMsU0FBUztFQUMzQyxnQkFBZ0I7RUFDaEIsYUFBYTtFQUNiLFdBQVcsQ0FBQztFQUNaLFVBQVUsYUFBYTtFQUN2QixZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztFQUM1QyxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDdEMsVUFBVSxHQUFHO0VBQ2IsYUFBYSxTQUFTLENBQUMsY0FBYyxDQUFDO0VBQ3RDLGFBQWEsSUFBSSxDQUFDLGNBQWMsQ0FBQztFQUNqQyxhQUFhLEtBQUssRUFBRTtFQUNwQixhQUFhLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDM0IsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0VBQ3BDLGNBQWMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJO0VBQzdDLGdCQUFnQixJQUFJO0VBQ3BCLGVBQWUsQ0FBQztBQUNoQjtFQUNBO0VBQ0EsY0FBYyxJQUFJLGFBQWEsR0FBRyxFQUFFO0VBQ3BDLGlCQUFpQixJQUFJLEVBQUU7RUFDdkIsaUJBQWlCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtFQUNoQyxrQkFBa0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDOUIsaUJBQWlCLENBQUM7RUFDbEIsaUJBQWlCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtFQUNoQyxrQkFBa0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDOUIsaUJBQWlCLENBQUM7RUFDbEIsaUJBQWlCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUM5QixjQUFjLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQztFQUN0QyxnQkFBZ0IsQ0FBQyxDQUFDLFVBQVU7RUFDNUIsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVO0VBQzVCLGVBQWUsQ0FBQyxDQUFDO0VBQ2pCLGNBQWMsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDO0VBQzNDLGdCQUFnQixDQUFDLENBQUMsUUFBUTtFQUMxQixnQkFBZ0IsQ0FBQyxDQUFDLFFBQVE7RUFDMUIsZUFBZSxDQUFDLENBQUM7RUFDakIsY0FBYyxJQUFJLFFBQVEsR0FBRztFQUM3QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDaEQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQ2hELGVBQWUsQ0FBQztFQUNoQixjQUFjLElBQUksU0FBUyxHQUFHO0VBQzlCLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztFQUM1QyxrQkFBa0IsQ0FBQztFQUNuQixrQkFBa0IsQ0FBQztFQUNuQixlQUFlLENBQUM7RUFDaEIsY0FBYyxJQUFJLFNBQVMsR0FBRztFQUM5QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDaEQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQ2hELGVBQWUsQ0FBQztFQUNoQixjQUFjLElBQUksU0FBUyxHQUFHO0VBQzlCLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztFQUM1QyxrQkFBa0IsQ0FBQztFQUNuQixrQkFBa0IsQ0FBQztFQUNuQixlQUFlLENBQUM7QUFDaEI7RUFDQSxjQUFjLElBQUksU0FBUyxHQUFHO0VBQzlCLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztFQUM1QyxrQkFBa0IsQ0FBQztFQUNuQixrQkFBa0IsQ0FBQztFQUNuQixlQUFlLENBQUM7RUFDaEIsY0FBYyxJQUFJLFNBQVMsR0FBRztFQUM5QixnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO0VBQzVDLGtCQUFrQixDQUFDO0VBQ25CLGtCQUFrQixDQUFDO0VBQ25CLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZUFBZSxDQUFDO0VBQ2hCLGNBQWMsSUFBSSxRQUFRLEdBQUc7RUFDN0IsZ0JBQWdCLE1BQU07RUFDdEIsZ0JBQWdCLFFBQVE7RUFDeEIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFdBQVc7RUFDM0IsZUFBZSxDQUFDO0VBQ2hCO0VBQ0EsY0FBYyxPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUM3QyxhQUFhLENBQUM7RUFDZCxhQUFhLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDO0VBQzFDLGFBQWEsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7RUFDdEMsYUFBYSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQzFDO0VBQ0EsY0FBYyxPQUFPLFVBQVU7RUFDL0IsZ0JBQWdCLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7RUFDL0MsZUFBZSxDQUFDO0VBQ2hCLGFBQWEsQ0FBQztFQUNkLGFBQWEsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7RUFDbEMsYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztFQUNqQyxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxNQUFNLEVBQUU7RUFDL0MsY0FBYyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ2xDLGNBQWMsTUFBTSxZQUFZLEdBQUcsR0FBRztFQUN0QyxpQkFBaUIsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUMvQixpQkFBaUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUM1QyxpQkFBaUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUM1QyxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7RUFDM0MsaUJBQWlCLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0VBQ3RDLGlCQUFpQixJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztFQUN0QyxpQkFBaUIsSUFBSTtFQUNyQixrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztFQUNsSCxpQkFBaUIsQ0FBQztFQUNsQixhQUFhLENBQUM7RUFDZCxhQUFhLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxNQUFNLEVBQUU7RUFDOUMsY0FBY0MsY0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQy9DLGFBQWEsQ0FBQyxDQUFDO0VBQ2Y7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxDQUFDLENBQUM7RUFDWCxLQUFLLENBQUMsQ0FBQztFQUNQLEdBQUc7RUFDSCxFQUFFLFNBQVMsZ0JBQWdCLEdBQUc7RUFDOUIsSUFBSUcsUUFBRyxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQzNDLE1BQU0sT0FBTztFQUNiLFFBQVEsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDOUIsUUFBUSxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7RUFDbEM7RUFDQSxRQUFRLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPO0VBQzNCLFFBQVEsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVU7RUFDakMsUUFBUSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVTtFQUNqQyxRQUFRLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRO0VBQzdCLFFBQVEsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVE7RUFDN0IsUUFBUSxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7RUFDbEMsUUFBUSxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVM7RUFDOUIsT0FBTyxDQUFDO0VBQ1IsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLO0VBQ3hCO0VBQ0E7RUFDQTtFQUNBLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUMxQixNQUFNLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU07RUFDN0MsUUFBUSxDQUFDLENBQUM7RUFDVixVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0VBQzFCLFVBQVUsVUFBVSxDQUFDLE9BQU8sRUFBRTtFQUM5QixPQUFPLENBQUM7RUFDUixNQUFNLElBQUksY0FBYyxHQUFHLGlCQUFpQixDQUFDLE1BQU07RUFDbkQsUUFBUSxVQUFVLGlCQUFpQixFQUFFO0VBQ3JDLFVBQVU7RUFDVixZQUFZLGVBQWU7RUFDM0IsWUFBWSxpQkFBaUIsQ0FBQyxXQUFXO0VBQ3pDLFlBQVk7RUFDWixTQUFTO0VBQ1QsT0FBTyxDQUFDO0VBQ1IsTUFBTUgsY0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3pDLE1BQU0sR0FBRztFQUNULFNBQVMsU0FBUyxDQUFDLGFBQWEsQ0FBQztFQUNqQyxTQUFTLElBQUksQ0FBQyxjQUFjLENBQUM7RUFDN0IsU0FBUyxLQUFLLEVBQUU7RUFDaEIsU0FBUyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ3ZCLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsRUFBRTtFQUNoQyxVQUFVLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hEO0VBQ0E7RUFDQSxVQUFVLElBQUksYUFBYSxHQUFHLEVBQUU7RUFDaEMsYUFBYSxJQUFJLEVBQUU7RUFDbkIsYUFBYSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUU7RUFDNUIsY0FBYyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMxQixhQUFhLENBQUM7RUFDZCxhQUFhLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtFQUM1QixjQUFjLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFCLGFBQWEsQ0FBQztFQUNkLGFBQWEsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzFCLFVBQVUsSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDO0VBQ2xDLFlBQVksQ0FBQyxDQUFDLFVBQVU7RUFDeEIsWUFBWSxDQUFDLENBQUMsVUFBVTtFQUN4QixXQUFXLENBQUMsQ0FBQztFQUNiLFVBQVUsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDO0VBQ3ZDLFlBQVksQ0FBQyxDQUFDLFFBQVE7RUFDdEIsWUFBWSxDQUFDLENBQUMsUUFBUTtFQUN0QixXQUFXLENBQUMsQ0FBQztFQUNiLFVBQVUsSUFBSSxRQUFRLEdBQUc7RUFDekIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM1QyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzVDLFdBQVcsQ0FBQztFQUNaLFVBQVUsSUFBSSxTQUFTLEdBQUc7RUFDMUIsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzdDLGNBQWMsQ0FBQztFQUNmLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM3QyxjQUFjLENBQUM7RUFDZixXQUFXLENBQUM7RUFDWixVQUFVLElBQUksU0FBUyxHQUFHO0VBQzFCLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDNUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM1QyxXQUFXLENBQUM7RUFDWixVQUFVLElBQUksU0FBUyxHQUFHO0VBQzFCLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM3QyxjQUFjLENBQUM7RUFDZixZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDN0MsY0FBYyxDQUFDO0VBQ2YsV0FBVyxDQUFDO0FBQ1o7RUFDQSxVQUFVLElBQUksU0FBUyxHQUFHO0VBQzFCLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM3QyxjQUFjLENBQUM7RUFDZixZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDN0MsY0FBYyxDQUFDO0VBQ2YsV0FBVyxDQUFDO0VBQ1osVUFBVSxJQUFJLFNBQVMsR0FBRztFQUMxQixZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDN0MsY0FBYyxDQUFDO0VBQ2YsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQzdDLGNBQWMsQ0FBQztFQUNmLFdBQVcsQ0FBQztFQUNaLFVBQVUsSUFBSSxRQUFRLEdBQUc7RUFDekIsWUFBWSxNQUFNO0VBQ2xCLFlBQVksUUFBUTtFQUNwQixZQUFZLFNBQVM7RUFDckIsWUFBWSxTQUFTO0VBQ3JCLFlBQVksU0FBUztFQUNyQixZQUFZLFNBQVM7RUFDckIsWUFBWSxTQUFTO0VBQ3JCLFlBQVksV0FBVztFQUN2QixXQUFXLENBQUM7RUFDWixVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDaEMsVUFBVSxPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUN6QyxTQUFTLENBQUM7RUFDVixTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDO0VBQ3JDLFNBQVMsS0FBSyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7RUFDakMsU0FBUyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQ3RDLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN6QixVQUFVLE9BQU8sVUFBVTtFQUMzQixZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7RUFDMUMsV0FBVyxDQUFDO0VBQ1osU0FBUyxDQUFDO0VBQ1YsU0FBUyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQztFQUM5QixTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO0VBQzdCLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLE1BQU0sRUFBRTtFQUMzQyxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDOUIsVUFBVSxNQUFNLFlBQVksR0FBRyxHQUFHO0VBQ2xDLGFBQWEsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUMzQixhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDeEMsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0VBQ3ZDLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7RUFDdkMsYUFBYSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztFQUNsQyxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQ2xDLGFBQWEsSUFBSTtFQUNqQixjQUFjLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDNUcsYUFBYSxDQUFDO0VBQ2QsU0FBUyxDQUFDO0VBQ1YsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsTUFBTSxFQUFFO0VBQzFDLFVBQVVBLGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMzQyxTQUFTLENBQUMsQ0FBQztFQUNYLE1BQU0sSUFBSSxXQUFXLEdBQUcsR0FBRztFQUMzQixTQUFTLFNBQVMsQ0FBQyxRQUFRLENBQUM7RUFDNUIsU0FBUyxJQUFJLENBQUMsaUJBQWlCLENBQUM7RUFDaEMsU0FBUyxLQUFLLEVBQUU7RUFDaEIsU0FBUyxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3pCLFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7RUFDOUIsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQzNCLFVBQVUsT0FBTyxVQUFVLENBQUM7RUFDNUIsWUFBWSxDQUFDLENBQUMsVUFBVTtFQUN4QixZQUFZLENBQUMsQ0FBQyxVQUFVO0VBQ3hCLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2hCLFNBQVMsQ0FBQztFQUNWLFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSztFQUMzQixVQUFVLE9BQU8sVUFBVSxDQUFDO0VBQzVCLFlBQVksQ0FBQyxDQUFDLFVBQVU7RUFDeEIsWUFBWSxDQUFDLENBQUMsVUFBVTtFQUN4QixXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNoQixTQUFTLENBQUM7RUFDVixTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0VBQ3JCLFNBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7RUFDOUIsU0FBUyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztFQUNoQyxTQUFTLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDO0VBQ3JDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRTtFQUN0QztFQUNBLFVBQVUsT0FBTyxDQUFDLEdBQUc7RUFDckIsWUFBWSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPO0VBQ3pDLFdBQVcsQ0FBQztFQUNaO0VBQ0EsVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztFQUN6QixhQUFhLFVBQVUsRUFBRTtFQUN6QixhQUFhLFFBQVEsQ0FBQyxHQUFHLENBQUM7RUFDMUI7RUFDQSxhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEtBQUs7RUFDbEMsY0FBYztFQUNkLGdCQUFnQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksQ0FBQztFQUNsRCxnQkFBZ0I7RUFDaEIsZ0JBQWdCLE9BQU8sV0FBVztFQUNsQyxrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTztFQUMvQyxvQkFBb0IsR0FBRztFQUN2QixpQkFBaUIsQ0FBQztFQUNsQixlQUFlLE1BQU07RUFDckIsZ0JBQWdCLE9BQU8sV0FBVztFQUNsQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPO0VBQ2hELG9CQUFvQixHQUFHO0VBQ3ZCLGlCQUFpQixDQUFDO0VBQ2xCLGVBQWU7RUFDZixhQUFhLENBQUM7RUFDZDtFQUNBLFdBQVcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSztFQUNuQyxjQUFjO0VBQ2QsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxDQUFDO0VBQ2xELGdCQUFnQjtFQUNoQixnQkFBZ0IsT0FBTyxLQUFLLENBQUM7RUFDN0IsZUFBZSxNQUFNO0VBQ3JCLGdCQUFnQixPQUFPLE1BQU0sQ0FBQztFQUM5QixlQUFlO0VBQ2YsYUFBYSxDQUFDLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FDdEM7RUFDQSxVQUFVLE1BQU0sWUFBWSxHQUFHLEdBQUc7RUFDbEMsYUFBYSxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzNCLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUN4QyxhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDeEMsYUFBYSxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztFQUN2QyxhQUFhLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0VBQ2xDLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7RUFDbEMsYUFBYSxJQUFJO0VBQ2pCLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDL0YsYUFBYSxDQUFDO0VBQ2QsU0FBUyxDQUFDO0VBQ1YsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0VBQ3JDLFVBQVVBLGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMzQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0VBQ3pCLGFBQWEsVUFBVSxFQUFFO0VBQ3pCLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7RUFDekIsYUFBYSxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0VBQ25DLFNBQVMsQ0FBQztFQUNWLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTtFQUNsQyxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDekIsVUFBVSxPQUFPLENBQUMsR0FBRztFQUNyQixZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU87RUFDekMsV0FBVyxDQUFDO0VBQ1osVUFBVUEsY0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzdDLFVBQVVBLGNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMxQyxVQUFVQSxjQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDOUMsVUFBVUEsY0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzVDLFVBQVVBLGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMzQyxVQUFVLElBQUksV0FBVyxHQUFHRCxXQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekM7RUFDQTtFQUNBO0VBQ0EsVUFBVSxNQUFNLFNBQVMsR0FBRyxHQUFHO0VBQy9CLGFBQWEsTUFBTSxDQUFDLFFBQVEsQ0FBQztFQUM3QixhQUFhLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDO0VBQzFDLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQy9DLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQy9DLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssS0FBSztFQUNsQyxjQUFjO0VBQ2QsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxDQUFDO0VBQ2xELGdCQUFnQjtFQUNoQixnQkFBZ0IsT0FBTyxXQUFXO0VBQ2xDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPO0VBQy9DLG9CQUFvQixHQUFHO0VBQ3ZCLGlCQUFpQixDQUFDO0VBQ2xCLGVBQWUsTUFBTTtFQUNyQixnQkFBZ0IsT0FBTyxXQUFXO0VBQ2xDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU87RUFDaEQsb0JBQW9CLEdBQUc7RUFDdkIsaUJBQWlCLENBQUM7RUFDbEIsZUFBZTtFQUNmLGFBQWEsQ0FBQztFQUNkLGFBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7RUFDekIsYUFBYSxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztFQUNuQyxhQUFhLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO0VBQ3BDLGFBQWEsS0FBSyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUM7RUFDekMsYUFBYSxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ25DO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsVUFBVSxNQUFNLElBQUksR0FBRyxHQUFHO0VBQzFCLGFBQWEsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUMzQixhQUFhLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDeEMsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ3hDLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7RUFDdEMsYUFBYSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztFQUNsQyxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQ2xDLGFBQWEsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvRCxVQUFVLElBQUksaUJBQWlCLEdBQUc7RUFDbEMsWUFBWSxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM5QyxZQUFZLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlDLFdBQVcsQ0FBQztFQUNaLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0VBQ3pDLFVBQVUsSUFBSSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsTUFBTTtFQUN2RCxZQUFZLFVBQVUsaUJBQWlCLEVBQUU7RUFDekMsY0FBYztFQUNkLGdCQUFnQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVE7RUFDckMsbUJBQW1CLFdBQVc7RUFDOUIsZ0JBQWdCLGlCQUFpQixDQUFDLFdBQVc7RUFDN0MsZ0JBQWdCO0VBQ2hCLGFBQWE7RUFDYixXQUFXLENBQUM7RUFDWixVQUFVLGVBQWU7RUFDekIsWUFBWSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7RUFDOUMsVUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3RDO0VBQ0EsVUFBVSxHQUFHO0VBQ2IsYUFBYSxTQUFTLENBQUMsYUFBYSxDQUFDO0VBQ3JDLGFBQWEsSUFBSSxDQUFDLGNBQWMsQ0FBQztFQUNqQyxhQUFhLEtBQUssRUFBRTtFQUNwQixhQUFhLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDM0IsYUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0VBQ3BDLGNBQWMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJO0VBQzdDLGdCQUFnQixJQUFJO0VBQ3BCLGVBQWUsQ0FBQztBQUNoQjtFQUNBO0VBQ0EsY0FBYyxJQUFJLGFBQWEsR0FBRyxFQUFFO0VBQ3BDLGlCQUFpQixJQUFJLEVBQUU7RUFDdkIsaUJBQWlCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtFQUNoQyxrQkFBa0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDOUIsaUJBQWlCLENBQUM7RUFDbEIsaUJBQWlCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtFQUNoQyxrQkFBa0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDOUIsaUJBQWlCLENBQUM7RUFDbEIsaUJBQWlCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUM5QixjQUFjLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQztFQUN0QyxnQkFBZ0IsQ0FBQyxDQUFDLFVBQVU7RUFDNUIsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVO0VBQzVCLGVBQWUsQ0FBQyxDQUFDO0VBQ2pCLGNBQWMsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDO0VBQzNDLGdCQUFnQixDQUFDLENBQUMsUUFBUTtFQUMxQixnQkFBZ0IsQ0FBQyxDQUFDLFFBQVE7RUFDMUIsZUFBZSxDQUFDLENBQUM7RUFDakIsY0FBYyxJQUFJLFFBQVEsR0FBRztFQUM3QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDaEQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQ2hELGVBQWUsQ0FBQztFQUNoQixjQUFjLElBQUksU0FBUyxHQUFHO0VBQzlCLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztFQUM1QyxrQkFBa0IsQ0FBQztFQUNuQixrQkFBa0IsQ0FBQztFQUNuQixlQUFlLENBQUM7RUFDaEIsY0FBYyxJQUFJLFNBQVMsR0FBRztFQUM5QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDaEQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQ2hELGVBQWUsQ0FBQztFQUNoQixjQUFjLElBQUksU0FBUyxHQUFHO0VBQzlCLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztFQUM1QyxrQkFBa0IsQ0FBQztFQUNuQixrQkFBa0IsQ0FBQztFQUNuQixlQUFlLENBQUM7QUFDaEI7RUFDQSxjQUFjLElBQUksU0FBUyxHQUFHO0VBQzlCLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztFQUM1QyxrQkFBa0IsQ0FBQztFQUNuQixrQkFBa0IsQ0FBQztFQUNuQixlQUFlLENBQUM7RUFDaEIsY0FBYyxJQUFJLFNBQVMsR0FBRztFQUM5QixnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO0VBQzVDLGtCQUFrQixDQUFDO0VBQ25CLGtCQUFrQixDQUFDO0VBQ25CLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDNUMsa0JBQWtCLENBQUM7RUFDbkIsa0JBQWtCLENBQUM7RUFDbkIsZUFBZSxDQUFDO0VBQ2hCLGNBQWMsSUFBSSxRQUFRLEdBQUc7RUFDN0IsZ0JBQWdCLE1BQU07RUFDdEIsZ0JBQWdCLFFBQVE7RUFDeEIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFNBQVM7RUFDekIsZ0JBQWdCLFdBQVc7RUFDM0IsZUFBZSxDQUFDO0VBQ2hCLGNBQWMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUNwQyxjQUFjLE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQzdDLGFBQWEsQ0FBQztFQUNkLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUM7RUFDekMsYUFBYSxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQztFQUNyQyxhQUFhLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLEtBQUs7RUFDMUMsY0FBYyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzdCLGNBQWMsT0FBTyxVQUFVO0VBQy9CLGdCQUFnQixDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0VBQzlDLGVBQWUsQ0FBQztFQUNoQixhQUFhLENBQUM7RUFDZCxhQUFhLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO0VBQ2xDLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7RUFDakMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsTUFBTSxFQUFFO0VBQy9DLGNBQWMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNsQyxjQUFjLE1BQU0sWUFBWSxHQUFHLEdBQUc7RUFDdEMsaUJBQWlCLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDL0IsaUJBQWlCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDNUMsaUJBQWlCLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDNUMsaUJBQWlCLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO0VBQzNDLGlCQUFpQixJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztFQUN0QyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7RUFDdEMsaUJBQWlCLElBQUk7RUFDckIsa0JBQWtCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDL0csaUJBQWlCLENBQUM7RUFDbEIsYUFBYSxDQUFDO0VBQ2QsYUFBYSxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsTUFBTSxFQUFFO0VBQzlDLGNBQWNDLGNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUMvQyxhQUFhLENBQUMsQ0FBQztBQUNmO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsQ0FBQyxDQUFDO0VBQ1gsS0FBSyxDQUFDLENBQUM7RUFDUCxHQUFHO0VBQ0gsQ0FBQyxDQUFDOzs7OyJ9