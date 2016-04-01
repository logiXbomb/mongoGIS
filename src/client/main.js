import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import request from 'superagent';
import Reader from 'filereader'
import c2g from 'csv2geojson';
import './main.scss';

let map;

const reader = new Reader();

class App extends Component {
  constructor() {
    super();

    this.state = {
      count: 0,
      items: [],
    };
  }
  componentDidMount() {
    setTimeout(() => {
      mapboxgl.accessToken = 'pk.eyJ1IjoiZXh6ZW8iLCJhIjoid1BOX09sQSJ9.77MNVZDIIdUYJ3xsFtUWtA';
      map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v8',
        center: [-82.50, 27],
        zoom: 6,
      });

      request
        .get('/data')
        .end((err, res) => {
          this.setState({ items: res.body });
        });
    });
  }
  _addLayer(id) {
    // console.log(layer);
    request
      .get(`/data/${id}`)
      .end((err, res) => {
        const { _id, data } = res.body;
        this.setState({ count: data.features.length });

        map.addSource(_id, {
          type: 'geojson',
          data: data,
        });
        map.addLayer({
          id: _id,
          type: 'circle',
          source: _id,
          paint: {
            'circle-radius': 5,
            'circle-color': '#82B944',
          },
        });
      });
  }
  handleSubmit(e) {
    e.preventDefault();
  }
  _change(e) {
    var self = this;
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = function(upload) {
      request
        .post('/load')
        .send({ csv: upload.target.result })
        .end((err, res) => {
          console.log('finished');
        });
    }

    reader.readAsText(file);
  }
  render() {
    console.log(this.state);
    return (
      <div>
        <div id="map"></div>
        <div className="menu">
          <input type="file" onChange={this._change} />
          <div className="count">{this.state.count}</div>
          <ul>
            {
              this.state.items.map(x => (
                <li onClick={this._addLayer.bind(this, x._id)}>{x._id}</li>
              ))
            }
          </ul>
        </div>
      </div>
    )
  }
}

render(
  <Router history={browserHistory}>
    <Route path="/" component={App} />
  </Router>,
  document.getElementById('app')
);
