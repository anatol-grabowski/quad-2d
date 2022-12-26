//ixj=1 => ccw/left rotation - '+', right handed system
export class Vector {
  constructor(public x: number = 0, public y: number = 0) {}

  static tripleProduct(a, b, c) {
    return b.mul(c.dot(a)).sub(a.mul(c.dot(b)))
  }

  toString() {
    return '[' + this.x + ', ' + this.y + ']'
  }

  toArray() {
    return [this.x, this.y]
  }

  //======================================== result isn't a vector
  lengthSq(v) {
    if (!v) return this.x * this.x + this.y * this.y
    return this.sub(v).lengthSq()
  }
  length(v) {
    return Math.sqrt(this.lengthSq(v))
  }
  angle(v) {
    if (v) return this.angle() - v.angle()
    if (this.x < 0 && this.y > 0) return Math.PI + Math.atan(this.y / this.x)
    if (this.x < 0 && this.y < 0) return -Math.PI + Math.atan(this.y / this.x)
    if (this.y == 0 && this.x < 0) return Math.PI
    return Math.atan(this.y / this.x)
  }
  angleDegr(v) {
    return (this.angle(v) * 180) / Math.PI
  }
  dot(v) {
    return this.x * v.x + this.y * v.y
  }
  cross(v) {
    if (typeof v == 'number') {
      //don't know what that means
      return new Vector(-v * this.y, v * this.x) //was used in tutorial on collision detection
    }
    return this.x * v.y - this.y * v.x
  }
  side(vStart, vEnd) {
    //test if 'this' point lies on the left (>0) or on the right (<0) side of vStart to vEnd vector
    var v = vStart.to(vEnd)
    var p = vStart.to(this)
    return v.cross(p)
  }

  //========================================= 'i*' - in-place methods
  set(x, y) {
    /*don't change x or y if undefined or null passed*/
    if (typeof x != 'number' && x != null) {
      this.x = x.x
      this.y = x.y
      return this
    }
    if (x != null) this.x = x
    if (y != null) this.y = y
    return this
  }

  inorm() {
    this.idiv(this.length())
    return this
  }
  imul(n) {
    this.x *= n
    this.y *= n
    return this
  }
  idiv(n) {
    this.x /= n
    this.y /= n
    return this
  }
  iadd(v) {
    this.x += v.x
    this.y += v.y
    return this
  }
  isub(v) {
    this.x -= v.x
    this.y -= v.y
    return this
  }
  ito(v) {
    /*get direction from 'this' to 'v'*/
    this.x = v.x - this.x
    this.y = v.y - this.y
    return this
  }
  irot(angle, p0?) {
    /*rotate around p0 || O*/
    if (p0) this.isub(p0)
    var x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
    var y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
    this.set(x, y)
    if (p0) this.iadd(p0)
    return this
  }
  irotDegr(angle, p0) {
    return this.irot((angle / 180) * Math.PI, p0)
  }
  iproj(p1, p2) {
    /*project on p1 to p2 line*/
    if (!p2) {
      var angle = p1.angle()
      this.irot(-angle).set(null, 0).irot(angle)
      return this
    }
    this.isub(p1)
    var angle = p1.to(p2).angle()
    this.irot(-angle).set(null, 0).irot(angle)
    this.iadd(p1)
    return this
  }
  iperp(vStart, vEnd) {
    if (!vStart) return this.irot(Math.PI / 2)
    var v = vStart.to(vEnd)
    var p = vStart.to(this)
    return p
      .mul(v.dot(v))
      .sub(v.mul(v.dot(p)))
      .ineg()
  }

  //=========================================
  clone() {
    return new Vector(this.x, this.y)
  }

  norm() {
    return this.clone().inorm()
  }
  mul(n) {
    return this.clone().imul(n)
  }
  div(n) {
    return this.clone().idiv(n)
  }
  add(v) {
    return this.clone().iadd(v)
  }
  sub(v) {
    return this.clone().isub(v)
  }
  to(v) {
    return this.clone().ito(v)
  }
  rot(angle, p0) {
    return this.clone().irot(angle, p0)
  }
  rotDegr(angle, p0) {
    return this.clone().irotDegr(angle, p0)
  }
  proj(p1, p2) {
    return this.clone().iproj(p1, p2)
  }
  perp(vStart, vEnd) {
    return this.clone().iperp(vStart, vEnd)
  }
}

function vec(arr: [x: number, y: number]): Vector
function vec(x: number, y: number): Vector
function vec(x: number | [x: number, y: number], y?: number) {
  if (Array.isArray(x)) {
    return new Vector(...x)
  }
  return new Vector(x, y)
}
export { vec }
