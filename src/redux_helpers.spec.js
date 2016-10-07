import {
  make_simple_reducer,
  make_toggle_reducer,
  make_simple_selectors,
  make_array_based_selectors,
  make_reducer_n_actions,
} from './redux_helpers'
import * as redux_actions from 'redux-actions'
import _ from 'lodash'

import Immutable from 'seamless-immutable'

describe('redux_helpers', () => {
  let sandbox
  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })
  afterEach(() => {
    sandbox.restore()
  })
  it('make_simple_reducer should return a function that sets the payload at key', () => {
    const state = Immutable({
      a_key: false,
    })
    const simple = make_simple_reducer('a_key')
    expect(simple).to.be.a('function')

    const new_state = simple(state, {payload: true})

    expect(new_state.a_key, 'new state').to.be.eql(true)
    expect(state.a_key, 'old state does not change').to.be.eql(false)
  })
  it('make_toggle_reducer should return a function that set the opposite of a_key', () => {
    const state = Immutable({
      a_key: false,
    })
    const toggle = make_toggle_reducer('a_key')
    expect(toggle).to.be.a('function')

    const new_state = toggle(state)

    expect(new_state.a_key, 'new state').to.be.eql(true)
    expect(state.a_key, 'old state does not change').to.be.eql(false)
  })
  it('make_simple_selectors should return an object with each key = a selector', () => {
    const state = Immutable({
      a_key: false,
      different_key: 123,
    })
    const selectors = make_simple_selectors(state, 'BASE')
    expect(selectors.a_key({BASE:state})).to.eql(false)
    expect(selectors.different_key({BASE:state})).to.eql(state.different_key)
  })
  it('make_array_based_selectors should return an object with each key = a selector', () => {
    const parts = Immutable({
      a_key: false,
      different_key: 123,
    })
    const full_state = Immutable({
      array: [{
        a_key: true,
        different_key: 456,
      }],
    })
    const array_selector = (state) => state.BASE.array
    const selectors = make_array_based_selectors(parts, array_selector, 'index')
    // when exists
    expect(selectors.a_key({BASE:full_state}, {index:0})).to.eql(true)
    expect(selectors.different_key({BASE:full_state}, {index:0})).to.eql(full_state.array[0].different_key)
    // defaults
    expect(selectors.a_key({BASE:full_state}, {index:1})).to.eql(false)
    expect(selectors.different_key({BASE:full_state}, {index:1})).to.eql(parts.different_key)
  })
  describe('make_reducer_n_actions', () => {
    let public_handlers
    let private_handlers
    let action_types_prefix
    let initial_state
    beforeEach(() => {
      initial_state = {
        a_key: false,
        different_key: 123,
      }
      public_handlers = {
        reset: () => Immutable(initial_state),
        update: make_simple_reducer('a_key'),
      }
      private_handlers = {
        from_xhr: make_simple_reducer('different_key'),
      }
      action_types_prefix = 'actions/'
    })
    xit('should return a reducer with public_handlers made from handleActions', () => {
      sandbox.stub(redux_actions, 'handleActions')
      make_reducer_n_actions({public_handlers, action_types_prefix, initial_state, Immutable})

      const mapped_reducers = _.mapKeys(public_handlers, (handler, key) => `${action_types_prefix}${key}`)
      expect(redux_actions.handleActions)
        .to.be.calledWith(mapped_reducers, Immutable(initial_state))
    })
    xit('should return a reducer with private_handlers made from handleActions', () => {
      sandbox.stub(redux_actions, 'handleActions')
      make_reducer_n_actions({public_handlers, private_handlers, action_types_prefix, initial_state, Immutable})

      const mapped_reducers = _.mapKeys(
        {...public_handlers, ...private_handlers},
        (handler, key) => `${action_types_prefix}${key}`
      )
      expect(redux_actions.handleActions)
        .to.be.calledWith(mapped_reducers, Immutable(initial_state))
    })
    it('should return mapped actions and private_actions', () => {
      const {actions, private_actions} = make_reducer_n_actions(
        {public_handlers, private_handlers, action_types_prefix, initial_state, Immutable}
      )
      expect(actions.reset('test')).to.eql(redux_actions.createAction('actions/reset')('test'))
      expect(actions.update('test')).to.eql(redux_actions.createAction('actions/update')('test'))

      expect(private_actions.from_xhr('test')).to.eql(redux_actions.createAction('actions/from_xhr')('test'))
    })
    it('should return ACTION_TYPES', () => {
      const {ACTION_TYPES} = make_reducer_n_actions(
        {public_handlers, private_handlers, action_types_prefix, initial_state, Immutable}
      )
      expect(ACTION_TYPES).to.eql({
        'reset': 'actions/reset',
        'update': 'actions/update',
        'from_xhr': 'actions/from_xhr',
      })
    })
  })
})
