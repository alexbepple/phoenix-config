const getActiveSpaceIdx = () => Space.all().findIndex(x => x.isEqual(Space.active()))
const mod = (a, n) => (a+n) % n

const moveFocusedWindowFromSpaceIdxToSpaceIdx = (fromIdx, unboundedToIdx) => {
  const toIdx = mod(unboundedToIdx, Space.all().length)
  Phoenix.log(`Moving focused window ${fromIdx} → ${toIdx}`)

  const currentWindow = Window.focused()
  Space.all()[toIdx].addWindows([currentWindow])
  Space.all()[fromIdx].removeWindows([currentWindow])
  currentWindow.focus()
}

/*
> you must keep a reference to the handler, 
> otherwise your callback will not get called.
https://github.com/kasper/phoenix/blob/master/docs/API.md#getting-started
*/
const moveLeftKey = new Key('left', [ 'cmd', 'option', 'shift' ], () => {
  const spaceIdx = getActiveSpaceIdx()
  moveFocusedWindowFromSpaceIdxToSpaceIdx(spaceIdx, spaceIdx-1)
})

const moveRightKey = new Key('right', [ 'cmd', 'option', 'shift' ], () => {
  const spaceIdx = getActiveSpaceIdx()
  moveFocusedWindowFromSpaceIdxToSpaceIdx(spaceIdx, spaceIdx+1)
})


//////////////////////

const lastActivated = {}
const touch = (app) => lastActivated[app.bundleIdentifier()] = new Date()
const _getLastActivatedTsRaw = (app) => lastActivated[app.bundleIdentifier()]

const startupTs = new Date()
const getLastActivatedTs = (app) => Math.max(startupTs, _getLastActivatedTsRaw(app) || 0)
const wasAppInactiveForLongTime = app => new Date() - getLastActivatedTs(app) > 300/*s*/ * 1000

const hideAppIfUnused = app => {
  if (!app.isActive() && !app.isHidden() && wasAppInactiveForLongTime(app)) {
    app.hide()
  }
}

const rememberWhenAppLastActivated = new Event('appDidActivate', touch)

const timerThatHidesUnusedApps = Timer.every(15 /*s*/, () => {
  App.all().forEach(hideAppIfUnused)
})
