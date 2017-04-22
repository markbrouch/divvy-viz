import React from 'react'

export const InfoPane = ({ hovered, selected }) => {
  const name = hovered.name || selected.name
  const capacity = hovered.dpcapacity || selected.dpcapacity
  const onlineDate = hovered.online_date || selected.online_date
  const trips = (hovered.id && selected.id && hovered.id === selected.id) ||
    (!hovered.id && selected.trips)
    ? selected.trips
    : undefined

  return (
    <div className="InfoPane panel panel-default">
      <dl className="panel-body dl-horizontal">
        <dt>Name</dt><dd>{name}</dd>
        <dt>Capacity</dt><dd>{capacity}</dd>
        <dt>Added</dt><dd>{onlineDate}</dd>
        {trips && <dt>Trips</dt>}
        {trips && <dd>{selected.trips}</dd>}
      </dl>
    </div>
  )
}

InfoPane.defaultProps = {
  hovered: {},
  selected: {}
}
