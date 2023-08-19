import { component$ } from "@builder.io/qwik";
import { FilterOperators } from '~/helpers/ClusteredData'

export default component$(({ schema, onChange$ }: { schema: any, onChange$: (value: boolean, operator: FilterOperators) => void }) => {

  const [min, max] = [...schema.options]
  const minDate = new Date(min * 1000)
  const maxDate = new Date(max * 1000)

  const minValue = `${minDate.getFullYear()}-${(minDate.getMonth() + 1).toString().padStart(2, '0')}-${(minDate.getDate() + 1).toString().padStart(2, '0')}`
  const maxValue = `${maxDate.getFullYear()}-${(maxDate.getMonth() + 1).toString().padStart(2, '0')}-${(maxDate.getDate() + 1).toString().padStart(2, '0')}`

  return <div class="filter">
    <strong>{schema.label}</strong>
    <div class="pickers">
      <input type='date' value={minValue} />
      <input type='date' value={maxValue} />
    </div>
  </div>
})