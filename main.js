console.log('hello world');
const apiUrl = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=62.1018472244196&lon=6.942135378172793&'
const nowDate = new Date();
let tempData;

const getFact = async () => {
    const response = await fetch(`${apiUrl}`);
    const data = await response.json();
    const trueData = await data.properties.timeseries;
    const [tempTime, tempData] = cleanup(trueData)
    highCharts(tempTime, tempData)
    return trueData
}
console.log(getFact());

function cleanup(array) {
    let tempTime = [];
    let tempArray = [];
    for (let i = 0; i < 25; i++) {// 2026-05-07T08:00:00Z
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
                '<a href="https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature" ' +
                'target="_blank">Wikipedia.com</a>'
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
            name: 'Reggane',
            data: array
        }]
    });
}
