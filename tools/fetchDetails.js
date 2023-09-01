const axios = require('axios');
const fs = require('fs');
const touristRoutes = require('../data/touristRoutes.json');

const API_HOST = "82.157.43.234:8080";

async function fetchDetails() {
  let promieses = [];
  for (let i = 0; i < touristRoutes.length; i++) {
    console.log(touristRoutes[i].id);
    promieses.push(axios.get(`${API_HOST}/api/touristRoutes/${touristRoutes[i].id}`))
  }

  Promise.all(promieses).then((values) => {
    let datas = [];
    values.map((value) => { datas.push(value.data) });
    //console.log(datas);
    fs.writeFileSync('./routes/touristRouteDetails.json', JSON.stringify(datas, null, '  '));
  })
}

fetchDetails();
