import React, { Component } from 'react'
import { render } from 'react-dom'
import MapGL from 'react-map-gl'
import DeckGL, { IconLayer, ArcLayer } from 'deck.gl'
import chroma from 'chroma-js'
import values from 'lodash/values'

import StationData from './station-data-2016-q3.csv'

import index from './index.html'
import style from './app.css'
import DivvyIcon from './images/divvy-icon.png'

import { InfoPane } from './components/info-pane'

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN

if (!MAPBOX_TOKEN) {
  throw new Error('Please specify a valid mapbox token')
}

class Root extends Component {
  constructor(props) {
    super(props)

    this.state = {
      width: 500,
      height: 500,
      viewport: {
        latitude: 41.882059,
        longitude: -87.6288953,
        zoom: 12,
        bearing: 0,
        pitch: 60
      }
    }
  }

  updateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  componentWillMount() {
    this.updateDimensions()
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  renderArcLayer(station) {
    const id = parseInt(station.id)

    this.setState({
      tripsData: [],
      selected: {
        ...station,
        trips: 'loading'
      }
    })

    fetch(`/api/trips/${id}`).then(response => response.json()).then(data => {
      let trips = 0
      for (let toId in data[0]) {
        trips += data[0][toId]
        this.setState({
          tripsData: this.state.tripsData.concat([
            {
              from: id,
              to: parseInt(toId),
              trips: data[0][toId]
            }
          ])
        })
      }

      this.setState({ selected: { ...this.state.selected, trips } })
    })
  }

  render() {
    const {
      viewport,
      width,
      height,
      hovered = {},
      selected = {},
      tripsData = []
    } = this.state

    const stationData = values(StationData)
    const getStationData = stationId =>
      stationData.find(station => parseInt(station.id) === parseInt(stationId))

    const getColor = chroma.scale(['112F54', '71870E']).domain([1, 10])

    const stationsLayer = new IconLayer({
      id: 'stations-layer',
      data: stationData,
      iconAtlas: DivvyIcon,
      iconMapping: {
        marker: { x: 0, y: 0, width: 1024, height: 1024 }
      },
      getPosition: d => [d.longitude, d.latitude],
      getIcon: d => 'marker',
      getSize: d => 48,
      pickable: true,
      onHover: info => this.setState({ hovered: stationData[info.index] }),
      onClick: info => this.renderArcLayer(stationData[info.index])
    })

    const tripsLayer = new ArcLayer({
      id: 'trips-layer',
      data: tripsData,
      fp64: true,
      strokeWidth: 3,
      getSourcePosition: d => {
        const fromStation = getStationData(d.from)

        return [fromStation.longitude, fromStation.latitude]
      },
      getSourceColor: d => getColor(Math.sqrt(d.trips)).rgb(),
      getTargetColor: d => getColor(Math.sqrt(d.trips)).rgb(),
      getTargetPosition: d => {
        const toStation = getStationData(d.to)

        return [toStation.longitude, toStation.latitude]
      }
    })

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/light-v9"
        onChangeViewport={v => this.setState({ viewport: v })}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        perspectiveEnabled
        width={width}
        height={height}
      >
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          layers={[stationsLayer, tripsLayer]}
        />
        <InfoPane hovered={this.state.hovered} selected={this.state.selected} />
      </MapGL>
    )
  }
}

const root = document.createElement('div')
document.body.appendChild(root)

render(<Root />, root)
