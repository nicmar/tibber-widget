// Don't change
const params = args.widgetParameter ? args.widgetParameter.split(",") : [];

// Customize here
const padding = 5
const limit1 = 1.00 // WHen price is above this, it's orange
const limit2 = 1.50 // When price is above this limit, it's red
const limit3 = 3.00
const sunLimit1 = 5.00 // When solar is above this, it's white
const sunLimit2 = 12.00 // When solar is above this limit, it's yellow
const maxPrice = 3.5 // Max price for red color
const lockScreen = config.runsInAccessoryWidget

// Add Tibber token here (Get from https://developer.tibber.com)
const tibberToken = "xxxxxxxx"

// Widget code starts here
const widget = new ListWidget();
widget.backgroundColor = new Color('#000000');
widget.setPadding(padding, padding, padding, padding);
widget.url = 'tibber://'; // Start tibber app when clicking on widget

// HEADER
const headerStack = widget.addStack()
headerStack.setPadding(0, 0, 0, 0)
headerStack.topAlignContent()


let priceObject = await getCurrentPrice();

/*
  let priceObject = {
    price: 3.45,
    hour: "20:00"
  }
  */
let price = priceObject.price.toFixed(2); // 1.35
let hour = priceObject.hour; // 20:00

// Set color based on price
//warnColor = price > limit2 ? new Color('#ff0000') :  price > limit1 ? new Color('#ff9900') :  new Color('#00ff00');

let capPrice = price > maxPrice ? maxPrice : price;
let warnHex = lerpColor("#00ff00","#ff0000",capPrice/maxPrice);
  
if (config.runsInAccessoryWidget) {
  warnHex = "#ffffff"
}

let warnColor = new Color(warnHex, 1)
  
  
// 1.30 (Separate stack to align the small "kr" correctly)
const priceStack = headerStack.addStack();

const priceText = priceStack.addText(`${price}`);
priceText.font = Font.blackRoundedSystemFont(15)
priceText.textColor = new Color(getColor(price/maxPrice),1);


// kr
const priceStack2 = headerStack.addStack();
priceStack2.setPadding(6,0,0,0)
const priceText2 = priceStack2.addText(` kr`);
priceText2.font = Font.mediumSystemFont(9)
priceText2.textColor = new Color(getColor(price/maxPrice),1);
priceText2.textOpacity = 0.6


/*
// TODO - Get max price from object "priceObject.today"
let maxToday = 2.50.toFixed(2)
// 1.30 (Separate stack to align the small "kr" correctly)
const priceStack3 = headerStack.addStack();
priceStack3.setPadding(0,10,0,0)
const priceText3 = priceStack3.addText(`(${maxToday})`);
priceText3.font = Font.blackRoundedSystemFont(15)
priceText3.textColor = new Color(getColor(price/maxPrice),1);


// kr
const priceStack4 = headerStack.addStack();
priceStack4.setPadding(6,0,0,0)
const priceText4 = priceStack4.addText(` kr`);
priceText4.font = Font.mediumSystemFont(9)
priceText4.textColor = new Color(getColor(price/maxPrice),1);
priceText4.textOpacity = 0.6
*/



/*
// Dynamic space between
headerStack.addSpacer()

// Solar
// icon
const kW = 17.2
let sunIconLabel = kW > sunLimit2 ? "sun.max.fill" : kW > sunLimit1 ? "sun.max" : "cloud"
let sunIconColor = kW > sunLimit2 ? Color.yellow() : kW > sunLimit1 ? Color.white() : Color.gray()
const sunImageStack = headerStack.addStack(); 
sunImageStack.setPadding(4, 0, 0, 2);
const sunNode = sunImageStack.addImage(getIcon(sunIconLabel,18).image);
sunNode.tintColor = sunIconColor
sunNode.imageSize = new Size(10, 10);
sunNode.leftAlignImage();

// 9.2
const sunStack = headerStack.addStack();
const sunText = sunStack.addText(`${kW.toFixed(1)}`);
sunText.font = Font.mediumSystemFont(16)
sunText.textColor = sunIconColor

const sunStack2 = headerStack.addStack();
sunStack2.setPadding(5,0,0,0)

const sunText2 = sunStack2.addText(` kW`);
sunText2.font = Font.mediumSystemFont(10)
sunText2.textColor = sunIconColor
sunText2.textOpacity = 0.5
*/

headerStack.addSpacer()

// Bulb icon
const imageStack = headerStack.addStack(); 
imageStack.setPadding(0, 0, 0, 0);
const imageNode = imageStack.addImage(getIcon("bolt.fill",18).image);
imageNode.tintColor = warnColor
imageNode.imageSize = new Size(14, 14);
imageNode.rightAlignImage();



// Bars
const width = 140
const height = 30
const spacing = 1
const cornerRadius = 5


const container = widget.addStack()
container.bottomAlignContent()
container.size = new Size(width, height)
container.layoutHorizontally()
container.spacing = spacing




for (hour = 0; hour <= 23; hour++) {
  let hourPrice = priceObject.today[hour].total

  // For testing
  //if (hour == 16) hourPrice = 5
  let value = hourPrice / maxPrice

  //log(`${hour} ${priceObject.today[hour].total}`)
  let bar = container.addStack()
  
  const d = new Date();
  let currentHour = d.getHours();
  let alpha = 0.4


  if (hour == currentHour) {
    // Current hour = Full alpha
    alpha = 1
  } else {
    // Future hours, dimmer on lockscreen due to how colors work there
    alpha = lockScreen ? 0.4 : 0.7
  }

  // Passed hours, show as very dim
  if (hour < currentHour) {
    alpha = 0.2
  }

  // Get color from green (cheap) to red (expensive) 
  let hourHex = getColor(hourPrice/maxPrice);
  //hourHex = rgb2hex(...hsl2rgb(hue,1,0.5));
  
  if (lockScreen || false) {
    hourHex = "#ffffff"
  }

  let hourColor = new Color(hourHex, alpha)
  
  bar.backgroundColor = hourColor
  bar.cornerRadius = cornerRadius
  bar.size = new Size((width-24*spacing)/24, height*value)  

}

// Numbers below graph, every 4 hours
const container2 = widget.addStack()
container2.bottomAlignContent()
container2.size = new Size(width, 10)
container2.layoutHorizontally()
container2.setPadding(0,-1,0,0)
//container2.spacing = width / 24




for (hour = 0; hour < 24; hour+=4) {  
  let b = container2.addStack()
  const h = b.addText(`${hour}`);
  //   b.setPadding(0, 0, 0, 0)
  b.size = new Size(width / 6,10)
  //b.backgroundColor = Color.red()
  h.font = Font.mediumMonospacedSystemFont(8)
  h.textColor = Color.white()
  h.textOpacity = 0.5// // 
  h.leftAlignText();
  // h.font = Font.lightRoundedSystemFont(7)
  if (hour < 24) b.addSpacer()
}


//let progressStack = await progressCircle(widget,35)
//   let b = container2.addStack()
// b.addText("23")
            
/*
  const rowStack = widget.addStack();
  rowStack.setPadding(0, 0, 0, 0);
  rowStack.layoutHorizontally();
  
  const priceStack = rowStack.addStack(); 
  const priceText = priceStack.addText(`${price} kr`);
  priceText.font = Font.mediumSystemFont(16);

  
      

  */

Script.setWidget(widget);
Script.complete();

var nextHour = new Date(Math.ceil(new Date().getTime() / 3600000) * 3600000);

log(nextHour)
widget.refreshAfterDate = nextHour

// Preview type in editor
// widget.presentSmall()// // 
widget.presentMedium()// 
// widget.presentLarge()
//widget.presentSmall();

// widget.presentAccessoryRectangular()

// NOTE - doesn't seem to work in Mac OS app, only in Beta on iOS
//widget.presentAccessoryRectangular()







async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}


/////////////////////////////////
// Api calls

async function getCurrentPrice(tokenId) {
  const url = `https://api.tibber.com/v1-beta/gql`;
  const query = `{viewer {homes {currentSubscription{priceInfo{current{total startsAt}
   today {total startsAt level }
   tomorrow {total startsAt level }
  }}}}}`;
  const req = new Request(url);
  req.method = "post";
  req.headers = { "Authorization": "Bearer " + tibberToken,      "Content-Type": "application/json"    };
  req.body = JSON.stringify({query: query})
  const res = await req.loadJSON() 
  const price = res.data.viewer.homes[0].currentSubscription.priceInfo.current.total;
  const time = res.data.viewer.homes[0].currentSubscription.priceInfo.current.startsAt;
  const today = res.data.viewer.homes[0].currentSubscription.priceInfo.today;
  const tomorrow = res.data.viewer.homes[0].currentSubscription.priceInfo.tomorrow;
  let date = new Date(time);
  let hour = date.getHours();
  return {
    price: price,
    hour: hour,
    today: today,
    tomorrow: tomorrow
  }
}




// Utility functions
function getIcon(name) {
  let font = Font.systemFont(16)
  let sym = SFSymbol.named(name)
  sym.applyFont(font)
  return sym
}


function getColor(x) {
  if (x>=1) { return "#ff0000"; } else
  if (x>=0.9) { return "#ff3300"; } else
  if (x>=0.8) { return "#ff6600"; } else
  if (x>=0.7) { return "#ff9900"; } else
  if (x>=0.6) { return "#ffCC00"; } else
  if (x>=0.5) { return "#ffFF00"; } else
  if (x>=0.4) { return "#CCFF00"; } else
  if (x>=0.3) { return "#99FF00"; } else
  if (x>=0.2) { return "#66FF00"; } else              
  if (x>=0.1) { return "#33FF00"; } else              
  return "#00ff00";
}

function lerpColor(a, b, amount) { 

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

// oneliner version
let hsl2rgb = (h,s,l, a=s*Math.min(l,1-l), f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1)) => [f(0),f(8),f(4)];

// r,g,b are in [0-1], result e.g. #0812fa.
let rgb2hex = (r,g,b) => "#" + [r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,0) ).join('');

// hexStr e.g #abcdef, result "rgb(171,205,239)"
let hexStr2rgb  = (hexStr) => `rgb(${hexStr.substr(1).match(/../g).map(x=>+`0x${x}`)})`;

// rgb - color str e.g."rgb(12,233,43)", result color hex e.g. "#0ce92b"
let rgbStrToHex= rgb=> '#'+rgb.match(/\d+/g).map(x=>(+x).toString(16).padStart(2,0)).join``
