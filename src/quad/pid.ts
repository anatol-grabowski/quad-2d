function clamp(value: number, min: number, max: number) {
  if (value < min) return min
  if (value > max) return max
  return value
}

export class Pid {
  /** The error between the setpoint and the measured output. */
  e: number = 0
  /** The change in error between consecutive control steps. */
  dedt: number = 0
  /** The proportionality term. */
  p: number = 0
  /** The integral term. */
  i: number = 0
  /** The derivative term. */
  d: number = 0
  /** The proportional gain. */
  kp: number = 0
  /** The integral gain. */
  ki: number = 0
  /** The derivative gain. */
  kd: number = 0
  rmin = -Infinity
  rmax = +Infinity

  /**
   * Constructs a new Pid instance.
   * @param kp The proportional gain.
   * @param ki The integral gain.
   * @param kd The derivative gain.
   */
  constructor(kp: number, ki: number, kd: number, rmin = -Infinity, rmax = +Infinity) {
    this.tune(kp, ki, kd)
    this.rmin = rmin
    this.rmax = rmax
  }

  /**
   * Changes the gains of the controller.
   * @param kp The proportional gain.
   * @param ki The integral gain.
   * @param kd The derivative gain.
   */
  tune(kp: number, ki: number, kd: number): void {
    this.kp = kp
    this.ki = ki
    this.kd = kd
  }

  /**
   * Calculates the control signal.
   * @param sp The setpoint.
   * @param y The measured output.
   * @param dt The elapsed time.
   * @returns The control signal.
   */
  regulate(sp: number, y: number, dt: number): number {
    const { kp, ki, kd, e: e_prev } = this
    let i = this.i

    const e = sp - y
    const dedt = (e - e_prev) / dt
    const p = kp * e
    i = clamp(i + ki * e * dt, this.rmin, this.rmax)
    const d = kd * dedt
    const r = p + i + d

    this.e = e
    this.dedt = dedt
    this.p = p
    this.i = i
    this.d = d
    return clamp(r, this.rmin, this.rmax)
  }
}
