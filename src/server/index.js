import express from 'express';
import winston from 'winston';
import path from 'path';
import mongoose from 'mongoose';
import c2g from 'csv2geojson';
import multer from 'multer';
import bodyParser from 'body-parser';

mongoose.connect('localhost:27017/tiles');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const dsSchema = new Schema({
  name: String,
  data: Object,
});

const Dataset = mongoose.model('Dataset', dsSchema);

const port = 3000;
const app = express();
app.use(bodyParser.json({limit: '150MB'}));

const bundle = require('./dev-server').default;
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
console.log('SPINNING UP DEV ENVIRONMENT...');
bundle();

const csvdata = 'name,latitude,longitude,PolicyType,color,symbol,when-date,times-time,completelyWhen-datetime,complete-percent\n' +
'name 1,27.9523026,-82.5328792,HW2,blue,Circle,1/2/2015,1:00:00 PM,1/1/2014 1:00,5' +
'name 2,27.9523026,-83,HW2,red,Circle,1/3/2015,2:00:00 PM,1/2/2014 1:00,10' +
'name 3,27.7523026,-82.5328792,HO2,green,Circle,1/4/2015,3:00:00 PM,1/3/2014 1:00,15' +
'name 4,27.3026,-83,HW2,red,square,1/5/2015,4:00:00 PM,1/4/2014 1:00,20' +
'name 5,27.9523026,-82.28792,HW2,blue,square,1/6/2015,5:00:00 PM,1/5/2014 1:00,25' +
'name 3,27.7523026,-82.5328792,HO2,green,Circle,1/4/2015,3:00:00 PM,1/3/2014 1:00,15' +
'name 4,27.3026,-83,HO2,red,square,1/5/2015,4:00:00 PM,1/4/2014 1:00,20' +
'name 5,27.9523026,-82.28792,HO2,blue,square,1/6/2015,5:00:00 PM,1/5/2014 1:00,25';



// const query = Dataset.find({
//   data: {
//     features: {
//       geometry: {
//         $near: {
//         coordinates: [
//             27.3026,
//             -83
//           ],
//       },}
//     },
//   },
// });
//
// query.exec((err, res) => {
//   console.log(err, res);
// });
//
// Dataset.findOne({}, (err, res) => {
//   console.log(err, res.data.features);
// });

app.all('/dist/*', (req, res) => {
  proxy.web(req, res, {
    target: 'http://localhost:8080',
  });
});
app.all('/sockjs-node/*', (req, res) => {
  proxy.web(req, res, {
    target: 'http://localhost:8080',
  });
});
proxy.on('error', () => {
  winston.info('Could not connect to proxy, please try again...');
});

app.use(express.static(path.join(__dirname, './../../public/dist')));

app.get('/data', (req, res) => {
  Dataset.find({}, 'name', (err, docs) => {
    res.status(200).json(docs);
  });
});

app.get('/data/:id', (req, res) => {
  const _id = req.params.id;
  Dataset.findOne({ _id }, 'data', (err, doc) => {
    res.status(200).json(doc);
  });
});

app.post('/load', (req, res) => {
  c2g.csv2geojson(req.body.csv, (err, data) => {
    const ds = new Dataset();
    ds.name = `MYFILE${Date.now()}`;
    ds.data = data;
    ds.save((err, savedDoc) => {
      winston.info(err, 'doc created');
      res.status(200);
    });
  });
});

app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, './../../public', 'index.html'));
});

app.listen(port, () => {
  winston.info(`listening on port: ${port}`);
});
