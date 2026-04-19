// biome-ignore format: sfx
const sfx = {
	walk: new Sound([2, , 459, 0.01, 0.01, 0.002, 3, 2, , , , , , , 15, 0.1, 0.22, 0.83, 0.01,]),
	lever: new Sound([, , 191, 0.02, 0.01, 0.07, 3, 3.5, , , , , 0.5, , 0.4, , 0.86, 0.01, ]),
	gas: new Sound([ 1.3, , 98, 0.03, 0.15, 0.23, 4, 1.1, 1.9, -4, , 0.01, -0.02, 1.4, 1, 0.4, 0.25, 0.41, 0.11, , 1367, ]), // Explosion 61 - Mutation 5
	victory: new Sound([ , , 595, 0.09, 0.11, 0.32, , 2.7, , , -151, 0.12, , , , , , 0.53, 0.27, ]), // Powerup 67
	mask: new Sound([ 1.1, , 796, 0.02, 0.01, 0.04, 2, 1.6, 27, -25, , , , , , 0.1, , 0.67,]), // Blip 79
};

const particleConfigs = {
	walk: {
		emitSize: 0.3,
		emitRate: 30,
		emitTime: 0.15,
		emitConeAngle: PI * 2,
		colorStartA: rgb(0.4, 0.35, 0.3, 0.5),
		colorStartB: rgb(0.3, 0.25, 0.2, 0.3),
		colorEndA: rgb(0, 0, 0, 0),
		colorEndB: rgb(0, 0, 0, 0),
		particleTime: 0.3,
		sizeStart: 0.15,
		sizeEnd: 0.05,
		speed: 0.05,
		angleSpeed: 0,
		damping: 0.98,
		angleDamping: 1,
		gravityScale: 0,
		particleConeAngle: PI,
		fadeRate: 0.5,
		randomness: 0.3,
		collideTiles: false,
		additive: false,
		randomColorLinear: true,
		renderOrder: -1,
	},
	victory: {
		emitSize: 1,
		emitRate: 200,
		emitTime: 0.5,
		emitConeAngle: PI * 2,
		colorStartA: rgb(1, 1, 0.5, 1),
		colorStartB: rgb(1, 0.5, 0, 0.8),
		colorEndA: rgb(1, 0.2, 0, 0),
		colorEndB: rgb(0.5, 0, 0, 0),
		particleTime: 0.8,
		sizeStart: 0.4,
		sizeEnd: 0.1,
		speed: 0.5,
		angleSpeed: 0.1,
		damping: 0.96,
		angleDamping: 1,
		gravityScale: -0.5,
		particleConeAngle: PI * 2,
		fadeRate: 0.2,
		randomness: 0.15,
		collideTiles: false,
		additive: true,
		randomColorLinear: true,
		renderOrder: 2,
	},
};

function emitParticle(type, pos) {
	const p = particleConfigs[type];
	if (!p) return;
	new ParticleEmitter(
		pos,
		0,
		p.emitSize,
		p.emitTime,
		p.emitRate,
		p.emitConeAngle,
		undefined,
		p.colorStartA.copy(),
		p.colorStartB.copy(),
		p.colorEndA.copy(),
		p.colorEndB.copy(),
		p.particleTime,
		p.sizeStart,
		p.sizeEnd,
		p.speed,
		p.angleSpeed,
		p.damping,
		p.angleDamping,
		p.gravityScale,
		p.particleConeAngle,
		p.fadeRate,
		p.randomness,
		p.collideTiles,
		p.additive,
		p.randomColorLinear,
		p.renderOrder,
	);
}

const MASKS = ["none", "red", "blue", "green", "yellow"];
const TILE_DATA_CACHE = {};

const getTileData = (tileIndex) => {
	if (!TILE_DATA_CACHE[tileIndex])
		TILE_DATA_CACHE[tileIndex] = new TileLayerData(tileIndex);
	return TILE_DATA_CACHE[tileIndex];
};

const cloud = (color, corner1, corner2) => {
	const g = (x, y, index) => ({
		x,
		y,
		value: { color, tile: gas(color, index), animSpeed: 4, frames: 4 },
	});

	const corners = [
		g(corner1.x, corner1.y, 0),
		g(corner2.x, corner2.y, 8),
		g(corner1.x, corner2.y, 6),
		g(corner2.x, corner1.y, 2),
	];

	const width = corner2.x - corner1.x - 1;
	const height = corner1.y - corner2.y - 1;

	const top = Array.from({ length: width }, (_, i) =>
		g(corner1.x + 1 + i, corner1.y, 1),
	);
	const bottom = Array.from({ length: width }, (_, i) =>
		g(corner1.x + 1 + i, corner2.y, 7),
	);
	const left = Array.from({ length: height }, (_, i) =>
		g(corner1.x, corner2.y + 1 + i, 3),
	);
	const right = Array.from({ length: height }, (_, i) =>
		g(corner2.x, corner2.y + 1 + i, 5),
	);
	const center = Array.from({ length: height }, (_, y) =>
		Array.from({ length: width }, (_, x) =>
			g(corner1.x + 1 + x, corner2.y + 1 + y, 4),
		),
	).flat();

	return [...corners, ...top, ...left, ...right, ...bottom, ...center];
};

function pipeSection(x, y, length, direction = "horizontal") {
	if (length <= 0) return [];

	const straightValue =
		direction === "horizontal"
			? PIPE_TILES.STRAIGHT_HORIZONTAL
			: PIPE_TILES.STRAIGHT_VERTICAL;
	const bandValue =
		direction === "horizontal"
			? PIPE_TILES.STRAIGHT_HORIZONTAL_BAND
			: PIPE_TILES.STRAIGHT_VERTICAL_BAND;

	return Array.from({ length }, (_, i) => {
		const isBand = (i === 0 || i === length - 1) && length > 1;
		const value = isBand ? bandValue : straightValue;
		return {
			x: direction === "horizontal" ? x + i : x,
			y: direction === "horizontal" ? y : y + i,
			value,
		};
	});
}

const CORNER_LOOKUP = {
	"h-right-down": PIPE_TILES.CORNER_BOTTOM_RIGHT,
	"h-right-up": PIPE_TILES.CORNER_TOP_RIGHT,
	"h-left-down": PIPE_TILES.CORNER_BOTTOM_LEFT,
	"h-left-up": PIPE_TILES.CORNER_TOP_LEFT,
	"v-down-right": PIPE_TILES.CORNER_TOP_LEFT,
	"v-down-left": PIPE_TILES.CORNER_TOP_RIGHT,
	"v-up-right": PIPE_TILES.CORNER_BOTTOM_LEFT,
	"v-up-left": PIPE_TILES.CORNER_BOTTOM_RIGHT,
};

function pipeLine(coordinates) {
	if (coordinates.length < 2) return [];

	const pipeline = [];

	for (let i = 0; i < coordinates.length - 1; i++) {
		const start = coordinates[i];
		const end = coordinates[i + 1];

		if (start.x === end.x) {
			const length = Math.abs(end.y - start.y);
			const startY = Math.min(start.y, end.y);
			pipeline.push(pipeSection(start.x, startY, length, "vertical"));
		} else if (start.y === end.y) {
			const length = Math.abs(end.x - start.x);
			const startX = Math.min(start.x, end.x);
			pipeline.push(pipeSection(startX, start.y, length, "horizontal"));
		}
	}

	for (let i = 1; i < coordinates.length - 1; i++) {
		const prev = coordinates[i - 1];
		const curr = coordinates[i];
		const next = coordinates[i + 1];

		let cornerKey = null;

		if (prev.y === curr.y && curr.x === next.x) {
			const hDir = prev.x < curr.x ? "right" : "left";
			const vDir = next.y > curr.y ? "down" : "up";
			cornerKey = `h-${hDir}-${vDir}`;
		} else if (prev.x === curr.x && curr.y === next.y) {
			const vDir = prev.y < curr.y ? "down" : "up";
			const hDir = next.x > curr.x ? "right" : "left";
			cornerKey = `v-${vDir}-${hDir}`;
		}

		if (cornerKey) {
			pipeline.push({ x: curr.x, y: curr.y, value: CORNER_LOOKUP[cornerKey] });
		}
	}

	return pipeline.flat();
}

const tvShader = `
// Simple TV Shader Code
float hash(vec2 p)
{
    p=fract(p*.3197);
    return fract(1.+sin(51.*p.x+73.*p.y)*13753.3);
}

void mainImage(out vec4 c, vec2 p)
{
    // setup the shader
    vec2 uv = p;
    p /= iResolution.xy;
    c = texture(iChannel0, p);

    // static noise
    const float staticAlpha = .1;
    const float staticScale = .002;
    c += staticAlpha * hash(floor(p/staticScale) + mod(iTime*500., 1e3));

    {
        // bloom effect
        const float blurSize = .002;
        const float bloomIntensity = .1;

        // 5-tap Gaussian blur
        vec4 bloom = vec4(0);
        bloom += texture(iChannel0, p + vec2(-2.*blurSize, 0)) * .12;
        bloom += texture(iChannel0, p + vec2(   -blurSize, 0)) * .24;
        bloom += texture(iChannel0, p)                         * .28;
        bloom += texture(iChannel0, p + vec2(    blurSize, 0)) * .24;
        bloom += texture(iChannel0, p + vec2( 2.*blurSize, 0)) * .12;
        bloom += texture(iChannel0, p + vec2(0, -2.*blurSize)) * .12;
        bloom += texture(iChannel0, p + vec2(0,    -blurSize)) * .24;
        bloom += texture(iChannel0, p)                         * .28;
        bloom += texture(iChannel0, p + vec2(0,     blurSize)) * .24;
        bloom += texture(iChannel0, p + vec2(0,  2.*blurSize)) * .12;
        c += bloom * bloomIntensity;
    }

    // black vignette around edges
    const float vignette = 2.;
    const float vignettePow = 6.;
    float dx = 2.*p.x-1., dy = 2.*p.y-1.;
    c *= 1.-pow((dx*dx + dy*dy)/vignette, vignettePow);
}`;

const gasShader = `
float cloudDensity = 1.0; 	// overall density [0,1]
float noisiness = 1.0; 	// overall strength of the noise effect [0,1]
float speed = 0.1;			// controls the animation speed [0, 0.1 ish)
float cloudHeight = 0.9; 	// (inverse) height of the input gradient [0,...)


// Simplex noise below = ctrl+c, ctrl+v:
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

/// Cloud stuff:
const float maximum = 1.0/1.0 + 1.0/2.0 + 1.0/3.0 + 1.0/4.0 + 1.0/5.0 + 1.0/6.0 + 1.0/7.0 + 1.0/8.0;
// Fractal Brownian motion, or something that passes for it anyway: range [-1, 1]
float fBm(vec3 uv)
{
    float sum = 0.0;
    for (int i = 0; i < 8; ++i) {
        float f = float(i+1);
        sum += snoise(uv*f) / f;
    }
    return sum / maximum;
}

// Simple vertical gradient:
float gradient(vec2 uv) {
 	return (1.0 - uv.y * uv.y * cloudHeight);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec3 p = vec3(uv, iTime*speed);
    vec3 someRandomOffset = vec3(0.1, 0.3, 0.2);
    vec2 duv = vec2(fBm(p), fBm(p + someRandomOffset)) * noisiness;
    float q = gradient(uv + duv) * cloudDensity;
	fragColor = texture(iChannel0, uv) * q;
}
`;
