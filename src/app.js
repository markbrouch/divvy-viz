import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, { IconLayer } from 'deck.gl';

import StationData from '../data/station-data.json';

import style from './app.css';
import DivvyIcon from '../images/divvy-icon.png';

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error('Please specify a valid mapbox token');
}

console.log(StationData)

class Root extends Component {

  constructor(props) {
    super(props);

    this.state = {
      width: 500,
      height: 500,
      viewport: {
        latitude: 41.882059,
        longitude: -87.6288953,
        zoom: 12,
        bearing: 0,
        pitch: 0
      }
    };
  }

  updateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  render() {

    const {viewport, width, height} = this.state;

    const layer = new IconLayer({
      id: 'stations-layer',
      data: StationData.stations,
      iconAtlas: DivvyIcon,
      iconMapping: {
        marker: {x: 0, y: 0, width: 1024, height: 1024}
      },
      getPosition: d => [d.longitude, d.latitude],
      getIcon: d => 'marker',
      getSize: d => 48
    });

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/light-v9"
        onChangeViewport={v => this.setState({viewport: v})}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        perspectiveEnabled
        width={width}
        height={height}
      >
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          layers={[ layer ]}
        />
      </MapGL>
    );
  }

}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Root />, root);
