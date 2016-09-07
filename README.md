# redux_helpers
helping function for simplified redux pattern

# Approach
* redux actions follow createAction pattern and do not work (no transformations)
* actions are devided into public and private with private ones use only in other public ones (e.g., thunks)
* ACTION_TYPES are exported because they may be used in other listeners e.g., event recorders
* state is not directly used but exposed via selectors - see createSelectors
* complicated actions (async or sequences) are handled via thunks

This is typically how redux_helpers are used

## redux files for a reducer topic
- info/ - Folder
  - package.json - used to allow import via the folder name e.g., import 'info'
  - info.js - used to merge simple and thunks together
  - info_simple.js - has initial_state, selectors, normal redux actions, and reducer
  - info_thunks.js - has all async or sequence actions (called a normal action from simple to make state changes)
  - info.specs.js - all your tests

### package.json
Purpose: used to allow import via the folder name e.g., import 'info'
```json
{
  "main":"./user_info.js"
}
```

### info.js
Purpose: used to merge simple and thunks together
```jsx
import reducer, {
  actions as simple_actions,
  private_actions,
  selectors,
  BASE_SELECTOR_PATH,
  ACTION_TYPES,
} from './info_simple'
import * as thunk_actions from './info_thunks'

export const actions = Object.assign({}, simple_actions, thunk_actions)

export default reducer
export {
  selectors,
  BASE_SELECTOR_PATH,
  ACTION_TYPES,
  private_actions,
}
```

### info_simple.js
Purpose: for all sync actions, selectors, and reducer
```jsx
import {
  make_simple_selectors,
  make_simple_reducer,
  make_reducer_n_actions,
} from 'redux_helpers'

// -------
// Initial State
// --------

const initial_state = {
  info: {},
}

// -------
// Selectors
// --------
const BASE = 'info'
export {BASE as BASE_SELECTOR_PATH}

const simple_selectors = make_simple_selectors(initial_state, BASE)

export const selectors = {
  ...simple_selectors,
}

// ------------------------------------
// Reducer and Actions
// ------------------------------------

const action_types_prefix = 'info/'
const public_handlers = {
  reset: () => Immutable(initial_state),
  // <event_name>: (state, {payload}) => /*new*/ state
}
const private_handlers = {
  set_info: make_simple_reducer('info'),
  // <event_name>: (state, {payload}) => /*new*/ state
}

export const {reducer, private_actions, actions, ACTION_TYPES} = make_reducer_n_actions({
  public_handlers,
  private_handlers,
  action_types_prefix,
  initial_state,
  Immutable,
})
export default reducer
```

### info_thunks.js
Purpose: for all async actions
```jsx
import {
  actions as simple_actions,
  private_actions,
  selectors,
} from './info_simple'

export get_info = () => (dispatch, getState) => {
  dispatch(simple_actions.reset())
  window.fetch('/some_api')
  .then((response) => response.json())
  .then((data) => dispatch(private_actions.set_info(data)))
  .catch(console.error)
}
```
