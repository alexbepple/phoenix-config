const getActiveSpaceIdx = () => Space.all().findIndex(x => x.isEqual(Space.active()))
const mod = (a, n) => (a+n) % n

const moveFocusedWindowFromSpaceIdxToSpaceIdx = (unboundedToIdx) => {
  const toIdx = mod(unboundedToIdx, Space.all().length)
  Phoenix.log(`Moving focused window to space ${toIdx}`)

  const currentWindow = Window.focused()
  Space.all()[toIdx].moveWindows([currentWindow])
  currentWindow.focus()
}

/*
> you must keep a reference to the handler, 
> otherwise your callback will not get called.
https://github.com/kasper/phoenix/blob/master/docs/API.md#getting-started
*/
const moveLeftKey = new Key('left', [ 'cmd', 'option', 'shift' ], () => {
  moveFocusedWindowFromSpaceIdxToSpaceIdx(getActiveSpaceIdx() - 1)
})

const moveRightKey = new Key('right', [ 'cmd', 'option', 'shift' ], () => {
  moveFocusedWindowFromSpaceIdxToSpaceIdx(getActiveSpaceIdx() + 1)
})


//////////////////////

const lastActivated = {}
const touch = (app) => lastActivated[app.bundleIdentifier()] = new Date()
const _getLastActivatedTsRaw = (app) => lastActivated[app.bundleIdentifier()]

const startupTs = new Date()
const getLastActivatedTs = (app) => _getLastActivatedTsRaw(app) || startupTs
const wasAppInactiveForLongTime = app => new Date() - getLastActivatedTs(app) > 300/*s*/ * 1000

const hideAppIfUnused = app => {
  if (!app.isActive() && !app.isHidden() && wasAppInactiveForLongTime(app)) {
    app.hide()
  }
}

const touchActivatedApp = new Event('appDidActivate', touch)

/* Avoid it disappearing immediately after switching away. */
const touchActiveApp = Timer.every(15 /*s*/, () => touch(App.focused()))

const hideUnusedApps = Timer.every(15 /*s*/, () => App.all().forEach(hideAppIfUnused))
