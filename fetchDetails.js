const axios = require('axios');
const fs = require('fs');
const touristRoutes = require('./routes/touristRoutes.json');

async function fetchDetails() {
    let promieses = [];
    for (let i = 0; i < touristRoutes.length; i++) {
        console.log(touristRoutes[i].id);
        promieses.push(axios.get(`http://123.56.149.216:8080/api/touristRoutes/${touristRoutes[i].id}`))
    }

    Promise.all(promieses).then((values) => {
        let datas = [];
        values.map((value) => { datas.push(value.data) });
        //console.log(datas);
        fs.writeFileSync('./routes/touristRouteDetails.json', JSON.stringify(datas, null, '  '));
    })
}

fetchDetails();