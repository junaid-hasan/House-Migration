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
          } else if (column === 'clear_map') {
            d3$1.selectAll('.line-leaver').remove();
            d3$1.selectAll('.line-incomer').remove();
            d3$1.selectAll('.flowtext').remove();
            d3$1.selectAll('.city-clicked').remove();
            d3$1.selectAll('.des-circle').remove();
            d3$1.selectAll('.ori-circle').remove();
            d3$1.selectAll('.city-name').remove();
            d3$1.selectAll('.city').remove();
          }
          //svg.call(plot.xValue((d) => d[column]));
        })
    );
    //date,origin,dest,pct_leavers,netflow,origin_lat,origin_lon,dest_lat,dest_lon,origin_city,dest_city
      function updateIncomerFlow(){
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

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm1lbnUuanMiLCJpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJ2QzJztcbmV4cG9ydCBjb25zdCBtZW51ID0gKCkgPT4ge1xuICBsZXQgaWQ7XG4gIGxldCBsYWJlbFRleHQ7XG4gIGxldCBvcHRpb25zO1xuICBjb25zdCBsaXN0ZW5lcnMgPSBkaXNwYXRjaCgnY2hhbmdlJyk7XG4gIGNvbnN0IG15ID0gKHNlbGVjdGlvbikgPT4ge1xuICAgIC8vIHRoZSBzZWxlY3Rpb24gaXMgZGl2XG4gICAgc2VsZWN0aW9uXG4gICAgICAuc2VsZWN0QWxsKCdsYWJlbCcpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignbGFiZWwnKVxuICAgICAgLmF0dHIoJ2ZvcicsIGlkKVxuICAgICAgLnRleHQobGFiZWxUZXh0KTtcblxuICAgIHNlbGVjdGlvblxuICAgICAgLnNlbGVjdEFsbCgnc2VsZWN0JylcbiAgICAgIC5kYXRhKFtudWxsXSlcbiAgICAgIC5qb2luKCdzZWxlY3QnKVxuICAgICAgLmF0dHIoJ25hbWUnLCBpZClcbiAgICAgIC5hdHRyKCdpZCcsIGlkKVxuICAgICAgLm9uKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICBsaXN0ZW5lcnMuY2FsbChcbiAgICAgICAgICAnY2hhbmdlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAuZGF0YShvcHRpb25zKVxuICAgICAgLmpvaW4oJ29wdGlvbicpXG4gICAgICAuYXR0cigndmFsdWUnLCAoZCkgPT4gZC52YWx1ZSlcbiAgICAgIC50ZXh0KChkKSA9PiBkLnRleHQpO1xuICB9O1xuXG4gIG15LmlkID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKGlkID0gXyksIG15KSAvL3JldHVybiBteVxuICAgICAgOiBpZDtcbiAgfTtcbiAgbXkubGFiZWxUZXh0ID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKGxhYmVsVGV4dCA9IF8pLCBteSkgLy9yZXR1cm4gbXlcbiAgICAgIDogbGFiZWxUZXh0O1xuICB9O1xuXG4gIG15Lm9wdGlvbnMgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/ICgob3B0aW9ucyA9IF8pLCBteSkgLy9yZXR1cm4gbXlcbiAgICAgIDogb3B0aW9ucztcbiAgfTtcblxuICBteS5vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgdmFsdWUgPSBsaXN0ZW5lcnMub24uYXBwbHkoXG4gICAgICBsaXN0ZW5lcnMsXG4gICAgICBhcmd1bWVudHNcbiAgICApO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbGlzdGVuZXJzID8gbXkgOiB2YWx1ZTtcbiAgfTtcbiAgcmV0dXJuIG15O1xufTsiLCJpbXBvcnQge1xuICBjc3YsXG4gIHNlbGVjdCxcbiAgc2VsZWN0QWxsLFxuICBzY2FsZUxpbmVhcixcbiAganNvbixcbiAgZ2VvQWxiZXJzVXNhLFxufSBmcm9tICdkMyc7XG5pbXBvcnQgeyBmZWF0dXJlIH0gZnJvbSAndG9wb2pzb24nO1xuaW1wb3J0IHsgbWVudSB9IGZyb20gJy4vbWVudSc7XG5jb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuY29uc3QgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5jb25zdCBzdmcgPSBzZWxlY3QoJ2JvZHknKVxuICAuYXBwZW5kKCdzdmcnKVxuICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cblxuY29uc3QgbWVudUNvbnRhaW5lciA9IHNlbGVjdCgnYm9keScpXG4gIC5hcHBlbmQoJ2RpdicpXG4gIC5hdHRyKCdjbGFzcycsICdtZW51LWNvbnRhaW5lcicpO1xuY29uc3QgeE1lbnUgPSBtZW51Q29udGFpbmVyLmFwcGVuZCgnZGl2Jyk7XG4vL2NvbnN0IHlNZW51ID0gbWVudUNvbnRhaW5lci5hcHBlbmQoJ2RpdicpO1xuLy8gRGVmaW5lIHRoZSB0YXJnZXQgZGF0ZSBmb3IgZmlsdGVyaW5nXG5sZXQgdGFyZ2V0RGF0ZSA9IG5ldyBEYXRlKFwiMjAxNy8xLzFcIik7XG5cbmNvbnN0IHRhcmdldERhdGVzID0gW1xuICBuZXcgRGF0ZShcIjIwMTcvMS8xXCIpLFxuICBuZXcgRGF0ZShcIjIwMTcvNC8xXCIpLFxuICBuZXcgRGF0ZShcIjIwMTcvNy8xXCIpLFxuICBuZXcgRGF0ZShcIjIwMTcvMTAvMVwiKSxcbiAgbmV3IERhdGUoXCIyMDE4LzEvMVwiKVxuXTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICBcblxuXG4vLyBGaWx0ZXIgdGhlIGRhdGEgYmFzZWQgb24gdGhlIHRhcmdldCBkYXRlXG4vLyBsZXQgZGF0ZURhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbihkKSB7XG4vLyAgIHJldHVybiBkLmRhdGUuZ2V0VGltZSgpID09PSB0YXJnZXREYXRlLmdldFRpbWUoKTtcbi8vIH0pO1xuXG5jb25zdCBwcm9qZWN0aW9uID0gZDNcbiAgLmdlb0FsYmVyc1VzYSgpXG4gIC50cmFuc2xhdGUoW3dpZHRoIC8gMiwgaGVpZ2h0IC8gMl0pXG4gIC5zY2FsZSh3aWR0aCk7XG5jb25zdCBwYXRoID0gZDMuZ2VvUGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbik7XG5cbnZhciByYWRpdXNTY2FsZSA9IGQzLnNjYWxlTGluZWFyKClcbiAgLmRvbWFpbihbMCwgMzEwMDBdKSBcbiAgLnJhbmdlKFsxMCwgMTAwXSk7XG5cbmpzb24oXG4gICdodHRwczovL3VucGtnLmNvbS91cy1hdGxhc0AzLjAuMC9zdGF0ZXMtMTBtLmpzb24nXG4pLnRoZW4oKHVzKSA9PiB7XG4gIC8vIENvbnZlcnRpbmcgdGhlIHRvcG9qc29uIHRvIGdlb2pzb24uXG4gIGNvbnNvbGUubG9nKHVzKTtcbiAgY29uc3QgdXMxID0gZmVhdHVyZSh1cywgdXMub2JqZWN0cy5zdGF0ZXMpO1xuICBzdmdcbiAgICAuYXBwZW5kKCdnJylcbiAgICAuc2VsZWN0QWxsKCdwYXRoJylcbiAgICAuZGF0YSh1czEuZmVhdHVyZXMpXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAuYXR0cignZCcsIHBhdGgpXG4gICAgLnN0eWxlKCdmaWxsJywgJyNjY2MnKVxuICAgIC5zdHlsZSgnc3Ryb2tlJywgJyNmZmYnKVxuICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzAuNXB4Jyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFtcbiAgICB7IHZhbHVlOiAnTGVhdmVyX0Zsb3cnLCB0ZXh0OiAnTGVhdmVyIEZsb3cnIH0sXG4gICAgeyB2YWx1ZTogJ0luY29tZXJfRmxvdycsIHRleHQ6ICdJbmNvbWVyIEZsb3cnIH0sXG4gICAgICB7IHZhbHVlOiAnY2xlYXJfbWFwJywgdGV4dDogJ0NsZWFyIE1hcCcgfSxcblxuICBdO1xuXG4gICBsZXQgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGVTbGlkZXIxJyk7XG5cbi8vY29uc3Qgc2xpZGVyID0gZDMuc2VsZWN0KFwiI2RhdGVTbGlkZXJcIik7XG5jb25zb2xlLmxvZyhzbGlkZXIpO1xuc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpe1xuY29uc3QgaW5kZXggPSBwYXJzZUludCh0aGlzLnZhbHVlKTsgXG4gIGNvbnNvbGUubG9nKHRoaXMudmFsdWUpO1xuICBjb25zdCBuZXdEYXRlID0gdGFyZ2V0RGF0ZXNbaW5kZXhdOyBcbmNvbnNvbGUubG9nKG5ld0RhdGUpO30pO1xuICBcbiAgZDMuc2VsZWN0KFwiI2RhdGVTbGlkZXJcIilcbiAgLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2codGhpcy52YWx1ZSk7XG4gIH0pO1xuICBcbiAgLy8gbWVudUNvbnRhaW5lci5jYWxsKG1lbnUoKSk7XG4gIHhNZW51LmNhbGwoXG4gICAgbWVudSgpXG4gICAgICAuaWQoJ3gtbWVudScpXG4gICAgICAubGFiZWxUZXh0KCdGbG93IE9wdGlvbnM6ICAnKVxuICAgICAgLm9wdGlvbnMob3B0aW9ucylcbiAgICAgIC5vbignY2hhbmdlJywgKGNvbHVtbikgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnaW4gaW5kZXguanMnKTtcbiAgICAgICAgY29uc29sZS5sb2coY29sdW1uKTtcbiAgICAgICAgaWYgKGNvbHVtbiA9PT0gJ0xlYXZlcl9GbG93Jykge1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmxpbmUtbGVhdmVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1pbmNvbWVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5kZXMtY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktbmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHknKS5yZW1vdmUoKTtcbiAgICAgICAgICBzdmcuY2FsbCh1cGRhdGVMZWF2ZXJGbG93KTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2x1bW4gPT09ICdJbmNvbWVyX0Zsb3cnKSB7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1sZWF2ZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eScpLnJlbW92ZSgpO1xuICAgICAgICAgIHN2Zy5jYWxsKHVwZGF0ZUluY29tZXJGbG93KTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2x1bW4gPT09ICdjbGVhcl9tYXAnKSB7XG4gICAgICAgICAgc2VsZWN0QWxsKCcubGluZS1sZWF2ZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5saW5lLWluY29tZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmNpdHktY2xpY2tlZCcpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLmRlcy1jaXJjbGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5vcmktY2lyY2xlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eS1uYW1lJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuY2l0eScpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vc3ZnLmNhbGwocGxvdC54VmFsdWUoKGQpID0+IGRbY29sdW1uXSkpO1xuICAgICAgfSlcbiAgKTtcbiAgLy9kYXRlLG9yaWdpbixkZXN0LHBjdF9sZWF2ZXJzLG5ldGZsb3csb3JpZ2luX2xhdCxvcmlnaW5fbG9uLGRlc3RfbGF0LGRlc3RfbG9uLG9yaWdpbl9jaXR5LGRlc3RfY2l0eVxuICAgIGZ1bmN0aW9uIHVwZGF0ZUluY29tZXJGbG93KCl7XG4gICAgY3N2KCdjbGVhbl9kZXN0X2luY29tZXJzLmNzdicsIChkKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGU6IG5ldyBEYXRlKGQuZGF0ZSksXG4gICAgICBwY3RfaW5jb21lcnM6IGQucGN0X2luY29tZXJzLFxuICAgICAgLy9wY3RfbGVhdmVycyA6IHBhcnNlRmxvYXQoZC5wY3RfbGVhdmVycy5yZXBsYWNlKCclJywgJycpKSxcbiAgICAgIG5ldGZsb3c6ICtkLm5ldGZsb3csXG4gICAgICBvcmlnaW5fbGF0OiArZC5vcmlnaW5fbGF0LFxuICAgICAgb3JpZ2luX2xvbjogK2Qub3JpZ2luX2xvbixcbiAgICAgIGRlc3RfbGF0OiArZC5kZXN0X2xhdCxcbiAgICAgIGRlc3RfbG9uOiArZC5kZXN0X2xvbixcbiAgICAgIG9yaWdpbl9jaXR5OiBkLm9yaWdpbl9jaXR5LFxuICAgICAgZGVzdF9jaXR5OiBkLmRlc3RfY2l0eSxcbiAgICB9O1xuICB9KS50aGVuKChjaXRpZXMpID0+IHtcbiAgICAvLyBjb25zdCBzY2FsZVJhZGl1cyA9IHNjYWxlTGluZWFyKClcbiAgICAvLyAgIC5kb21haW4oWzAsIGQzLm1heChjaXRpZXMsIChkKSA9PiBkLmZsb3cpXSlcbiAgICAvLyAgIC5yYW5nZShbMiwgMjBdKTtcbiAgICBjb25zb2xlLmxvZyhjaXRpZXMpO1xuICAgIGNvbnN0IG9uZURhdGVDaXRpZXNEYXRhID0gY2l0aWVzLmZpbHRlcigoZCkgPT4gZC5kYXRlLmdldFRpbWUoKSA9PT0gdGFyZ2V0RGF0ZS5nZXRUaW1lKCkpO1xuICAgIC8vIERyYXcgdGhlIGNpdGllc1xuICAgIFxuICAgIGxldCBjaXR5Q2lyY2xlcyA9IHN2Z1xuICAgICAgLnNlbGVjdEFsbCgnY2lyY2xlJylcbiAgICAgIC5kYXRhKG9uZURhdGVDaXRpZXNEYXRhKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAuYXR0cignY2xhc3MnLCAnY2l0eScpXG4gICAgICAuYXR0cignY3gnLCAoZCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICBkLmRlc3RfbGF0LFxuICAgICAgICBdKVswXTtcbiAgICAgIH0pXG4gICAgICAuYXR0cignY3knLCAoZCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICBkLmRlc3RfbGF0LFxuICAgICAgICBdKVsxXTtcbiAgICAgIH0pXG4gICAgICAuYXR0cigncicsIDUpXG4gICAgICAuc3R5bGUoJ2ZpbGwnLCAncGluaycpXG4gICAgICAuc3R5bGUoJ3N0cm9rZScsICcjZmZmJylcbiAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzFweCcpXG4gICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93XG4gICAgICAgICk7XG4gICAgICAgIC8vc2VsZWN0QWxsKCcuZmxvd3RleHQnKS5yZW1vdmUoKTtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbigyMDApXG4gICAgICAgICAgLy8uYXR0cigncicsIDEwKVxuICAgICAgICAgIC5hdHRyKFxuICAgICAgICAgICAgJ3InLFxuICAgICAgICAgICAgckRhdGEgPT4ge1xuICAgICAgICAgICAgaWYgKGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93Pj0wKSB7cmV0dXJuIHJhZGl1c1NjYWxlKGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93KjAuNSk7fSBcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkaXVzU2NhbGUoLWQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93ICowLjUpO319XG4gICAgICAgICAgKVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdibHVlJyk7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAuYXR0cigncicsIDUpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3BpbmsnKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93XG4gICAgICAgICk7XG4gICAgICAgIHNlbGVjdEFsbCgnLmxpbmUtaW5jb21lcicpLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICAgICAgc2VsZWN0QWxsKCcub3JpLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgICAgbGV0IGNsaWNrZWRDaXR5ID0gc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaWNrZWRDaXR5KTtcbiAgICAgICAgLy8gY29uc3QgY3VydmUgPSBkMy5saW5lKCkuY3VydmUoZDMuY3VydmVOYXR1cmFsKTtcbiAgICAgICAgY29uc3QgbmV3Q2lyY2xlID0gc3ZnXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1jbGlja2VkJylcbiAgICAgICAgICAuYXR0cignY3gnLCBjbGlja2VkQ2l0eS5hdHRyKCdjeCcpKVxuICAgICAgICAgIC5hdHRyKCdjeScsIGNsaWNrZWRDaXR5LmF0dHIoJ2N5JykpXG4gICAgICAgICAgLmF0dHIoJ3InLCByRGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3c+PTApIHtyZXR1cm4gcmFkaXVzU2NhbGUoZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cqMC41KTt9IFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZSgtZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgKjAuNSk7fX0pIC8vIEFkanVzdCB0aGUgc2NhbGluZyBmYWN0b3IgYXMgbmVlZGVkIGZvciB0aGUgY2xpY2tlZCBzdGF0ZVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdwdXJwbGUnKVxuICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlJywgJyNmZmYnKVxuICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzFweCcpXG4gICAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMC43KTtcblxuICAgICAgICAvL1JlbW92ZSB0aGUgY2xpY2tlZCBjaXJjbGVcbiAgICAgICAgLy9jbGlja2VkQ2l0eS5yZW1vdmUoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjbGlja2VkQ2l0eSk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBzdmdcbiAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAuYXR0cigneCcsIGQueClcbiAgICAgICAgICAuYXR0cigneScsIGQueSlcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnZmxvd3RleHQnKVxuICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAyMClcbiAgICAgICAgICAuYXR0cignZmlsbCcsICdyZWQnKVxuICAgICAgICAgIC50ZXh0KGQuc3JjRWxlbWVudC5fX2RhdGFfXy5uZXRmbG93KTtcbiAgICAgICAgbGV0IGNsaWNrZWRDaXR5Q29vcmRzID0gW1xuICAgICAgICAgIHBhcnNlRmxvYXQoY2xpY2tlZENpdHkuYXR0cignY3gnKSksXG4gICAgICAgICAgcGFyc2VGbG9hdChjbGlja2VkQ2l0eS5hdHRyKCdjeScpKSxcbiAgICAgICAgXTtcbiAgICAgICAgY29uc29sZS5sb2cob25lRGF0ZUNpdGllc0RhdGEpO1xuICAgICAgICBsZXQgZmlsdGVyZWRDaXRpZXMgPSBvbmVEYXRlQ2l0aWVzRGF0YS5maWx0ZXIoXG4gICAgICAgICAgZnVuY3Rpb24gKG9uZURhdGVDaXRpZXNEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX19cbiAgICAgICAgICAgICAgICAuZGVzdF9jaXR5ID09PVxuICAgICAgICAgICAgICBvbmVEYXRlQ2l0aWVzRGF0YS5kZXN0X2NpdHlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLmxvZyhmaWx0ZXJlZENpdGllcyk7XG5cbiAgICAgICAgc3ZnXG4gICAgICAgICAgLnNlbGVjdEFsbCgnbGluZS1pbmNvbWVyJylcbiAgICAgICAgICAuZGF0YShmaWx0ZXJlZENpdGllcylcbiAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIGxldCBjdXJ2ZSA9IGQzLmN1cnZlQnVuZGxlLmJldGEoMC4wNSk7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbGluZSBnZW5lcmF0b3JcbiAgICAgICAgICAgIGxldCBsaW5lR2VuZXJhdG9yID0gZDNcbiAgICAgICAgICAgICAgLmxpbmUoKVxuICAgICAgICAgICAgICAueChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkWzBdO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAueShmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkWzFdO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuY3VydmUoY3VydmUpO1xuICAgICAgICAgICAgbGV0IG9yaWdpbiA9IHByb2plY3Rpb24oW1xuICAgICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICAgIGQub3JpZ2luX2xhdCxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgICAgIGQuZGVzdF9sYXQsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGxldCBtaWRQb2ludCA9IFtcbiAgICAgICAgICAgICAgKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSAvIDMsXG4gICAgICAgICAgICAgIChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkgLyAzLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGxldCBtaWRQb2ludDEgPSBbXG4gICAgICAgICAgICAgIChvcmlnaW5bMF0gKyBkZXN0aW5hdGlvblswXSkqMiAvIDMsXG4gICAgICAgICAgICAgIChvcmlnaW5bMV0gKyBkZXN0aW5hdGlvblsxXSkqMiAvIDMsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgbGV0IGxpbmVEYXRhID0gW1xuICAgICAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgICAgIG1pZFBvaW50LFxuICAgICAgICAgICAgICBtaWRQb2ludDEsXG4gICAgICAgICAgICAgIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhsaW5lRGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gbGluZUdlbmVyYXRvcihsaW5lRGF0YSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGluZS1pbmNvbWVyJylcbiAgICAgICAgICAuc3R5bGUoJ3N0cm9rZScsICdwdXJwbGUnKVxuICAgICAgICAgIC5zdHlsZShcbiAgICAgICAgICAgICdzdHJva2Utd2lkdGgnLFxuICAgICAgICAgICAgKGQpID0+IHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChkLnBjdF9pbmNvbWVycy5yZXBsYWNlKFwiJVwiLCBcIlwiKSl9XG4gICAgICAgICAgKVxuICAgICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDAuNilcbiAgICAgICAgICAuYXR0cignZmlsbCcsICdub25lJyk7XG4gICAgICAgIC8vY29uc29sZS5sb2cobGluZURhdGEpO1xuICAgICAgICBjb25zdCBvcmlfY2l0aWVzID0gc3ZnXG4gICAgICAgICAgLnNlbGVjdEFsbCgnLm9yaS1jaXJjbGUnKVxuICAgICAgICAgIC5kYXRhKGZpbHRlcmVkQ2l0aWVzKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW1xuICAgICAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgICAgIGQub3JpZ2luX2xhdCxcbiAgICAgICAgICAgIF0pWzBdO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgICAgZC5vcmlnaW5fbG9uLFxuICAgICAgICAgICAgICBkLm9yaWdpbl9sYXQsXG4gICAgICAgICAgICBdKVsxXTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnb3JpLWNpcmNsZScpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JlZCcpXG4gICAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMXB4JylcbiAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cobW91c2VEKTtcbiAgICAgICAgICAgIGNvbnN0IGNpdHluYW1ldGV4dCA9IHN2Z1xuICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBtb3VzZUQueClcbiAgICAgICAgICAgICAgLmF0dHIoJ3knLCBtb3VzZUQueSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NpdHktbmFtZScpXG4gICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxMClcbiAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmx1ZScpXG4gICAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICAgIGBDaXR5OiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLm9yaWdpbl9jaXR5fSwgUGN0IG9mIEluY29tZXJzOiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLnBjdF9pbmNvbWVyc31gXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfSk7fVxuICBmdW5jdGlvbiB1cGRhdGVMZWF2ZXJGbG93KCl7XG4gICAgY3N2KCdjbGVhbl9vcmlnaW5fbGVhdmVycy5jc3YnLCAoZCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRlOiBuZXcgRGF0ZShkLmRhdGUpLFxuICAgICAgcGN0X2xlYXZlcnM6IGQucGN0X2xlYXZlcnMsXG4gICAgICAvL3BjdF9sZWF2ZXJzIDogcGFyc2VGbG9hdChkLnBjdF9sZWF2ZXJzLnJlcGxhY2UoJyUnLCAnJykpLFxuICAgICAgbmV0ZmxvdzogK2QubmV0ZmxvdyxcbiAgICAgIG9yaWdpbl9sYXQ6ICtkLm9yaWdpbl9sYXQsXG4gICAgICBvcmlnaW5fbG9uOiArZC5vcmlnaW5fbG9uLFxuICAgICAgZGVzdF9sYXQ6ICtkLmRlc3RfbGF0LFxuICAgICAgZGVzdF9sb246ICtkLmRlc3RfbG9uLFxuICAgICAgb3JpZ2luX2NpdHk6IGQub3JpZ2luX2NpdHksXG4gICAgICBkZXN0X2NpdHk6IGQuZGVzdF9jaXR5LFxuICAgIH07XG4gIH0pLnRoZW4oKGNpdGllcykgPT4ge1xuICAgIC8vIGNvbnN0IHNjYWxlUmFkaXVzID0gc2NhbGVMaW5lYXIoKVxuICAgIC8vICAgLmRvbWFpbihbMCwgZDMubWF4KGNpdGllcywgKGQpID0+IGQuZmxvdyldKVxuICAgIC8vICAgLnJhbmdlKFsyLCAyMF0pO1xuICAgIGNvbnNvbGUubG9nKGNpdGllcyk7XG4gICAgY29uc3Qgb25lRGF0ZUNpdGllc0RhdGEgPSBjaXRpZXMuZmlsdGVyKChkKSA9PiBkLmRhdGUuZ2V0VGltZSgpID09PSB0YXJnZXREYXRlLmdldFRpbWUoKSk7XG4gICAgLy8gRHJhdyB0aGUgY2l0aWVzXG4gICAgXG4gICAgbGV0IGNpdHlDaXJjbGVzID0gc3ZnXG4gICAgICAuc2VsZWN0QWxsKCdjaXJjbGUnKVxuICAgICAgLmRhdGEob25lRGF0ZUNpdGllc0RhdGEpXG4gICAgICAuZW50ZXIoKVxuICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdjaXR5JylcbiAgICAgIC5hdHRyKCdjeCcsIChkKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtcbiAgICAgICAgICBkLm9yaWdpbl9sb24sXG4gICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICBdKVswXTtcbiAgICAgIH0pXG4gICAgICAuYXR0cignY3knLCAoZCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgZC5vcmlnaW5fbG9uLFxuICAgICAgICAgIGQub3JpZ2luX2xhdCxcbiAgICAgICAgXSlbMV07XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3InLCA1KVxuICAgICAgLnN0eWxlKCdmaWxsJywgJ2dvbGQnKVxuICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxcHgnKVxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvd1xuICAgICAgICApO1xuICAgICAgICAvL3NlbGVjdEFsbCgnLmZsb3d0ZXh0JykucmVtb3ZlKCk7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAuZHVyYXRpb24oMjAwKVxuICAgICAgICAgIC8vLmF0dHIoJ3InLCAxMClcbiAgICAgICAgICAuYXR0cihcbiAgICAgICAgICAgICdyJyxcbiAgICAgICAgICAgIHJEYXRhID0+IHtcbiAgICAgICAgICAgIGlmIChkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvdz49MCkge3JldHVybiByYWRpdXNTY2FsZShkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyowLjUpO30gXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhZGl1c1NjYWxlKC1kLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0ZmxvdyAqMC41KTt9fVxuICAgICAgICAgIClcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAnYmx1ZScpO1xuICAgICAgfSlcbiAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmF0dHIoJ3InLCA1KVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdnb2xkJyk7XG4gICAgICB9KVxuICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBkLnNyY0VsZW1lbnQuX19kYXRhX18ubmV0Zmxvd1xuICAgICAgICApO1xuICAgICAgICBzZWxlY3RBbGwoJy5saW5lLWxlYXZlcicpLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RBbGwoJy5mbG93dGV4dCcpLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LWNsaWNrZWQnKS5yZW1vdmUoKTtcbiAgICAgICAgc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RBbGwoJy5jaXR5LW5hbWUnKS5yZW1vdmUoKTtcbiAgICAgICAgbGV0IGNsaWNrZWRDaXR5ID0gc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGNsaWNrZWRDaXR5KTtcbiAgICAgICAgLy8gY29uc3QgY3VydmUgPSBkMy5saW5lKCkuY3VydmUoZDMuY3VydmVOYXR1cmFsKTtcbiAgICAgICAgY29uc3QgbmV3Q2lyY2xlID0gc3ZnXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2l0eS1jbGlja2VkJylcbiAgICAgICAgICAuYXR0cignY3gnLCBjbGlja2VkQ2l0eS5hdHRyKCdjeCcpKVxuICAgICAgICAgIC5hdHRyKCdjeScsIGNsaWNrZWRDaXR5LmF0dHIoJ2N5JykpXG4gICAgICAgICAgLmF0dHIoJ3InLCByRGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3c+PTApIHtyZXR1cm4gcmFkaXVzU2NhbGUoZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cqMC41KTt9IFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByYWRpdXNTY2FsZSgtZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cgKjAuNSk7fX0pIC8vIEFkanVzdCB0aGUgc2NhbGluZyBmYWN0b3IgYXMgbmVlZGVkIGZvciB0aGUgY2xpY2tlZCBzdGF0ZVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdncmVlbicpXG4gICAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMXB4JylcbiAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwLjcpO1xuXG4gICAgICAgIC8vUmVtb3ZlIHRoZSBjbGlja2VkIGNpcmNsZVxuICAgICAgICAvL2NsaWNrZWRDaXR5LnJlbW92ZSgpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGNsaWNrZWRDaXR5KTtcbiAgICAgICAgY29uc3QgdGV4dCA9IHN2Z1xuICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC5hdHRyKCd4JywgZC54KVxuICAgICAgICAgIC5hdHRyKCd5JywgZC55KVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdmbG93dGV4dCcpXG4gICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDIwKVxuICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ3JlZCcpXG4gICAgICAgICAgLnRleHQoZC5zcmNFbGVtZW50Ll9fZGF0YV9fLm5ldGZsb3cpO1xuICAgICAgICBsZXQgY2xpY2tlZENpdHlDb29yZHMgPSBbXG4gICAgICAgICAgcGFyc2VGbG9hdChjbGlja2VkQ2l0eS5hdHRyKCdjeCcpKSxcbiAgICAgICAgICBwYXJzZUZsb2F0KGNsaWNrZWRDaXR5LmF0dHIoJ2N5JykpLFxuICAgICAgICBdO1xuICAgICAgICBjb25zb2xlLmxvZyhvbmVEYXRlQ2l0aWVzRGF0YSk7XG4gICAgICAgIGxldCBmaWx0ZXJlZENpdGllcyA9IG9uZURhdGVDaXRpZXNEYXRhLmZpbHRlcihcbiAgICAgICAgICBmdW5jdGlvbiAob25lRGF0ZUNpdGllc0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIGQuc3JjRWxlbWVudC5fX2RhdGFfX1xuICAgICAgICAgICAgICAgIC5vcmlnaW5fY2l0eSA9PT1cbiAgICAgICAgICAgICAgb25lRGF0ZUNpdGllc0RhdGEub3JpZ2luX2NpdHlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLmxvZyhmaWx0ZXJlZENpdGllcyk7XG5cbiAgICAgICAgc3ZnXG4gICAgICAgICAgLnNlbGVjdEFsbCgnbGluZS1sZWF2ZXInKVxuICAgICAgICAgIC5kYXRhKGZpbHRlcmVkQ2l0aWVzKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgncGF0aCcpXG4gICAgICAgICAgLmF0dHIoJ2QnLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgbGV0IGN1cnZlID0gZDMuY3VydmVCdW5kbGUuYmV0YSgwLjA1KTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsaW5lIGdlbmVyYXRvclxuICAgICAgICAgICAgbGV0IGxpbmVHZW5lcmF0b3IgPSBkM1xuICAgICAgICAgICAgICAubGluZSgpXG4gICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRbMF07XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRbMV07XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5jdXJ2ZShjdXJ2ZSk7XG4gICAgICAgICAgICBsZXQgb3JpZ2luID0gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgIGQub3JpZ2luX2xvbixcbiAgICAgICAgICAgICAgZC5vcmlnaW5fbGF0LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSBwcm9qZWN0aW9uKFtcbiAgICAgICAgICAgICAgZC5kZXN0X2xvbixcbiAgICAgICAgICAgICAgZC5kZXN0X2xhdCxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgbGV0IG1pZFBvaW50ID0gW1xuICAgICAgICAgICAgICAob3JpZ2luWzBdICsgZGVzdGluYXRpb25bMF0pIC8gMyxcbiAgICAgICAgICAgICAgKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSAvIDMsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgbGV0IG1pZFBvaW50MSA9IFtcbiAgICAgICAgICAgICAgKG9yaWdpblswXSArIGRlc3RpbmF0aW9uWzBdKSoyIC8gMyxcbiAgICAgICAgICAgICAgKG9yaWdpblsxXSArIGRlc3RpbmF0aW9uWzFdKSoyIC8gMyxcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBsZXQgbGluZURhdGEgPSBbXG4gICAgICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICAgICAgbWlkUG9pbnQsXG4gICAgICAgICAgICAgIG1pZFBvaW50MSxcbiAgICAgICAgICAgICAgZGVzdGluYXRpb25cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsaW5lRGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gbGluZUdlbmVyYXRvcihsaW5lRGF0YSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGluZS1sZWF2ZXInKVxuICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlJywgJ2dyZWVuJylcbiAgICAgICAgICAuc3R5bGUoXG4gICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJyxcbiAgICAgICAgICAgIChkKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGQucGN0X2xlYXZlcnMucmVwbGFjZShcIiVcIiwgXCJcIikpfVxuICAgICAgICAgIClcbiAgICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAwLjYpXG4gICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpO1xuXG4gICAgICAgIGNvbnN0IGRlc19jaXRpZXMgPSBzdmdcbiAgICAgICAgICAuc2VsZWN0QWxsKCcuZGVzLWNpcmNsZScpXG4gICAgICAgICAgLmRhdGEoZmlsdGVyZWRDaXRpZXMpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgICAgIGQuZGVzdF9sYXQsXG4gICAgICAgICAgICBdKVswXTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbXG4gICAgICAgICAgICAgIGQuZGVzdF9sb24sXG4gICAgICAgICAgICAgIGQuZGVzdF9sYXQsXG4gICAgICAgICAgICBdKVsxXTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCdyJywgNSlcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnZGVzLWNpcmNsZScpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ3JlZCcpXG4gICAgICAgICAgLnN0eWxlKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMXB4JylcbiAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24gKG1vdXNlRCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cobW91c2VEKTtcbiAgICAgICAgICAgIGNvbnN0IGNpdHluYW1ldGV4dCA9IHN2Z1xuICAgICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBtb3VzZUQueClcbiAgICAgICAgICAgICAgLmF0dHIoJ3knLCBtb3VzZUQueSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NpdHktbmFtZScpXG4gICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxMClcbiAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmx1ZScpXG4gICAgICAgICAgICAgIC50ZXh0KFxuICAgICAgICAgICAgICAgIGBDaXR5OiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLmRlc3RfY2l0eX0sIFBjdCBvZiBMZWF2ZXJzOiAke21vdXNlRC5zcmNFbGVtZW50Ll9fZGF0YV9fLnBjdF9sZWF2ZXJzfWBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9KTt9XG59KTtcblxuLy8gY3N2KFwiY2l0eWRhdGEuY3N2XCIpLnRoZW4oY2l0aWVzID0+IHtcblxuLy8gICAgIC8vIERyYXcgdGhlIGNpdGllc1xuLy8gICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4vLyAgICAgICAuc2VsZWN0QWxsKFwiY2lyY2xlXCIpXG4vLyAgICAgICAuZGF0YShjaXRpZXMpXG4vLyAgICAgICAuZW50ZXIoKVxuLy8gICAgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuLy8gICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNpdHlcIilcbi8vICAgICAgIC5hdHRyKFwiY3hcIiwgZCA9PiB7IHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbiwgZC5sYXRdKVswXTsgfSlcbi8vICAgICAgIC5hdHRyKFwiY3lcIiwgZCA9PiB7IHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbiwgZC5sYXRdKVsxXTsgfSlcbi8vICAgICAgIC5hdHRyKFwiclwiLCA1KVxuLy8gICAgICAgLnN0eWxlKFwiZmlsbFwiLCBcInJlZFwiKVxuLy8gICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiI2ZmZlwiKVxuLy8gICAgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMXB4XCIpXG4vLyAgICAgICAub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZCkge1xuLy8gICAgICAgICBkMy5zZWxlY3QodGhpcylcbi8vICAgICAgICAgICAudHJhbnNpdGlvbigpXG4vLyAgICAgICAgICAgLmR1cmF0aW9uKDIwMClcbi8vICAgICAgICAgICAuYXR0cihcInJcIiwgMTApXG4vLyAgICAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBcImJsdWVcIik7XG4vLyAgICAgICB9KVxuLy8gICAgICAgLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZCkge1xuLy8gICAgICAgICBkMy5zZWxlY3QodGhpcylcbi8vICAgICAgICAgICAudHJhbnNpdGlvbigpXG4vLyAgICAgICAgICAgLmR1cmF0aW9uKDIwMClcbi8vICAgICAgICAgICAuYXR0cihcInJcIiwgNSlcbi8vICAgICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIFwicmVkXCIpO1xuLy8gICAgICAgfSlcbi8vICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpIHtcbi8vICAgICAgICAgLy9jb25zb2xlLmxvZyhkLm5hbWUgKyBcIiAoXCIgKyBkLmxhdCArIFwiLCBcIiArIGQubG9uICsgXCIpXCIpO1xuLy8gICAgICAgY29uc29sZS5sb2coZC5zcmNFbGVtZW50Ll9fZGF0YV9fKTtcblxuLy8gICAgICAgfSk7XG4vLyAgIH0pO1xuIl0sIm5hbWVzIjpbImRpc3BhdGNoIiwic2VsZWN0IiwianNvbiIsImZlYXR1cmUiLCJzZWxlY3RBbGwiLCJjc3YiXSwibWFwcGluZ3MiOiI7OztFQUNPLE1BQU0sSUFBSSxHQUFHLE1BQU07RUFDMUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztFQUNULEVBQUUsSUFBSSxTQUFTLENBQUM7RUFDaEIsRUFBRSxJQUFJLE9BQU8sQ0FBQztFQUNkLEVBQUUsTUFBTSxTQUFTLEdBQUdBLGFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUN2QyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxLQUFLO0VBQzVCO0VBQ0EsSUFBSSxTQUFTO0VBQ2IsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDO0VBQ3pCLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFD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