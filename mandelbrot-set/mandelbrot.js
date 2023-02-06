let Canvas = function() {
  this.el = document.getElementById("canvas");
  this.el.style.display = "block";
  this.ctx = this.el.getContext("2d");

  this.resize = function(width = window.innerWidth, height = window.innerHeight)  {
    this.el.width = this.width = width;
    this.el.height = this.height = height;
    this.el.style.width = width + "px";
    this.el.style.height = height + "px";
    this.mandelbrot.oneUnit = Math.min(height, width / 1.25) / 2;
  };

  this.rescale = function()  {
    this.el.classList.remove("animated");
    this.el.style.removeProperty("transform-origin");
    this.el.style.removeProperty("transform");
  }
}

let Mandelbrot = function(canvas)  {
  this.canvas = canvas;
  this.canvas.mandelbrot = this;
  this.center = {x: -0.25, y: 0};
  this.zoom = 0.5;
  this.colorSet = "customGradient2";
  this.baseIterations = 300;

  this.getGridCoords = function(x, y) {
    x = (x - this.canvas.width / 2) / this.oneUnit + this.center.x;
    y = - (y - this.canvas.height / 2) / this.oneUnit + this.center.y;
    x = this.center.x - (this.center.x - x) / this.zoom;
    y = this.center.y - (this.center.y - y) / this.zoom;
    return {x: x, y: y};
  }

  this.getPointColor = function(x, y, iterations) {
    let x0 = x;
    let y0 = y;
    let i = 1
    for (; i <= iterations; i++)  {
      newX = x*x - y*y + x0;
      newY = 2*x*y + y0;
      x = newX;
      y = newY;
      if (Math.abs(x) > 2 || Math.abs(y) > 2)  {
        break;
      }
    }
    let length = Math.sqrt(x*x + y*y);
    let iFactor = (i - 1) / (iterations - 1);
    let ni;
    if (iFactor < 1)  {
      ni = i - Math.log(Math.log(length) / Math.log(1000)) / Math.log(2);   //Skopiowane z neta
      iFactor = (ni - 1) / (iterations - 1);
    }
    return generateColor(this.colorSet, iFactor, ni);
  }

  this.drawSet = function()  {
    console.log("Zoom: "+this.zoom+"x");
    let iterations = Math.floor(this.baseIterations * Math.pow(this.zoom*this.oneUnit, 1/50));
    this.frame = new Frame(this.canvas.width, this.canvas.height);
    for (x = 0; x < this.canvas.width; x++)  {
      for (y = 0; y < this.canvas.height; y++)  {
        let gridCoords = this.getGridCoords(x, y, iterations);
        this.frame.setPixel(x, y, this.getPointColor(gridCoords.x, gridCoords.y, iterations));
      }
    }
    this.canvas.ctx.putImageData(this.frame.imageData, 0, 0);
    this.canvas.rescale();
    putGradient();
  }
};

let Frame = function(width, height)  {
  this.width = width;
  this.height = height;
  this.imageData = new ImageData(width, height);

  this.setPixel = function(x, y, [r, g, b, a = 255])  {
    let i = 4 * (y*this.width + x);
    this.imageData.data[i + 0] = r;
    this.imageData.data[i + 1] = g;
    this.imageData.data[i + 2] = b;
    this.imageData.data[i + 3] = a;
  }
}
