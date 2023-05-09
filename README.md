# Where are people migrating Pre and Post COVID?
* Did New York and LA Really see a exodus of people during the pandemic?
* Did places in the South East see an inflow?
* What more can you see? 
Explore the data to find out.

Using [data](https://docs.google.com/spreadsheets/d/1JhNplghcvx2qCqCfsfe2_sLvQA-W4hpb/edit?usp=sharing&ouid=114995913357222036514&rtpof=true&sd=true) from [Redfin](https://www.redfin.com/), we show the top destinations where people migrate out or migrate in to major cities.

We reveal the following aspects with our visualization:
1. Net flow (people moving in - people moving out) in all major metros.
2. Cities where outgoers are migrating to in each metro.
3. Cities where incomers of each metro are originated from. 

It is an interactive map. Feel free to click the buttons to visualize different aspects of the data, select your desired cities, and explore the desired time periods!

## Interaction tips:

0. Click on "Show Net Flow", "Show Outgoers", or "Show Incomers" buttons to visualize different aspects of the data.
1. Slide the "Season" slider to visualize the changes over time.
2. Click the "Play" button to animate the changes over time.
3. Click on a city to visualize the top places people in that city are moving from or migrating to.
4. Hover over a city to see the net flow value (People moving in - People moving out).
5. Hover over the flows to view the percentage of people moving to the city based on all incomers or people leaving the city based on all outgoers.

## In-depth

We used the migration data collected from about 2 million Redfin users (link [here](https://docs.google.com/spreadsheets/d/1JhNplghcvx2qCqCfsfe2_sLvQA-W4hpb/edit?usp=sharing&ouid=114995913357222036514&rtpof=true&sd=true) from [Redfin](https://www.redfin.com)), recording people who moved from one city to another when they bought a house on Redfin.

The data consists of a period of five years (Fall 2016-Fall 2021).

### Features
1. Use the "Show Net Flow" button to create the bubble map of netflows. The size of bubbles encodes the net flow values. Red represents positive migration and blue represents negative migration. One can use the slider to change the time period, and hover on different cities to read the net flow values.
2. Use the "Show Outgoers" button to create the flow maps for each city (by default Seattle). The width of lines encodes the percentage of people leaving the city based on all outgoers. One can click on a city to visualize the top places people in that city are migrating to. Use the slider to change the time period. Hover over the flows to view the percentage of people leaving the city based on all outgoers, or on the cities to read the net flow values.
3. Use the "Show Incomers" button to create the flow maps for each city (by default Seattle). The width of lines encodes the percentage of people moving to the city based on all incomers. One can click on a city to visualize the top places from where people have migrated from. Use the slider to change the time period. Hover over the flows to view the percentage of people moving to the city based on all incomers, or on the cities to read the net flow values.
4. There is a convenient "Play" button which allows one to track migration across time.
5. Use "Clear Map" button to clear all plots.

### Credits
1. We used the data from [Redfin](https://www.redfin.com) for Migration.
2. We used [Simple Maps Data](https://simplemaps.com/data/us-cities) for the Latitude and Longitude of cities.