import _ from 'lodash'
import {
  createAction,
  handleActions,
} from 'redux-actions'
import functionParams from 'function-params'

export function make_simple_reducer (key) {
  const path = (!_.isArray(key)) ? [key] : key
  return (state, {payload}) => state.setIn(path, payload)
}

export function make_toggle_reducer (key) {
  const path = (!_.isArray(key)) ? [key] : key
  return (state) => state.setIn(path, !_.get(state, path))
}

export function make_simple_selectors (parts, BASE) {
  return _.mapValues(parts, (value, key) => (state) => {
    if (state[BASE] == null) throw new Error('Missing: ' + BASE + '[' + key + '] in ' + JSON.stringify(state))
    return state[BASE][key]
  })
}
export function make_array_based_selectors (parts, array_selector, prop_key) {
  return _.mapValues(parts, (default_value, key) => (state, props) => {
    if (props == null || props[prop_key] == null) {
      throw new Error(`Selector ${key} is missing a prop of ${prop_key}`)
    }
    const array = array_selector(state)
    const array_index = props[prop_key]
    return _.get(array, [array_index, key], default_value)
  })
}

const PAYLOAD_INDEX = 2
const make_action = (action_types_prefix) => (handler, key) => {
  const type = `${action_types_prefix}${key}`
  if (functionParams(handler).length < PAYLOAD_INDEX) {
    return () => ({ type })
  }
  return createAction(type)
}

export function make_reducer_n_actions ({
  public_handlers = {},
  private_handlers = {},
  other_handlers = {},
  action_types_prefix,
  initial_state,
  Immutable,
}) {
  const all_handlers = {...public_handlers, ...private_handlers}
  const reducer = handleActions(
    {
      ..._.mapKeys(all_handlers, (handler, key) => `${action_types_prefix}${key}`),
      ...other_handlers,
    },
    Immutable(initial_state)
  )

  const actions = _.mapValues(public_handlers, make_action(action_types_prefix))

  const private_actions = _.mapValues(private_handlers, make_action(action_types_prefix))

  const ACTION_TYPES = _.mapValues(all_handlers, (handler, key) => `${action_types_prefix}${key}`)

  return {
    reducer,
    actions,
    private_actions,
    ACTION_TYPES,
  }
}
