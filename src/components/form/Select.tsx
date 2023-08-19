import { component$ } from "@builder.io/qwik";
import { FilterOperators } from '~/helpers/ClusteredData'

export default component$(({ schema, onChange$ }: { schema: any, onChange$: (value: string, operator: FilterOperators) => void }) => {

  return <div class="filter">
    <strong>{schema.label}</strong>
    <select class="form-select" onChange$={(event) => onChange$(event.target.value, '==')}>
      <option value="_none">{`- No ${schema.label.toLowerCase()} selected -`}</option>
      {[...schema.options].map((option: string) => <option value={option} key={option}>{option}</option>)}
    </select>
  </div>
})