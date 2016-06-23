# redux_helpers
helping function for simplified redux pattern

# Approach
* redux actions follow createAction approach and generally do no work
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
```
{
  "main":"./user_info.js"
}
```

### info.js
Purpose: used to merge simple and thunks together
```
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
