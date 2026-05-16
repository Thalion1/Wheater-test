console.log('hello world');
// const yrApiUrl = 'https://www.yr.no/api/v0/locations/1-175981'
let metApiUrl;
let pentApiUrl;
const now = new Date().toISOString();
// const hours = now.getHours();
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
    highCharts(cleanup(trueMetData, pentData))// inputing the colective array
    return [trueMetData, pentData]
}

function cleanup(metApi, pentApi) {
    let colectivArray = [
        [],// 0 time
        [],// 1 avrage temp
        [// 2 met
            [],// temp
            [] // precipitation/rain
        ],
        [// 3 yr
            [],// temp
            [] // precipitation/rain
        ],
        [// 4 storm
            [],// temp
            [] // precipitation/rain
        ]
    ]
    console.log(pentApi);
    for (let i = 0; i < pentApi?.["1h"]?.yr?.[0]?.steps?.length; i++) {// time format 2026-05-07T08:00:00Z Year Month Day Time Time-Zone
        colectivArray[0].push(pentApi["1h"].yr[0].steps[i].startDate.substr(11, 5));
        colectivArray[2][0].push(metApi[i].data.instant.details.air_temperature);
        // colectivArray[2][1].push(metApi[i].data.instant.details.precipitation_amount ?? 0);
        colectivArray[2][1].push(metApi[i].data.next_1_hours.details.precipitation_amount)
        colectivArray[3][0].push(pentApi?.["1h"]?.yr?.[0]?.steps[i].temperature);
        colectivArray[3][1].push(pentApi?.["1h"]?.yr?.[0]?.steps[i].precipitation);
        colectivArray[4][0].push(pentApi?.["1h"]?.storm?.[0]?.steps[i].temperature);
        colectivArray[4][1].push(pentApi?.["1h"]?.storm?.[0]?.steps[i].precipitation);
    }
    console.log(colectivArray);
    for (let i = 0; i < pentApi["1h"].yr[0].steps.length; i++) {
        let tempAvrage = 0
        for (let x = 2; x < colectivArray.length; x++) {
            tempAvrage += colectivArray[x][0][i];
        }
        colectivArray[1].push(tempAvrage / (colectivArray.length - 2))// pushing the avrage value for the time
    }
    
    return colectivArray// returning the collective array
}

function highCharts(array) {
    // Data retrieved https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
    Highcharts.chart('temp-container', {
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
            categories: array[0]// time
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
        series: [{// 
            lineColor: '#000',
            color: '#000',
            name: 'avrage',
            data: array[1]// avrage
        },{
            lineColor: '#00f',
            color: '#00f',
            name: 'met',
            data: array[2][0]// met
        },{
            lineColor: '#f00',
            color: '#f00',
            name: 'yr',
            data: array[3][0]// yr
        },{
            lineColor: '#0f0',
            color: '#0f0',
            name: 'storm',
            data: array[4][0]// storm
        }]
    });
    Highcharts.chart('precipitation-container', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Rain for the day'
        },
        xAxis: {
            categories: array[0]// time
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Precipitation (mm)'
            }
        },
        tooltip: {
            valueSuffix: 'mm'
        },
        series: [
        {
            name: 'met',
            data: array[2][1]
        },{
            name: 'yr',
            data: array[3][1]
        },
        {
            name: 'storm',
            data: array[4][1]
        }
        ]
    })
}
