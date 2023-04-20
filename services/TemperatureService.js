const {InfluxDB, flux} = require('@influxdata/influxdb-client')

class TemperatureService {

    constructor(url, token, org) {
      this.client = new InfluxDB({ url, token });
      this.queryApi = this.client.getQueryApi(org);
    }

    getData(callback) {
      const query = flux`from(bucket:"iotsmart")\
      |> range(start: -72h)\
      |> filter(fn:(r) => r._measurement == "my_measurement")\
      |> filter(fn:(r) => r.location == "chamber_1")\
      |> filter(fn:(r) => r._field == "temperature")\
      |> aggregateWindow(every: 24h, fn: max, createEmpty: false,)\
      |> yield(name:"max")`

      const resultados = [];

      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
            const o = tableMeta.toObject(row)
            console.log(`${o._time} ${o._measurement}: ${o._field}=${o._value}`);
            console.log(o._value);
            resultados.push(o);
        },
        error(error) {
            console.error(error);
            console.log('Finished ERROR')
            callback(error);
        },
        complete() {
            console.log('Finished SUCCESS')
            callback(resultados)
        },
    });
  }
}

module.exports = TemperatureService;
