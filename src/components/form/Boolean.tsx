import { component$, $ } from "@builder.io/qwik";
import type { FilterOperators } from '~/helpers/ClusteredData'

export default component$(({ schema, onChange$ }: { schema: any, onChange$: (value: boolean, operator: FilterOperators) => void }) => {

  return <div class="filter">
    <strong>{schema.label}</strong>
    <input type="checkbox" onChange$={$((event) => onChange$((event.target as HTMLInputElement).checked, '>'))} />
  </div>
})