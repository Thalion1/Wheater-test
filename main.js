console.log('hello world');
// const yrApiUrl = 'https://www.yr.no/api/v0/locations/1-175981'
let metApiUrl;
let pentApiUrl;
const nowDate = new Date();
let tempData;

const userInput = document.getElementById('where');

async function whereAmI(input) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${input}&format=jsonv2`);
    const data = await response.json();
    const [lat, lon] = await [data[0].lat, data[0].lon]
    // console.log(lat, lon);
    
    return [lat, lon]
    return data
}

userInput.addEventListener('keydown', async (e) => {
    if (e.keyCode === 13) {
        let temp = userInput.value.trim().replaceAll(' ', '+')
        console.log(temp);
        const [lat, lon] = await whereAmI(temp)
        console.log(lat);
        console.log(where(lat, lon));

        // console.log(whereAmI(temp));
    }
})


// `https://nominatim.openstreetmap.org/search?q=${}&format=jsonv2`

/*
https://nominatim.openstreetmap.org/search?q=ørsta&&format=jsonv2
*/


function where(lat, lon) {
    // const response = await fetch(`${api}`);
    // const data = await response.json();
    metApiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}&`
    pentApiUrl = `https://pent.no/api/v2/long-term-forecast/${lat}/${lon}?days=9&resolution=1&resolution=6`
    console.log(getFact());
    return metApiUrl
}

const getFact = async () => {
    const metResponse = await fetch(`${metApiUrl}`);
    const pentResponse = await fetch(`${pentApiUrl}`);
    const metData = await metResponse.json();
    const pentData = await pentResponse.json();
    const trueMetData = await metData.properties.timeseries;
    const [tempTime, tempMetData, tempYrData, tempStormData] = cleanup(trueMetData, pentData)
    highCharts(tempTime, tempMetData, tempYrData, tempStormData);
    return [trueMetData, pentData]
}

function cleanup(metApi, pentApi) {
    let tempTime = [];
    let tempMetArray = [];
    let tempYrArray = [];
    let tempStormArray = [];
    console.log(pentApi);
    for (let i = 0; i < pentApi?.["1h"]?.yr?.[0]?.steps?.length; i++) {// time format 2026-05-07T08:00:00Z Year Month Day Time Time-Zone
        tempTime.push(pentApi["1h"].yr[0].steps[i].startDate.substr(11, 5));
        tempMetArray.push(metApi[i].data.instant.details.air_temperature);
        tempYrArray.push(pentApi?.["1h"]?.yr?.[0]?.steps[i].temperature);
        tempStormArray.push(pentApi?.["1h"]?.storm?.[0]?.steps[i].temperature);
    }
    
    return [tempTime, tempMetArray, tempYrArray, tempStormArray]
}

function highCharts(time, met, yr, storm) {
    // Data retrieved https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
    Highcharts.chart('container', {
        chart: {
            type: 'spline'
        },
        title: {
            text: 'Temperature for the day'
        },
        subtitle: {
            text: 'Source: ' +
                '<a href="https://github.com/Thalion1/Wheater-userInput" ' +
                'target="_blank">Me</a>'
        },
        xAxis: {
            categories: time
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            }
        },
        tooltip: {
            valueSuffix: '°C'
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            lineColor: '#00f',
            color: '#00f',
            name: 'met',
            data: met
        },{
            lineColor: '#0f0',
            color: '#0f0',
            name: 'storm',
            data: storm
        },{
            lineColor: '#f00',
            color: '#f00',
            name: 'yr',
            data: yr
        }]
    });
}
