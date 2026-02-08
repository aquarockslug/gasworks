## Coding conventions

### Factory functions vs constructors
Prefer factory functions for core types:
- `vec2(x, y)` not `new Vector2(x, y)`
- `rgb(r, g, b, a)` or `hsl(h, s, l, a)` not `new Color(...)`
- `tile(index, size)` for tile info

Use constructors for game objects and complex types:
- `new EngineObject(pos, size)`
- `new ParticleEmitter(...)`
- `new Sound(zzfxParams)`
- `new Timer(duration)`

### Naming
- `camelCase` for variables and functions
- `PascalCase` for classes
- `UPPER_CASE` for constants that are truly constant (like `PI`)

### Code style
- Use JSDoc with `@memberof` grouping (namespaces: Engine, Math, Draw, Input, Audio, Debug, Settings, etc.)
- Prefer single-line comments: `// comment`
- Use `ASSERT(condition, 'error message')` for validation (stripped in release)
- Use `LOG(...)` for debug output (stripped in release)

### Type checking
Use built-in type helpers for validation:
```javascript
isNumber(n)   // true if number and not NaN
isString(s)   // true if not null/undefined (has toString)
isArray(a)    // true if array
isVector2(v)  // true if valid Vector2
isColor(c)    // true if valid Color
```

### Global variables
- Engine time: `time`, `timeReal`, `frame`, `timeDelta`
- Camera: `cameraPos`, `cameraScale`, `cameraAngle`
- Input: `mousePos`, `mousePosScreen`, `mouseWheel`
- State: `paused`, `debug`, `debugOverlay`
- Settings are in `engineSettings.js` with corresponding setter functions

## Common patterns

### Game structure
```javascript
function gameInit() { }       // Called once after engine starts
function gameUpdate() { }     // Called every frame for game logic
function gameUpdatePost() { } // Called after physics, even when paused
function gameRender() { }     // Called before objects render
function gameRenderPost() { } // Called after objects render

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);
```

### Creating objects
```javascript
class Player extends EngineObject {
    constructor(pos) {
        super(pos, vec2(1), tile(0, 16));
        this.setCollision();
    }
    update() {
        super.update();
        // custom logic
    }
}
```

### Common drawing functions
```javascript
drawRect(pos, size, color)              // solid rectangle
drawTile(pos, size, tileInfo, color)    // sprite from tile sheet
drawText(text, pos, size, color)        // text rendering
drawLine(posA, posB, thickness, color)  // line between points
drawEllipse(pos, size, color)           // filled ellipse
```

## Common pitfalls

- **ASSERT and LOG are stripped in release builds** - Don't rely on side effects
- **Don't modify constant colors** - `WHITE`, `BLACK`, `RED`, etc. are frozen; use `.copy()` first
- **Time variables are global** - `time`, `frame` update automatically each frame
- **Fixed 60 FPS timestep** - Physics runs at 60 FPS regardless of display refresh rate
- **WebGL is enabled by default** - Set `glEnable = false` before `engineInit()` for Canvas2D only
- **Tile coordinates are bottom-left origin** - Y increases upward in world space

## Developer workflows

### Debug features
- Press `Esc` to toggle debug overlay
- Number keys toggle visualizations
- `+`/`-` keys control time scale
- Debug functions: `debugRect()`, `debugCircle()`, `debugLine()`, `debugText()`
