let generateColor = function(colorSet, iFactor, iterations = null)  {

  //============== GRAY SCALE

  if (colorSet == "grayScale")  {
    return [255*(1-iFactor), 255*(1-iFactor), 255*(1-iFactor)];
  }

  //============== FIRST BLUE

  if (colorSet == "blueFirst")  {
    let white = 255 * (1 - iFactor);
    let blue = 255 * iFactor;
    let red = 0;
    if (iFactor >= 0.8 && iFactor < 1)  {
      red = 255 * (iFactor - 0.8) / 0.1;
    }
    return [white - blue, white - blue - red, white - red];
  }

  //============== SATURATION COLOR FULL

  else if (colorSet == "saturationColorFull")  {
    if (iFactor > 0.999999)  {
      return [0, 0, 0];
    }
    h = 360 * iFactor;
    return hslToRgb(h, 1, 0.5);
  }

  //=============== CUSTOM GRADIENTS

  else if (colorSet == "customGradient1")  {
    if (iFactor > 0.999999)  {
      return [0, 0, 0];
    }
    return customGradient1.getColor(iFactor);
  }


  else if (colorSet == "customGradient2")  {
    if (iFactor > 0.9999999999999999)  {
      return [0, 0, 0];
    }
    return customGradient2.getColor(iterations);
  }
}


let customGradient1 = new Gradient({
  0: hslToRgb(150, 0.6, 1),
  0.2: hslToRgb(210, 0.68, 0.35),
  0.6: hslToRgb(280, 0.44, 0.54),
  0.8: hslToRgb(320, 0.86, 0.91),
  1: hslToRgb(60, 0.35, 1)
});


let customGradient2 = new Gradient({
  0: [255, 255, 255],
  90: [10, 10, 150],   //Darker blue
  100: [0, 0, 0],       //Black
  110: [10, 10, 150],    //Darker blue
  200: [255, 255, 255],  //White
  390: [30, 10, 140],   //Purple
  400: [0, 0, 0],       //Black
  410: [30, 10, 140],   //Purple
  500: [255, 255, 255], //white
  690: [160, 30, 200],  //Purple-pink
  700: [0, 0, 0],
  710: [160, 30, 200],
  800: [255, 255, 255],
  1000: [0, 0, 0]
});
