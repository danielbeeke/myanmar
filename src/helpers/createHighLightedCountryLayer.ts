export const createHighLightedCountryLayer = (countryIso3: string, disputedNames: Array<string> = []) => {
  return {
    "id": `${countryIso3}_highlighted`,
    "type": "line",
    "source": "maptiler_planet",
    "source-layer": "boundary",
    "minzoom": 0,
    "filter": [
      "any",
      [
        "==",
        "adm0_r",
        countryIso3
      ],
      [
        "==",
        "adm0_l",
        countryIso3
      ],
      ...disputedNames.map(disputedName => [
        "==",
        "disputed_name",
        disputedName
      ])
    ],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-blur": 0,
      "line-color": "#393db3",
      "line-width": 2
    }
  }
}