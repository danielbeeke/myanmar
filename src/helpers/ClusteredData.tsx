import { parse } from 'csv-parse/browser/esm/sync';
import type { Map, GeoJSONSource } from 'maplibre-gl'
import type { LayerSpecification, SourceSpecification } from 'maplibre-gl'
import { MinMaxSet } from './MinMaxSet';

type Mapping = {
  type: 'string' | 'integer' | 'date'
  name?: string
  aggregate?: true,
  filterable?: 'select' | 'boolean' | 'date',
  filter?: string,
  label?: string,
  operator?: FilterOperators
}

export type FilterOperators = '==' | '>' | '><'

export class ClusteredData {
  public geojsonFeatures: any
  public name: string
  public dataUrl: string
  public mapping: { [key: string]: Mapping}
  public colors: Array<string>
  public filters: { [key: string]: Set<string> | MinMaxSet<number> } = {}
  public selectedFilters: { [key: string]: [string | boolean, FilterOperators] } = {}
  public map: Map | undefined

  constructor (name: string, dataUrl: string, mapping: { [key: string]: Mapping}, colors: Array<string>) {
    this.name = name
    this.dataUrl = dataUrl
    this.mapping = mapping
    this.colors = colors
  }

  async init () {
    if (this.geojsonFeatures) return
    this.geojsonFeatures = true

    const data = await fetch(this.dataUrl).then(response => response.text())

    this.geojsonFeatures = parse(data, {
      columns: true,
      skip_empty_lines: true
    }).map((csvLine: any) => {
      const properties = Object.fromEntries(Object.entries(this.mapping).map(([sourceName, mapping]) => {
        let value = csvLine[sourceName]
        if (mapping.type === 'integer') value = parseInt(csvLine[sourceName])
        if (mapping.type === 'date') value = Math.floor(new Date(csvLine[sourceName]).valueOf() / 1000)

        const outputName = mapping.name ?? sourceName

        if (mapping.filterable && !this.filters[sourceName]) this.filters[sourceName] = mapping.filterable === 'date' ? new MinMaxSet() : new Set()
        if (mapping.filterable && ['select', 'date'].includes(mapping.filterable)) {
          this.filters[sourceName].add(value)
        }

        return [outputName, value]
      }))

      return {
        type: 'Feature',
        properties,
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(csvLine.longitude), parseFloat(csvLine.latitude)]
        }
      }
    }).filter((mappedObject: any) => {
      const filters = Object.entries(this.mapping).filter(([sourceName, mapping]) => mapping.filter)
      if (!filters.length) return true

      return filters.every(([sourceName, mapping]) => {
        const outputName = mapping.name ?? sourceName
        return mappedObject.properties[outputName] === mapping.filter
      })
    })

    console.log(this.filters)
  }

  setMap (map: Map) {
    this.map = map
  }

  getAggregate () {
    const aggregate = Object.entries(this.mapping).find(([sourceName, mapping]) => mapping.aggregate)
    return aggregate?.[0]
  }

  setFilter (name: string, value: string | boolean, operator: FilterOperators) {
    if (value === '_none') {
      delete this.selectedFilters[name]
    }
    else {
      this.selectedFilters[name] = [value, operator]
    }
    const source = this.map?.getSource(this.name)
    const newGeoJson = this.asFeatureCollection()
    ;(source as GeoJSONSource).setData(newGeoJson.data)
  }

  asFeatureCollection () {
    return {
      type: 'geojson',
      data: {
          type: 'FeatureCollection',
          features: this.geojsonFeatures.filter((feature: any) => {
            if (!Object.keys(this.selectedFilters).length) return true
            return Object.entries(this.selectedFilters).every(([name, [value, operator]]) => {
              if (operator === '==') return feature.properties[name] === value
              if (operator === '><') return feature.properties[name] === value
              if (operator === '>') return feature.properties[name] > value
            })
          })
      }
    } as const
  }

  async asClusters () {
    await this.init()

    const colorGradient = this.colors
      .flatMap((color, index) => [index ? index * 10 : null, color])
      .filter(Boolean)

    const geojsonFeatureCollection = Object.assign(this.asFeatureCollection(), {
      cluster: true,
      clusterRadius: 50,
      clusterProperties: {
        sum: ["+", ["get", this.getAggregate()]],
      },
    })

    return {
      sources: { [this.name]: geojsonFeatureCollection },
      filters: Object.fromEntries(Object.entries(this.filters).map(([sourceName, options]) => {
        const label = this.mapping[sourceName].label ?? sourceName
        const outputName = this.mapping[sourceName].name ?? sourceName

        return [outputName, {
          label,
          type: this.mapping[sourceName].filterable,
          options,
        }]
      })),
      layers: [{
        id: 'unclustered-point',
        type: 'circle',
        source: this.name,
        paint: {
            'circle-color': this.colors.at(-1),
            'circle-radius': 10,
            'circle-stroke-width': 0,
            'circle-stroke-color': '#fff'
        }
      },
      {
        id: this.name,
        type: 'circle',
        source: this.name,
        filter: ['has', 'sum'],
        paint: {
            'circle-color': ['step', ['get', 'sum'],
                ...colorGradient
            ],
            'circle-radius': ['step', ['get', 'sum'],
                20,
                100,
                30,
                750,
                40
            ]
        }
      }, {
        id: 'cluster-count',
        type: 'symbol',
        source: this.name,
        filter: ['has', 'sum'],
        paint: {
          'text-color': 'white'
        },
        layout: {
            'text-field': ["get", "sum"],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
        }
      }]
    } as {
      layers: Array<LayerSpecification>,
      sources: { [key: string]: SourceSpecification },
      filters: { [k: string]: {
        label: string;
        options: Set<string>;
      }}
    }
  }
}