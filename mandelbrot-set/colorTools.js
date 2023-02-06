let hslToRgb = function(h, s, l)  {
  h = h >= 360 ? 0 : Math.max(0, h);
  s = Math.min(Math.max(0, s), 1);
  l = Math.min(Math.max(0, l), 1);
  let c = (1 - Math.abs(2*l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c/2;

  if (h < 60)
    [r, g, b] = [c, x, 0];
  else if (h < 120)
    [r, g, b] = [x, c, 0];
  else if (h < 180)
    [r, g, b] = [0, c, x];
  else if (h < 240)
    [r, g, b] = [0, x, c];
  else if (h < 300)
    [r, g, b] = [x, 0, c];
  else if (h < 360)
    [r, g, b] = [c, 0, x];

  return [
    Math.round( (r+m)*255 ),
    Math.round( (g+m)*255 ),
    Math.round( (b+m)*255 )
  ];
}

let Gradient = function(points)  {
  this.points = [];
  Object.keys(points).forEach(function(key)  {
    this.points.push([parseFloat(key), points[key]]);
  }.bind(this));
  this.points.sort((a, b) => a[0] - b[0])

  this.getColor = function(point)  {
    point = Math.min(Math.max(this.points[0][0], point), this.points[this.points.length - 1][0]);

    let leftIndex = this.points.findIndex((p, key, arr) => arr[key][0] <= point && arr[key + 1][0] >= point);
    let lPoint = this.points[leftIndex],
        rPoint = this.points[leftIndex+1],
        offset = (point - lPoint[0]) / (rPoint[0] - lPoint[0]);
    let h = lPoint[1][0] + (rPoint[1][0] - lPoint[1][0]) * offset,
        s = lPoint[1][1] + (rPoint[1][1] - lPoint[1][1]) * offset,
        l = lPoint[1][2] + (rPoint[1][2] - lPoint[1][2]) * offset;
    return [h, s, l];
  }
}
