import { component$, noSerialize, useStore, useVisibleTask$, NoSerialize } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Map, PointLike, MapGeoJSONFeature } from 'maplibre-gl';
import 'maplibre-gl/src/css/maplibre-gl.css';
import { createHighLightedCountryLayer } from '~/helpers/createHighLightedCountryLayer'
import { ClusteredData } from '~/helpers/ClusteredData';
import { ColoredGeoJson } from '~/helpers/ColoredGeoJson'

const violenceAgainstCivilians = new ClusteredData('violence', '/data/violence-against-civilians.csv', {
  timestamp: { type: 'integer', name: 'date', label: 'Date', filterable: 'date' },
  sub_event_type: { type: 'string', name: 'subtype', filterable: 'select', label: 'Event' },
  actor1: { type: 'string', name: 'actor1', label: 'Actor 1', filterable: 'select' }, // 'Military Forces of Myanmar (2021-)'
  actor2: { type: 'string', name: 'actor2', label: 'Actor 2', filterable: 'select'  }, // 'Civilians (Myanmar)'
  notes: { type: 'string', label: 'Note'  },
  fatalities: { type: 'integer', aggregate: true, filterable: 'boolean' }
}, ['#1c0000', '#270b07', '#34110e', '#411613', '#501b17', '#5e201b', '#6d251f', '#7d2b23', '#8d3027'])

const ethnics = new ColoredGeoJson(
  'ethnics', 
  '/data/ethnic.geojson.json', 
  (feature: any) => feature.properties.FIPS_CNTRY === 'BM',
  'G1SHORTNAM'
)

export default component$(() => {
  const store = useStore({
    startDate: Math.floor(new Date('2023-08-01').valueOf() / 1000),
    endDate: Math.floor(new Date().valueOf() / 1000),
    selectedFeatures: [] as unknown as NoSerialize<MapGeoJSONFeature[]>,
    filters: null
  })

  useVisibleTask$(async () => {
    const style = await fetch(`https://api.maptiler.com/maps/topo-v2/style.json?key=i9gslr0G5loMzaOVjD8f`)
      .then(response => response.json())

    style.layers.push(createHighLightedCountryLayer('MMR', ['BorderBurma-Thailand']))

    style.layers = style.layers
      .filter((layer: any) => !layer.id.includes('label') 
        || ['Country labels', 'State labels'].includes(layer.id))

    const map = new Map({
      container: 'map',
      style,
      attributionControl: false,
      center: [96.2605312, 19.8367083],
      zoom: 5
    })

    const { layers: ethnicLayers, sources: ethnicSources } = await ethnics.asLayers()
    for (const [name, source] of Object.entries(ethnicSources)) map.addSource(name, source)
    for (const layer of ethnicLayers) map.addLayer(layer)

    violenceAgainstCivilians.setMap(map)
    const { sources: violenceSources, layers: violenceLayers, filters } = await violenceAgainstCivilians.asClusters(store)
    for (const [name, source] of Object.entries(violenceSources)) map.addSource(name, source)
    for (const layer of violenceLayers) map.addLayer(layer)

    map.on('load', () => {
      document.body.classList.add('loaded')
      console.log(filters)

      map.on('click', (e) => {
        const bbox = [
          [e.point.x - 5, e.point.y - 5],
          [e.point.x + 5, e.point.y + 5]
        ] as [PointLike, PointLike]

        store.selectedFeatures = noSerialize(map.queryRenderedFeatures(bbox, {
          layers: ['violence', 'ethnics']
        }))
      })

    })
  })

  const ethnicFeatures = store.selectedFeatures?.filter(feature => feature.source === 'ethnics') ?? []
  const violenceFeatures = store.selectedFeatures?.filter(feature => feature.source === 'violence') ?? []

  console.log(violenceFeatures)

  return (
    <>
      <div id="map"></div>

      <div class="sidebar">
        {/* <div class="filters">{store.filters ? store.filters : null}</div> */}

        {ethnicFeatures.length ? <div class="ethnics">
          {ethnicFeatures.map(ethnic => <span class="ethnic-label" style={{ background: ethnic.properties.color }}>{ethnic.properties.G1SHORTNAM}</span>)}
        </div> : null}

        {violenceFeatures.length ? <div class="violence">
          {violenceFeatures.map(violence => {
            return <div>
              { Object.entries(violence.properties).map(([key, value]) => <div><strong>{key}:&nbsp;</strong><span>{value}</span></div>) }
            </div>
          })}
        </div> : null}

      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Myanmar",
}
