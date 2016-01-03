'use strict';
/****
 * Hear me out Bro! We're not aiming for perfection here, just trying to have the search
 * input be focused on load for the majority of desktop browsers. It's no big deal
 * if a few tablets/mobile devices have the input focused on load too. The user may
 * not be used to seeing the curser flashing in the search box without them
 * tapping on it, but it wont be overly distracting right?...RIGHT?!!
 *
 * Note: some Android devices report as Linux
 * If the user is using a linux laptop with touch enabled it will be caught by this.
 * And prolly others, but like I said, not trying for perfection here.
 */
var checkIfTouchDevice = (window) => {
  return ('ontouchstart' in window) && /iPad|iPhone|iPod|Android|IEMobile|BlackBerry|Linux/.test(navigator.platform)
}
/****
 * Exports
 */
export { checkIfTouchDevice }