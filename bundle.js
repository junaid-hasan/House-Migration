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

  const width = window.innerWidth;
  const height = window.innerHeight;

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
  };
  clearButton.addEventListener(
    'click',
    handleClearButtonClick
  );

  const projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(width);
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
      {
        value: 'Incomer_Flow',
        text: 'Incomer Flow',
      },
      //{ value: 'clear_map', text: 'Clear Map' },
    ];

    let slider = document.getElementById(
      'dateSlider1'
    );

    //const slider = d3.select("#dateSlider");
    console.log(slider);
    slider.addEventListener('change', function () {
      const index = parseInt(this.value);
      targetDate = targetDates[index];
      console.log(targetDate);
      console.log(combobox);
      if (combobox === 'Leaver_Flow') {
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
        svg.call(updateLeaverFlow);
      } else if (combobox === 'Incomer_Flow') {
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
        svg.call(updateIncomerFlow);
      }
    });

    const bubbleButton = document.getElementById(
      'bubbleButton'
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
        const positiveBubble = oneDateCitiesData.filter((d)=> d.netflow >= 0);
        const negativeBubble = oneDateCitiesData.filter((d)=> d.netflow < 0);
        console.log(positiveBubble);
        let cityCircles = svg
          .selectAll('.pos-bubble')
          .data(positiveBubble)
          .enter()
          .append('circle')
          .attr('class', 'pos-bubble')
          .attr('cx', (d) => {
            return projection([
              d.lon,
              d.lat,
            ])[0];
          })
          .attr('cy', (d) => {
            return projection([
              d.lon,
              d.lat,
            ])[1];
          })
          .attr('r', (d) => {
                if (
                  d.netflow >= 0
                ) {
                  return radiusScale(
                    d.netflow *
                      0.5
                  );
                } 
              })
          .style('fill', 'red')
          .style('stroke', '#fff')
          .style('stroke-width', '1px')
        .style('opacity',0.5);
      });
    };
    bubbleButton.addEventListener(
      'click',
      handleBubbleButtonClick
    );

    svg.call(updateLeaverFlow);
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
          if (column === 'Leaver_Flow') {
            d3$1.selectAll('.line-leaver').remove();
            d3$1.selectAll('.line-incomer').remove();
            d3$1.selectAll('.flowtext').remove();
            d3$1.selectAll('.city-clicked').remove();
            d3$1.selectAll('.des-circle').remove();
            d3$1.selectAll('.ori-circle').remove();
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
                  (origin[0] + destination[0]) / 3,
                  (origin[1] + destination[1]) / 3,
                ];
                let midPoint1 = [
                  ((origin[0] + destination[0]) *
                    2) /
                    3,
                  ((origin[1] + destination[1]) *
                    2) /
                    3,
                ];
                let lineData = [
                  origin,
                  midPoint,
                  midPoint1,
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
              .on('mouseover', function (mouseD) {
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
              })
              .on('mouseout', function (mouseD) {
                d3$1.selectAll('.city-name').remove();
              });
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
                  (origin[0] + destination[0]) / 3,
                  (origin[1] + destination[1]) / 3,
                ];
                let midPoint1 = [
                  ((origin[0] + destination[0]) *
                    2) /
                    3,
                  ((origin[1] + destination[1]) *
                    2) /
                    3,
                ];
                let lineData = [
                  origin,
                  midPoint,
                  midPoint1,
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
              .on('mouseover', function (mouseD) {
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
              })
              .on('mouseout', function (mouseD) {
                d3$1.selectAll('.city-name').remove();
              });
          });
      });
    }
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

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm1lbnUuanMiLCJpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJ2QzJztcbmV4cG9ydCBjb25zdCBtZW51ID0gKCkgPT4ge1xuICBsZXQgaWQ7XG4gIGxldCBsYWJlbFRleHQ7XG4gIGxldCBvcHRpb25zO1xuICBjb25zdCBsaXN0ZW5lcnMgPSBkaXNwYXRjaCgnY2hhbmdlJyk7XG4gIGNvbnN0IG15ID0gKHNlbGVjdGlvbikgPT4ge1xuICAgIC8vIHRoZSBzZWxlY3Rpb24gaXMgZGl2XG4gICAgc2VsZWN0aW9uXG4gICAgICAuc2VsZWN0QWxsKCdsYWJlbCcpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignbGFiZWwnKVxuICAgICAgLmF0dHIoJ2ZvcicsIGlkKVxuICAgICAgLnRleHQobGFiZWxUZXh0KTtcblxuICAgIHNlbGVjdGlvblxuICAgICAgLnNlbGVjdEFsbCgnc2VsZWN0JylcbiAgICAgIC5kYXRhKFtudWxsXSlcbiAgICAgIC5qb2luKCdzZWxlY3QnKVxuICAgICAgLmF0dHIoJ25hbWUnLCBpZClcbiAgICAgIC5hdHRyKCdpZCcsIGlkKVxuICAgICAgLm9uKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICBsaXN0ZW5lcnMuY2FsbChcbiAgICAgICAgICAnY2hhbmdlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAuZGF0YShvcHRpb25zKVxuICAgICAgLmpvaW4oJ29wdGlvbicpXG4gICAgICAuYXR0cigndmFsdWUnLCAoZCkgPT4gZC52YWx1ZSlcbiAgICAgIC50ZXh0KChkKSA9PiBkLnRleHQpO1xuICB9O1xuXG4gIG15LmlkID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKGlkID0gXyksIG15KSAvL3JldHVybiBteVxuICAgICAgOiBpZDtcbiAgfTtcbiAgbXkubGFiZWxUZXh0ID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKGxhYmVsVGV4dCA9IF8pLCBteSkgLy9yZXR1cm4gbXlcbiAgICAgIDogbGFiZWxUZXh0O1xuICB9O1xuXG4gIG15Lm9wdGlvbnMgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/ICgob3B0aW9ucyA9IF8pLCBteSkgLy9yZXR1cm4gbXlcbiAgICAgIDogb3B0aW9ucztcbiAgfTtcblxuICBteS5vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgdmFsdWUgPSBsaXN0ZW5lcnMub24uYXBwbHkoXG4gICAgICBsaXN0ZW5lcnMsXG4gICAgICBhcmd1bWVudHNcbiAgICApO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbGlzdGVuZXJzID8gbXkgOiB2YWx1ZTtcbiAgfTtcbiAgcmV0dXJuIG15O1xufTsiLCJpbXBvcnQge1xuICBjc3YsXG4gIHNlbGVjdCxcbiAgc2VsZWN0QWxsLFxuICBzY2FsZUxpbmVhcixcbiAganNvbixcbiAgZ2VvQWxiZXJzVXNhLFxufSBmcm9tICdkMyc7XG5pbXBvcnQgeyBmZWF0dXJlIH0gZnJvbSAndG9wb2pzb24nO1xuaW1wb3J0IHsgbWVudSB9IGZyb20gJy4vbWVudSc7XG5jb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuY29uc3QgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5jb25zdCBzdmcgPSBzZWxlY3QoJ2JvZHknKVxuICAuYXBwZW5kKCdzdmcnKVxuICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbmNvbnN0IG1lbnVDb250YWluZXIgPSBzZWxlY3QoJ2JvZHknKVxuICAuYXBwZW5kKCdkaXYnKVxuICAuYXR0cignY2xhc3MnLCAnbWVudS1jb250YWluZXInKTtcbmNvbnN0IHhNZW51ID0gbWVudUNvbnRhaW5lci5hcHBlbmQoJ2RpdicpO1xuLy9jb25zdCB5TWVudSA9IG1lbnVDb250YWluZXIuYXBwZW5kKCdkaXYnKTtcbi8vIERlZmluZSB0aGUgdGFyZ2V0IGRhdGUgZm9yIGZpbHRlcmluZ1xubGV0IHRhcmdldERhdGUgPSBuZXcgRGF0ZSgnMjAxNy8xLzEnKTtcbmxldCBjb21ib2JveCA9ICdMZWF2ZXJfRmxvdyc7XG5cbmNvbnN0IHRhcmdldERhdGVzID0gW1xuICBuZXcgRGF0ZSgnMjAxNy8xLzEnKSxcbiAgbmV3IERhdGUoJzIwMTcvNC8xJyksXG4gIG5ldyBEYXRlKCcyMDE3LzcvMScpLFxuICBuZXcgRGF0ZSgnMjAxNy8xMC8xJyksXG4gIG5ldyBEYXRlKCcyMDE4LzEvMScpLFxuICBuZXcgRGF0ZSgnMjAxOC80LzEnKSxcbiAgbmV3IERhdGUoJzIwMTgvNy8xJyksXG4gIG5ldyBEYXRlKCcyMDE4LzEwLzEnKSxcbiAgbmV3IERhdGUoJzIwMTkvMS8xJyksXG4gIG5ldyBEYXRlKCcyMDE5LzQvMScpLFxuICBuZXcgRGF0ZSgnMjAxOS83LzEnKSxcbiAgbmV3IERhdGUoJzIwMTkvMTAvMScpLFxuICBuZXcgRGF0ZSgnMjAyMC8xLzEnKSxcbiAgbmV3IERhdGUoJzIwMjAvNC8xJyksXG4gIG5ldyBEYXRlKCcyMDIwLzcvMScpLFxuICBuZXcgRGF0ZSgnMjAyMC8xMC8xJyksXG4gIG5ldyBEYXRlKCcyMDIxLzEvMScpLFxuICBuZXcgRGF0ZSgnMjAyMS80LzEnKSxcbiAgbmV3IERhdGUoJzIwMjEvNy8xJyksXG4gIG5ldyBEYXRlKCcyMDIxLzEwLzEnKSxcbiAgbmV3IERhdGUoJzIwMjIvMS8xJyksXG5dO1xuXG4vLyBGaWx0ZXIgdGhlIGRhdGEgYmFzZWQgb24gdGhlIHRhcmdldCBkYXRlXG4vLyBsZXQgZGF0ZURhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbihkKSB7XG4vLyAgIHJldHVybiBkLmRhdGUuZ2V0VGltZSgpID09PSB0YXJnZXREYXRlLmdldFRpbWUoKTtcbi8vIH0pO1xuXG5jb25zdCBjbGVhckJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAnY2xlYXJCdXR0b24nXG4pO1xuXG5jb25zdCBoYW5kbGVDbGVhckJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBzZWxlY3RBbGwoJy5saW5lLWxlYXZlcicpLnJlbW92ZSgpO1xuICBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5wb3MtYnViYmxlJykucmVtb3ZlKCk7XG4gICAgICAgICAgICBzZWxlY3RBbGwoJy5uZWctYnViYmxlJykucmVtb3ZlKCk7XG4gIHNlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICBzZWxlY3RBbGwoJy5kZXMtY2lyY2xlJykucmVtb3ZlKCk7XG4gIHNlbGVjdEFsbCgnLm9yaS1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gIHNlbGVjdEFsbCgnLmNpdHknKS5yZW1vdmUoKTtcbn07XG5jbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxuICAnY2xpY2snLFxuICBoYW5kbGVDbGVhckJ1dHRvbkNsaWNrXG4pO1xuXG5jb25zdCBwcm9qZWN0aW9uID0gZDNcbiAgLmdlb0FsYmVyc1VzYSgpXG4gIC50cmFuc2xhdGUoW3dpZHRoIC8gMiwgaGVpZ2h0IC8gMl0pXG4gIC5zY2FsZSh3aWR0aCk7XG5jb25zdCBwYXRoID0gZDMuZ2VvUGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbik7XG5cbmxldCByYWRpdXNTY2FsZSA9IGQzXG4gIC5zY2FsZUxpbmVhcigpXG4gIC5kb21haW4oWzAsIDMxMDAwXSlcbiAgLnJhbmdlKFsxMCwgMTAwXSk7XG5cbmpzb24oXG4gICdodHRwczovL3VucGtnLmNvbS91cy1hdGxhc0AzLjAuMC9zdGF0ZXMtMTBtLmpzb24nXG4pLnRoZW4oKHVzKSA9PiB7XG4gIC8vIENvbnZlcnRpbmcgdGhlIHRvcG9qc29uIHRvIGdlb2pzb24uXG4gIGNvbnNvbGUubG9nKHVzKTtcbiAgY29uc3QgdXMxID0gZmVhdHVyZSh1cywgdXMub2JqZWN0cy5zdGF0ZXMpO1xuICBzdmdcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuc2VsZWN0QWxsKCdwYXRoJylcbiAgICAuZGF0YSh1czEuZmVhdHVyZXMpXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAuYXR0cignZCcsIHBhdGgpXG4gICAgLnN0eWxlKCdmaWxsJywgJyNjY2MnKVxuICAgIC5zdHlsZSgnc3Ryb2tlJywgJyNmZmYnKVxuICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzAuNXB4Jyk7XG4gIGNvbnN0IG9wdGlvbnMgPSBbXG4gICAgeyB2YWx1ZTogJ0xlYXZlcl9GbG93JywgdGV4dDogJ0xlYXZlciBGbG93JyB9LFxuICAgIHtcbiAgICAgIHZhbHVlOiAnSW5jb21lcl9GbG93JyxcbiAgICAgIHRleHQ6ICdJbmNvbWVyIEZsb3cnLFxuICAgIH0sXG4gICAgLy97IHZhbHVlOiAnY2xlYXJfbWFwJywgdGV4dDogJ0NsZWFyIE1hcCcgfSxcbiAgXTtcblxuICBsZXQgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgJ2RhdGVTbGlkZXIxJ1xuICApO1xuXG4gIC8vY29uc3Qgc2xpZGVyID0gZDMuc2VsZWN0KFwiI2RhdGVTbGlkZXJcIik7XG4gIGNvbnNvbGUubG9nKHNsaWRlcik7XG4gIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgaW5kZXggPSBwYXJzZUludCh0aGlzLnZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudmFsdWUpO1xuICAgIGNvbnN0IG5ld0RhdGUgPSB0YXJnZXREYXRlc1tpbmRleF07XG4gICAgdGFyZ2V0RGF0ZSA9IHRhcmdldERhdGVzW2luZGV4XTtcbiAgICBjb25zb2xlLmxvZyh0YXJnZXREYXRlKTtcbiAgICBjb25zb2xlLmxvZyhjb21ib2JveCk7XG4gICAgaWYgKGNvbWJvYm94ID09PSAnTGVhdmVyX0Zsb3cnKSB7XG4gICAgICBzZWxlY3RBbGwoJy5saW5lLWxlYXZlcicpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgIHNlbGVjdEFsbCgnLnBvcy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHNlbGVjdEFsbCgnLm5lZy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLm9yaS1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcuY2l0eScpLnJlbW92ZSgpO1xuICAgICAgc3ZnLmNhbGwodXBkYXRlTGVhdmVyRmxvdyk7XG4gICAgfSBlbHNlIGlmIChjb21ib2JveCA9PT0gJ0luY29tZXJfRmxvdycpIHtcbiAgICAgIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgc2VsZWN0QWxsKCcucG9zLWJ1YmJsZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgc2VsZWN0QWxsKCcubmVnLWJ1YmJsZScpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RBbGwoJy5jaXR5JykucmVtb3ZlKCk7XG4gICAgICBzdmcuY2FsbCh1cGRhdGVJbmNvbWVyRmxvdyk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBidWJibGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAnYnViYmxlQnV0dG9uJ1xuICApO1xuXG4gIGNvbnN0IGhhbmRsZUJ1YmJsZUJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gICAgICAgIHNlbGVjdEFsbCgnLnBvcy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHNlbGVjdEFsbCgnLm5lZy1idWJibGUnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgc2VsZWN0QWxsKCcuY2l0eScpLnJlbW92ZSgpO1xuICAgIGNvbnNvbGUubG9nKHRhcmdldERhdGUpO1xuICAgIGNvbnNvbGUubG9nKGNvbWJvYm94KTtcbiAgICAvL2RhdGUsY2l0eSxzdGF0ZSxuZXRmbG93LGxhdCxsb25cbiAgICBjc3YoJ2NsZWFuX25ldGZsb3cuY3N2JywgKGQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKGQuZGF0ZSksXG4gICAgICAgIGNpdHk6IGQuY2l0eSxcbiAgICAgICAgbmV0ZmxvdzogK2QubmV0ZmxvdyxcbiAgICAgICAgbGF0OiArZC5sYXQsXG4gICAgICAgIGxvbjogK2QubG9uLFxuICAgICAgfTtcbiAgICB9KS50aGVuKChjaXRpZXMpID0+IHtcbiAgICAgIGNvbnN0IG9uZURhdGVDaXRpZXNEYXRhID0gY2l0aWVzLmZpbHRlcihcbiAgICAgICAgKGQpID0+XG4gICAgICAgICAgZC5kYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgICAgICB0YXJnZXREYXRlLmdldFRpbWUoKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHBvc2l0aXZlQnViYmxlID0gb25lRGF0ZUNpdGllc0RhdGEuZmlsdGVyKChkKT0+IGQubmV0ZmxvdyA+PSAwKTtcbiAgICAgIGNvbnN0IG5lZ2F0aXZlQnViYmxlID0gb25lRGF0ZUNpdGllc0RhdGEuZmlsdGVyKChkKT0+IGQubmV0ZmxvdyA8IDApO1xuICAgICAgY29uc29sZS5sb2cocG9zaXRpdmVCdWJibGUpO1xuICAgICAgbGV0IGNpdHlDaXJjbGVzID0gc3ZnXG4gICAgICAgIC5zZWxlY3RBbGwoJy5wb3MtYnViYmxlJylcbiAgICAgICAgLmRhdGEocG9zaXRpdmVCdWJibGUpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdwb3MtYnViYmxlJylcbiAgICAgICAgLmF0dHIoJ2N4JywgKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgICBkLmxvbixcbiAgICAgICAgICAgIGQubGF0LFxuICAgICAgICAgIF0pWzBdO1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cignY3knLCAoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgIGQubG9uLFxuICAgICAgICAgICAgZC5sYXQsXG4gICAgICAgICAgXSlbMV07XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdyJywgKGQpID0+IHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGQubmV0ZmxvdyA+PSAwXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZShcbiAgICAgICAgICAgICAgICAgIGQubmV0ZmxvdyAqXG4gICAgICAgICAgICAgICAgICAgIDAuNVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9KVxuICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmVkJylcbiAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzFweCcpXG4gICAgICAuc3R5bGUoJ29wYWNpdHknLDAuNSlcbiAgICB9KTtcbiAgfTtcbiAgYnViYmxlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ2NsaWNrJyxcbiAgICBoYW5kbGVCdWJibGVCdXR0b25DbGlja1xuICApO1xuXG4gIHN2Zy5jYWxsKHVwZGF0ZUxlYXZlckZsb3cpO1xuICAvLyBtZW51Q29udGFpbmVyLmNhbGwobWVudSgpKTtcbiAgeE1lbnUuY2FsbChcbiAgICBtZW51KClcbiAgICAgIC5pZCgneC1tZW51JylcbiAgICAgIC5sYWJlbFRleHQoJ0Zsb3cgT3B0aW9uczogICcpXG4gICAgICAub3B0aW9ucyhvcHRpb25zKVxuICAgICAgLm9uKCdjaGFuZ2UnLCAoY29sdW1uKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdpbiBpbmRleC5qcycpO1xuICAgICAgICBjb25zb2xlLmxvZyhjb2x1bW4pO1xuICAgICAgICBjb21ib2JveCA9IGNvbHVtbjtcbiAgICAgICAgaWYgKGNvbHVtbiA9PT0gJ0xlYXZlcl9GbG93Jykge1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5kZXMtY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHknKS5yZW1vdmUoKTtcbiAgICAgICAgICBzdmcuY2FsbCh1cGRhdGVMZWF2ZXJGbG93KTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2x1bW4gPT09ICdJbmNvbWVyX0Zsb3cnKSB7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1sZWF2ZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eScpLnJlbW92ZSgpO1xuICAgICAgICAgIHN2Zy5jYWxsKHVwZGF0ZUluY29tZXJGbG93KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgKTtcbiAgLy9kYXRlLG9yaWdpbixkZXN0LHBjdF9sZWF2ZXJzLG5ldGZsb3csb3JpZ2luX2xhdCxvcmlnaW5fbG9uLGRlc3RfbGF0LGRlc3RfbG9uLG9yaWdpbl9jaXR5LGRlc3RfY2l0eVxuICBmdW5jdGlvbiB1cGRhdGVJbmNvbWVyRmxvdygpIHtcbiAgICBjc3YoJ2NsZWFuX2Rlc3RfaW5jb21lcnMuY3N2JywgKGQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKGQuZGF0ZSksXG4gICAgICAgIHBjdF9pbmNvbWVyczogZC5wY3RfaW5jb21lcnMsXG4gICAgICAgIC8vcGN0X2xlYXZlcnMgOiBwYXJzZUZsb2F0KGQucGN0X2xlYXZlcnMucmVwbGFjZSgnJScsICcnKSksXG4gICAgICAgIG5ldGZsb3c6ICtkLm5ldGZsb3csXG4gICAgICAgIG9yaWdpbl9sYXQ6ICtkLm9yaWdpbl9sYXQsXG4gICAgICAgIG9yaWdpbl9sb246ICtkLm9yaWdpbl9sb24sXG4gICAgICAgIGRlc3RfbGF0OiArZC5kZXN0X2xhdCxcbiAgICAgICAgZGVzdF9sb246ICtkLmRlc3RfbG9uLFxuICAgICAgICBvcmlnaW5fY2l0eTogZC5vcmlnaW5fY2l0eSxcbiAgICAgICAgZGVzdF9jaXR5OiBkLmRlc3RfY2l0eSxcbiAgICAgIH07XG4gICAgfSkudGhlbigoY2l0aWVzKSA9PiB7XG4gICAgICAvLyBjb25zdCBzY2FsZVJhZGl1cyA9IHNjYWxlTGluZWFyKClcbiAgICAgIC8vICAgLmRvbWFpbihbMCwgZDMubWF4KGNpdGllcywgKGQpID0+IGQuZmxvdyldKVxuICAgICAgLy8gICAucmFuZ2UoWzIsIDIwXSk7XG4gICAgICBjb25zb2xlLmxvZyh0YXJnZXREYXRlKTtcbiAgICAgIGNvbnN0IG9uZURhdGVDaXRpZXNEYXRhID0gY2l0aWVzLmZpbHRlcihcbiAgICAgICAgKGQpID0+XG4gICAgICAgICAgZC5kYXRlLmdldFRpbWUoKSA9PT1cbiAgICAgICAgICB0YXJnZXREYXRlLmdldFRpbWUoKVxuICAgICAgKTtcbiAgICAgIC8vIERyYXcgdGhlIGNpdGllc1xuXG4gICAgICBsZXQgY2l0eUNpcmNsZXMgPSBzdmdcbiAgICAgICAgLnNlbGVjdEFsbCgnY2lyY2xlJylcbiAgICAgICAgLmRhdGEob25lRGF0ZUNpdGllc0RhdGEpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5JylcbiAgICAgICAgLmF0dHIoJ2N4JywgKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgICBkLmRlc3RfbG9uLFxuICAgICAgICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICBdKVswXTtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2N5JywgKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgICBkLmRlc3RfbG9uLFxuICAgICAgICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICBdKVsxXTtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ3InLCA1KVxuICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncGluaycpXG4gICAgICAgIC5zdHlsZSgnc3Ryb2tlJywgJyNmZmYnKVxuICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxcHgnKVxuICAgICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93XG4gICAgICAgICAgKTtcbiAgICAgICAgICAvL3NlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAuZHVyYXRpb24oMjAwKVxuICAgICAgICAgICAgLy8uYXR0cigncicsIDEwKVxuICAgICAgICAgICAgLmF0dHIoJ3InLCAockRhdGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ID49IDBcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhZGl1c1NjYWxlKFxuICAgICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgKlxuICAgICAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZShcbiAgICAgICAgICAgICAgICAgIC1kLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyAqXG4gICAgICAgICAgICAgICAgICAgIDAuNVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnYmx1ZScpO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdwaW5rJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3dcbiAgICAgICAgICApO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmxpbmUtaW5jb21lcicpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eS1jbGlja2VkJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgIGxldCBjbGlja2VkQ2l0eSA9IHNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaWNrZWRDaXR5KTtcbiAgICAgICAgICAvLyBjb25zdCBjdXJ2ZSA9IGQzLmxpbmUoKS5jdXJ2ZShkMy5jdXJ2ZU5hdHVyYWwpO1xuICAgICAgICAgIGNvbnN0IG5ld0NpcmNsZSA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LWNsaWNrZWQnKVxuICAgICAgICAgICAgLmF0dHIoJ2N4JywgY2xpY2tlZENpdHkuYXR0cignY3gnKSlcbiAgICAgICAgICAgIC5hdHRyKCdjeScsIGNsaWNrZWRDaXR5LmF0dHIoJ2N5JykpXG4gICAgICAgICAgICAuYXR0cigncicsIChyRGF0YSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgPj0gMFxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkaXVzU2NhbGUoXG4gICAgICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyAqXG4gICAgICAgICAgICAgICAgICAgIDAuNVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhZGl1c1NjYWxlKFxuICAgICAgICAgICAgICAgICAgLWQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ICpcbiAgICAgICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdwdXJwbGUnKVxuICAgICAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxcHgnKVxuICAgICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMC43KTtcblxuICAgICAgICAgIC8vUmVtb3ZlIHRoZSBjbGlja2VkIGNpcmNsZVxuICAgICAgICAgIC8vY2xpY2tlZENpdHkucmVtb3ZlKCk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhjbGlja2VkQ2l0eSk7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cigneCcsIGQueClcbiAgICAgICAgICAgIC5hdHRyKCd5JywgZC55KVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2Zsb3d0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAyMClcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ3JlZCcpXG4gICAgICAgICAgICAudGV4dChkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvdyk7XG4gICAgICAgICAgbGV0IGNsaWNrZWRDaXR5Q29vcmRzID0gW1xuICAgICAgICAgICAgcGFyc2VGbG9hdChjbGlja2VkQ2l0eS5hdHRyKCdjeCcpKSxcbiAgICAgICAgICAgIHBhcnNlRmxvYXQoY2xpY2tlZENpdHkuYXR0cignY3knKSksXG4gICAgICAgICAgXTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhvbmVEYXRlQ2l0aWVzRGF0YSk7XG4gICAgICAgICAgbGV0IGZpbHRlcmVkQ2l0aWVzID0gb25lRGF0ZUNpdGllc0RhdGEuZmlsdGVyKFxuICAgICAgICAgICAgZnVuY3Rpb24gKG9uZURhdGVDaXRpZXNEYXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fXG4gICAgICAgICAgICAgICAgICAuZGVzdF9jaXR5ID09PVxuICAgICAgICAgICAgICAgIG9uZURhdGVDaXRpZXNEYXRhLmRlc3RfY2l0eVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZS5sb2coZmlsdGVyZWRDaXRpZXMpO1xuXG4gICAgICAgICAgc3ZnXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lLWluY29tZXInKVxuICAgICAgICAgICAgLmRhdGEoZmlsdGVyZWRDaXRpZXMpXG4gICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgLmFwcGVuZCgncGF0aCcpXG4gICAgICAgICAgICAuYXR0cignZCcsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIGxldCBjdXJ2ZSA9IGQzLmN1cnZlQnVuZGxlLmJldGEoXG4gICAgICAgICAgICAgICAgMC4wNVxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbGluZSBnZW5lcmF0b3JcbiAgICAgICAgICAgICAgbGV0IGxpbmVHZW5lcmF0b3IgPSBkM1xuICAgICAgICAgICAgICAgIC5saW5lKClcbiAgICAgICAgICAgICAgICAueChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGRbMF07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAueShmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGRbMV07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY3VydmUoY3VydmUpO1xuICAgICAgICAgICAgICBsZXQgb3JpZ2luID0gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgICAgZC5vcmlnaW5fbG9uLFxuICAgICAgICAgICAgICAgIGQub3JpZ2luX2xhdCxcbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHByb2plY3Rpb24oW1xuICAgICAgICAgICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIGxldCBtaWRQb2ludCA9IFtcbiAgICAgICAgICAgICAgICAob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pIC8gMyxcbiAgICAgICAgICAgICAgICAob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pIC8gMyxcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50MSA9IFtcbiAgICAgICAgICAgICAgICAoKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAqXG4gICAgICAgICAgICAgICAgICAyKSAvXG4gICAgICAgICAgICAgICAgICAzLFxuICAgICAgICAgICAgICAgICgob3JpZ2luWzFdICsgZGVzdGluYXRpb25bMV0pICpcbiAgICAgICAgICAgICAgICAgIDIpIC9cbiAgICAgICAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIGxldCBsaW5lRGF0YSA9IFtcbiAgICAgICAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgICAgICAgbWlkUG9pbnQsXG4gICAgICAgICAgICAgICAgbWlkUG9pbnQxLFxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLFxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGxpbmVEYXRhKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGxpbmVHZW5lcmF0b3IobGluZURhdGEpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5lLWluY29tZXInKVxuICAgICAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAncHVycGxlJylcbiAgICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgKGQpID0+IHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoXG4gICAgICAgICAgICAgICAgZC5wY3RfaW5jb21lcnMucmVwbGFjZSgnJScsICcnKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDAuNilcbiAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ25vbmUnKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGxpbmVEYXRhKTtcbiAgICAgICAgICBjb25zdCBvcmlfY2l0aWVzID0gc3ZnXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpXG4gICAgICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgICAgLmF0dHIoJ2N4JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgICAgICAgIGQub3JpZ2luX2xvbixcbiAgICAgICAgICAgICAgICBkLm9yaWdpbl9sYXQsXG4gICAgICAgICAgICAgIF0pWzBdO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgICAgICBdKVsxXTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYXR0cigncicsIDUpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnb3JpLWNpcmNsZScpXG4gICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAncmVkJylcbiAgICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlJywgJyNmZmYnKVxuICAgICAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMXB4JylcbiAgICAgICAgICAgIC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtb3VzZUQpO1xuICAgICAgICAgICAgICBjb25zdCBjaXR5bmFtZXRleHQgPSBzdmdcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgICAgICAuYXR0cigneCcsIG1vdXNlRC54KVxuICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgbW91c2VELnkpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NpdHktbmFtZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDEwKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsdWUnKVxuICAgICAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICAgICAgYENpdHk6ICR7bW91c2VELnNyY0VsZW1lbnQuX19kYXRhX18ub3JpZ2luX2NpdHl9LCBQY3Qgb2YgSW5jb21lcnM6ICR7bW91c2VELnNyY0VsZW1lbnQuX19kYXRhX18ucGN0X2luY29tZXJzfWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIHVwZGF0ZUxlYXZlckZsb3coKSB7XG4gICAgY3N2KCdjbGVhbl9vcmlnaW5fbGVhdmVycy5jc3YnLCAoZCkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoZC5kYXRlKSxcbiAgICAgICAgcGN0X2xlYXZlcnM6IGQucGN0X2xlYXZlcnMsXG4gICAgICAgIC8vcGN0X2xlYXZlcnMgOiBwYXJzZUZsb2F0KGQucGN0X2xlYXZlcnMucmVwbGFjZSgnJScsICcnKSksXG4gICAgICAgIG5ldGZsb3c6ICtkLm5ldGZsb3csXG4gICAgICAgIG9yaWdpbl9sYXQ6ICtkLm9yaWdpbl9sYXQsXG4gICAgICAgIG9yaWdpbl9sb246ICtkLm9yaWdpbl9sb24sXG4gICAgICAgIGRlc3RfbGF0OiArZC5kZXN0X2xhdCxcbiAgICAgICAgZGVzdF9sb246ICtkLmRlc3RfbG9uLFxuICAgICAgICBvcmlnaW5fY2l0eTogZC5vcmlnaW5fY2l0eSxcbiAgICAgICAgZGVzdF9jaXR5OiBkLmRlc3RfY2l0eSxcbiAgICAgIH07XG4gICAgfSkudGhlbigoY2l0aWVzKSA9PiB7XG4gICAgICAvLyBjb25zdCBzY2FsZVJhZGl1cyA9IHNjYWxlTGluZWFyKClcbiAgICAgIC8vICAgLmRvbWFpbihbMCwgZDMubWF4KGNpdGllcywgKGQpID0+IGQuZmxvdyldKVxuICAgICAgLy8gICAucmFuZ2UoWzIsIDIwXSk7XG4gICAgICBjb25zb2xlLmxvZyhjaXRpZXMpO1xuICAgICAgY29uc3Qgb25lRGF0ZUNpdGllc0RhdGEgPSBjaXRpZXMuZmlsdGVyKFxuICAgICAgICAoZCkgPT5cbiAgICAgICAgICBkLmRhdGUuZ2V0VGltZSgpID09PVxuICAgICAgICAgIHRhcmdldERhdGUuZ2V0VGltZSgpXG4gICAgICApO1xuICAgICAgLy8gRHJhdyB0aGUgY2l0aWVzXG5cbiAgICAgIGxldCBjaXR5Q2lyY2xlcyA9IHN2Z1xuICAgICAgICAuc2VsZWN0QWxsKCdjaXJjbGUnKVxuICAgICAgICAuZGF0YShvbmVEYXRlQ2l0aWVzRGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NpdHknKVxuICAgICAgICAuYXR0cignY3gnLCAoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgIGQub3JpZ2luX2xvbixcbiAgICAgICAgICAgIGQub3JpZ2luX2xhdCxcbiAgICAgICAgICBdKVswXTtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2N5JywgKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICBkLm9yaWdpbl9sYXQsXG4gICAgICAgICAgXSlbMV07XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2dvbGQnKVxuICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMXB4JylcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvd1xuICAgICAgICAgICk7XG4gICAgICAgICAgLy9zZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgLmR1cmF0aW9uKDIwMClcbiAgICAgICAgICAgIC8vLmF0dHIoJ3InLCAxMClcbiAgICAgICAgICAgIC5hdHRyKCdyJywgKHJEYXRhKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyA+PSAwXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZShcbiAgICAgICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ICpcbiAgICAgICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkaXVzU2NhbGUoXG4gICAgICAgICAgICAgICAgICAtZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgKlxuICAgICAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2JsdWUnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAuYXR0cigncicsIDUpXG4gICAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnZ29sZCcpO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93XG4gICAgICAgICAgKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5saW5lLWxlYXZlcicpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eS1jbGlja2VkJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgIGxldCBjbGlja2VkQ2l0eSA9IHNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaWNrZWRDaXR5KTtcbiAgICAgICAgICAvLyBjb25zdCBjdXJ2ZSA9IGQzLmxpbmUoKS5jdXJ2ZShkMy5jdXJ2ZU5hdHVyYWwpO1xuICAgICAgICAgIGNvbnN0IG5ld0NpcmNsZSA9IHN2Z1xuICAgICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LWNsaWNrZWQnKVxuICAgICAgICAgICAgLmF0dHIoJ2N4JywgY2xpY2tlZENpdHkuYXR0cignY3gnKSlcbiAgICAgICAgICAgIC5hdHRyKCdjeScsIGNsaWNrZWRDaXR5LmF0dHIoJ2N5JykpXG4gICAgICAgICAgICAuYXR0cigncicsIChyRGF0YSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgPj0gMFxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkaXVzU2NhbGUoXG4gICAgICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyAqXG4gICAgICAgICAgICAgICAgICAgIDAuNVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhZGl1c1NjYWxlKFxuICAgICAgICAgICAgICAgICAgLWQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ICpcbiAgICAgICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdncmVlbicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzFweCcpXG4gICAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwLjcpO1xuXG4gICAgICAgICAgLy9SZW1vdmUgdGhlIGNsaWNrZWQgY2lyY2xlXG4gICAgICAgICAgLy9jbGlja2VkQ2l0eS5yZW1vdmUoKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGNsaWNrZWRDaXR5KTtcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gc3ZnXG4gICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKCd4JywgZC54KVxuICAgICAgICAgICAgLmF0dHIoJ3knLCBkLnkpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnZmxvd3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDIwKVxuICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAncmVkJylcbiAgICAgICAgICAgIC50ZXh0KGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93KTtcbiAgICAgICAgICBsZXQgY2xpY2tlZENpdHlDb29yZHMgPSBbXG4gICAgICAgICAgICBwYXJzZUZsb2F0KGNsaWNrZWRDaXR5LmF0dHIoJ2N4JykpLFxuICAgICAgICAgICAgcGFyc2VGbG9hdChjbGlja2VkQ2l0eS5hdHRyKCdjeScpKSxcbiAgICAgICAgICBdO1xuICAgICAgICAgIGNvbnNvbGUubG9nKG9uZURhdGVDaXRpZXNEYXRhKTtcbiAgICAgICAgICBsZXQgZmlsdGVyZWRDaXRpZXMgPSBvbmVEYXRlQ2l0aWVzRGF0YS5maWx0ZXIoXG4gICAgICAgICAgICBmdW5jdGlvbiAob25lRGF0ZUNpdGllc0RhdGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX19cbiAgICAgICAgICAgICAgICAgIC5vcmlnaW5fY2l0eSA9PT1cbiAgICAgICAgICAgICAgICBvbmVEYXRlQ2l0aWVzRGF0YS5vcmlnaW5fY2l0eVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZS5sb2coZmlsdGVyZWRDaXRpZXMpO1xuXG4gICAgICAgICAgc3ZnXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lLWxlYXZlcicpXG4gICAgICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAgICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgbGV0IGN1cnZlID0gZDMuY3VydmVCdW5kbGUuYmV0YShcbiAgICAgICAgICAgICAgICAwLjA1XG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsaW5lIGdlbmVyYXRvclxuICAgICAgICAgICAgICBsZXQgbGluZUdlbmVyYXRvciA9IGQzXG4gICAgICAgICAgICAgICAgLmxpbmUoKVxuICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZFswXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZFsxXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jdXJ2ZShjdXJ2ZSk7XG4gICAgICAgICAgICAgIGxldCBvcmlnaW4gPSBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgICAgICBkLmRlc3RfbGF0LFxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgbGV0IG1pZFBvaW50ID0gW1xuICAgICAgICAgICAgICAgIChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkgLyAzLFxuICAgICAgICAgICAgICAgIChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgLyAzLFxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICBsZXQgbWlkUG9pbnQxID0gW1xuICAgICAgICAgICAgICAgICgob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pICpcbiAgICAgICAgICAgICAgICAgIDIpIC9cbiAgICAgICAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAgICAgKChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgKlxuICAgICAgICAgICAgICAgICAgMikgL1xuICAgICAgICAgICAgICAgICAgMyxcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgbGV0IGxpbmVEYXRhID0gW1xuICAgICAgICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICAgICAgICBtaWRQb2ludCxcbiAgICAgICAgICAgICAgICBtaWRQb2ludDEsXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24sXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGxpbmVEYXRhKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGxpbmVHZW5lcmF0b3IobGluZURhdGEpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5lLWxlYXZlcicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICdncmVlbicpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsIChkKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcbiAgICAgICAgICAgICAgICBkLnBjdF9sZWF2ZXJzLnJlcGxhY2UoJyUnLCAnJylcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwLjYpXG4gICAgICAgICAgICAuYXR0cignZmlsbCcsICdub25lJyk7XG5cbiAgICAgICAgICBjb25zdCBkZXNfY2l0aWVzID0gc3ZnXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpXG4gICAgICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgICAgLmF0dHIoJ2N4JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICAgICAgXSlbMF07XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICAgICAgXSlbMV07XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0dHIoJ3InLCA1KVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2Rlcy1jaXJjbGUnKVxuICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JlZCcpXG4gICAgICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzFweCcpXG4gICAgICAgICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChtb3VzZUQpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cobW91c2VEKTtcbiAgICAgICAgICAgICAgY29uc3QgY2l0eW5hbWV0ZXh0ID0gc3ZnXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBtb3VzZUQueClcbiAgICAgICAgICAgICAgICAuYXR0cigneScsIG1vdXNlRC55KVxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5LW5hbWUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxMClcbiAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICdibHVlJylcbiAgICAgICAgICAgICAgICAudGV4dChcbiAgICAgICAgICAgICAgICAgIGBDaXR5OiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLmRlc3RfY2l0eX0sIFBjdCBvZiBMZWF2ZXJzOiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLnBjdF9sZWF2ZXJzfWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAobW91c2VEKSB7XG4gICAgICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTtcblxuLy8gY3N2KFwiY2l0eWRhdGEuY3N2XCIpLnRoZW4oY2l0aWVzID0+IHtcblxuLy8gICAgIC8vIERyYXcgdGhlIGNpdGllc1xuLy8gICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4vLyAgICAgICAuc2VsZWN0QWxsKFwiY2lyY2xlXCIpXG4vLyAgICAgICAuZGF0YShjaXRpZXMpXG4vLyAgICAgICAuZW50ZXIoKVxuLy8gICAgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuLy8gICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNpdHlcIilcbi8vICAgICAgIC5hdHRyKFwiY3hcIiwgZCA9PiB7IHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbiwgZC5sYXRdKVswXTsgfSlcbi8vICAgICAgIC5hdHRyKFwiY3lcIiwgZCA9PiB7IHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbiwgZC5sYXRdKVsxXTsgfSlcbi8vICAgICAgIC5hdHRyKFwiclwiLCA1KVxuLy8gICAgICAgLnN0eWxlKFwiZmlsbFwiLCBcInJlZFwiKVxuLy8gICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiI2ZmZlwiKVxuLy8gICAgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMXB4XCIpXG4vLyAgICAgICAub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZCkge1xuLy8gICAgICAgICBkMy5zZWxlY3QodGhpcylcbi8vICAgICAgICAgICAudHJhbnNpdGlvbigpXG4vLyAgICAgICAgICAgLmR1cmF0aW9uKDIwMClcbi8vICAgICAgICAgICAuYXR0cihcInJcIiwgMTApXG4vLyAgICAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBcImJsdWVcIik7XG4vLyAgICAgICB9KVxuLy8gICAgICAgLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZCkge1xuLy8gICAgICAgICBkMy5zZWxlY3QodGhpcylcbi8vICAgICAgICAgICAudHJhbnNpdGlvbigpXG4vLyAgICAgICAgICAgLmR1cmF0aW9uKDIwMClcbi8vICAgICAgICAgICAuYXR0cihcInJcIiwgNSlcbi8vICAgICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIFwicmVkXCIpO1xuLy8gICAgICAgfSlcbi8vICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpIHtcbi8vICAgICAgICAgLy9jb25zb2xlLmxvZyhkLm5hbWUgKyBcIiAoXCIgKyBkLmxhdCArIFwiLCBcIiArIGQubG9uICsgXCIpXCIpO1xuLy8gICAgICAgY29uc29sZS5sb2coZC5zcmNFbGVtZW50Ll9fZGF0YV9fKTtcblxuLy8gICAgICAgfSk7XG4vLyAgIH0pO1xuIl0sIm5hbWVzIjpb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QztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztFQUN2QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztFQUN2QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztFQUN2QixFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztFQUN0QixDQUFDLENBQUM7QUFDRjtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYztFQUMzQyxFQUFFLGFBQWE7RUFDZixDQUFDLENBQUM7QUFDRjtFQUNBLE1BQU0sc0JBQXNCLEdBQUcsWUFBWTtFQUMzQyxFQUFFQyxjQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDckMsRUFBRUEsY0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3RDLFVBQVVBLGNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM1QyxZQUFZQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDOUMsRUFBRUEsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2xDLEVBQUVBLGNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN0QyxFQUFFQSxjQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFF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