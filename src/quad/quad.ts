import sleep from 'sleep-promise'
import { Vector, vec } from './vector'

function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

function mapVector(vector: Vector): Vector {
  const x = map(vector.x, -1, 1, 0, 600) % 600
  const y = map(vector.y, -0.5, 1.5, 600, 0) % 600
  return vec(x < 0 ? x + 600 : x, y < 0 ? y + 600 : y)
}

class Copter {
  x = 0
  y = 0.1
  fi = 0

  vx = 0
  vy = 0
  w = 0

  ax = 0
  ay = 0
  E = 0

  m = 0.2 // kg
  width = 0.2 // m
  I = (0.2 / 3) * 0.2 * 0.2 // kg*m^2

  T1 = 0
  T2 = 0

  upd(dt) {
    const { x, y, fi, vx, vy, w, ax, ay, E, m, width, I, T1, T2 } = this

    const M = (-T1 * width) / 2 + (T2 * width) / 2
    const E_ = M / I
    const w_ = w + E_ * dt
    const fi_ = fi + w_ * dt

    const T = T1 + T2
    const G = m * 9.81
    const F = new Vector(0, T).irot(fi).iadd(new Vector(0, -G))

    const a = F.div(m)
    const v = new Vector(vx, vy).iadd(a.mul(dt))
    const p = new Vector(x, y).iadd(v.mul(dt))

    this.E = E_
    this.w = w_
    this.fi = fi_
    this.ax = a.x
    this.ay = a.y
    this.vx = v.x
    this.vy = v.y
    this.x = p.x
    this.y = p.y
  }
}

class Sim {
  ctx: CanvasRenderingContext2D
  isLooping = false
  t = 0
  copter = new Copter()

  init(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    void this.loop()

    canvas.addEventListener('mousemove', (evt) => {
      const percent = map(evt.clientX, 0, 600, 0.4, 0.6)
      const T = map(evt.clientY, 600, 0, 0, 3)
      this.copter.T1 = T * percent
      this.copter.T2 = T * (1 - percent)
    })

    window.addEventListener('keydown', (ev) => {
      switch (ev.key) {
        case 'ArrowUp':
          this.copter.y += 0.01
          break
        case 'ArrowDown':
          this.copter.y -= 0.01
          break
        case 'ArrowLeft':
          this.copter.x -= 0.01
          break
        case 'ArrowRight':
          this.copter.x += 0.01
          break

        case 'r':
          this.copter = new Copter()
          break
        case 'h':
          this.copter.T1 = 1
          break
        case 'l':
          this.copter.T2 = 1
          break
      }
    })
  }

  deinit() {
    this.isLooping = false
  }

  drawCopter(c: Copter) {
    const p = new Vector(c.x, c.y)
    const pm1 = p.add(new Vector(-c.width / 2, 0)).irot(c.fi, p)
    const pm2 = p.add(new Vector(c.width / 2, 0)).irot(c.fi, p)
    const pm1mapped = mapVector(pm1)
    const pm2mapped = mapVector(pm2)

    const { ctx } = this
    ctx.clearRect(0, 0, 600, 600)
    ctx.beginPath()
    ctx.moveTo(pm1mapped.x, pm1mapped.y)
    ctx.lineTo(pm2mapped.x, pm2mapped.y)
    ctx.stroke()
  }

  render() {
    const { ctx, t, copter } = this
    this.drawCopter(copter)
  }

  async loop() {
    if (this.isLooping) return
    this.isLooping = true

    const dt = 0.02
    while (true) {
      await sleep(dt * 1000)
      this.t += 1
      this.copter.upd(dt)
      if (this.copter.y <= 0) {
        this.copter.y = 0
        this.copter.vy = 0
      }
      this.render()
    }
  }
}

export const sim = new Sim()
