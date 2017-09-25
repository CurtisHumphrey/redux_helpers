import {
  make_simple_reducer,
  make_toggle_reducer,
  make_simple_selectors,
  make_array_based_selectors,
  make_reducer_n_actions,
} from './redux_helpers'
import * as redux_actions from 'redux-actions'

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
    let other_handlers
    let action_types_prefix
    let initial_state
    beforeEach(() => {
      initial_state = {
        a_key: false,
        b_key: false,
        different_key: 123,
      }
      public_handlers = {
        update: make_simple_reducer('a_key'),
        no_payload: (state) => state,
      }
      private_handlers = {
        from_xhr: make_simple_reducer('different_key'),
      }
      other_handlers = {
        action_from_elsewhere: make_simple_reducer('b_key'),
      }
      action_types_prefix = 'actions/'
    })
    it('should return an action "no_payload" that does not pass on the payload', () => {
      const {actions} = make_reducer_n_actions({public_handlers, action_types_prefix, initial_state, Immutable})
      expect(actions.no_payload('testing')).to.eql({
        type: 'actions/no_payload',
      })
    })
    it('should return a reducer with public_handlers made from handleActions', () => {
      const {reducer} = make_reducer_n_actions({public_handlers, action_types_prefix, initial_state, Immutable})

      expect(reducer(undefined, {})).to.eql(initial_state)
      expect(reducer(undefined, redux_actions.createAction('actions/update')(true))).to.eql({
        ...initial_state,
        a_key: true,
      })
    })
    it('should return a reducer with private_handlers made from handleActions', () => {
      const {reducer} = make_reducer_n_actions({
        public_handlers,
        private_handlers,
        action_types_prefix,
        initial_state,
        Immutable,
      })

      expect(reducer(undefined, {})).to.eql(initial_state)
      expect(reducer(undefined, redux_actions.createAction('actions/update')(true))).to.eql({
        ...initial_state,
        a_key: true,
      })
      expect(reducer(undefined, redux_actions.createAction('actions/from_xhr')(1))).to.eql({
        ...initial_state,
        different_key: 1,
      })
    })
    it('should return a reducer with other_handlers made from handleActions', () => {
      const {reducer} = make_reducer_n_actions({
        public_handlers,
        private_handlers,
        other_handlers,
        action_types_prefix,
        initial_state,
        Immutable,
      })

      expect(reducer(undefined, {})).to.eql(initial_state)
      expect(reducer(undefined, redux_actions.createAction('actions/update')(true))).to.eql({
        ...initial_state,
        a_key: true,
      })
      expect(reducer(undefined, redux_actions.createAction('actions/from_xhr')(1))).to.eql({
        ...initial_state,
        different_key: 1,
      })
      expect(reducer(undefined, redux_actions.createAction('action_from_elsewhere')(true))).to.eql({
        ...initial_state,
        b_key: true,
      })
    })
    it('should return mapped actions and private_actions', () => {
      const {actions, private_actions} = make_reducer_n_actions({
        public_handlers,
        private_handlers,
        other_handlers,
        action_types_prefix,
        initial_state,
        Immutable,
      })
      expect(actions.update('test')).to.eql(redux_actions.createAction('actions/update')('test'))
      expect(private_actions.from_xhr('test')).to.eql(redux_actions.createAction('actions/from_xhr')('test'))

      expect(actions.action_from_elsewhere).to.not.exist
      expect(private_actions.action_from_elsewhere).to.not.exist
    })
    it('should return ACTION_TYPES', () => {
      const {ACTION_TYPES} = make_reducer_n_actions({
        public_handlers,
        private_handlers,
        other_handlers,
        action_types_prefix,
        initial_state,
        Immutable,
      })
      expect(ACTION_TYPES).to.eql({
        'update': 'actions/update',
        'no_payload': 'actions/no_payload',
        'from_xhr': 'actions/from_xhr',
      })
    })
  })
})
