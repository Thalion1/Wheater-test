console.log('hello world');
// const yrApiUrl = 'https://www.yr.no/api/v0/locations/1-175981'
let apiUrl;
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
    apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}&`
    console.log(getFact());
    return apiUrl
}

const getFact = async () => {
    const response = await fetch(`${apiUrl}`);
    const data = await response.json();
    const trueData = await data.properties.timeseries;
    const [tempTime, tempData] = cleanup(trueData)
    highCharts(tempTime, tempData)
    return trueData
}

function cleanup(array) {
    let tempTime = [];
    let tempArray = [];
    for (let i = 0; i < 25; i++) {// time format 2026-05-07T08:00:00Z Year Month Day Time Time-Zone
        const element = array[i];
        tempTime.push(element.time.substr(11, 5));
        tempArray.push(element.data.instant.details.air_temperature);
    }
    return [tempTime, tempArray]
}

function highCharts(time, array) {
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
            name: 'temprature for today',
            data: array
        }]/*,
        series: [{
            lineColor: '#0f0',
            color: '#0f0',
            name: 'userInput',
            data: array
        }]*/
    });
}
