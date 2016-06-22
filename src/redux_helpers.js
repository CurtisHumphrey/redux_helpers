import _ from 'lodash'
import {
  createAction,
  handleActions,
} from 'redux-actions'
import Immutable from 'seamless-immutable'

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

export function make_reducer_n_actions ({
  public_handlers = {},
  private_handlers = {},
  action_types_prefix,
  initial_state,
}) {
  const all_handlers = {...public_handlers, ...private_handlers}
  const reducer = handleActions(
    _.mapKeys(all_handlers, (handler, key) => `${action_types_prefix}${key}`),
    Immutable(initial_state)
  )

  const actions = _.mapValues(public_handlers, (handler, key) => createAction(`${action_types_prefix}${key}`))

  const private_actions = _.mapValues(private_handlers, (handler, key) => createAction(`${action_types_prefix}${key}`))

  const ACTION_TYPES = _.mapValues(all_handlers, (handler, key) => `${action_types_prefix}${key}`)

  return {
    reducer,
    actions,
    private_actions,
    ACTION_TYPES,
  }
}
