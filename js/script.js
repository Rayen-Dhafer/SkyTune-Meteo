 
var container = $('.container');
var card = $('#card');
var innerSVG = Snap('#inner');
var outerSVG = Snap('#outer');
var backSVG = Snap('#back');
var summary = $('#summary');
var date = $('#date');
var weatherContainer1 = Snap.select('#layer1');
var weatherContainer2 = Snap.select('#layer2');
var weatherContainer3 = Snap.select('#layer3');
var innerRainHolder1 = weatherContainer1.group();
var innerRainHolder2 = weatherContainer2.group();
var innerRainHolder3 = weatherContainer3.group();
var innerLeafHolder = weatherContainer1.group();
var innerSnowHolder = weatherContainer1.group();
var innerLightningHolder = weatherContainer1.group();
var leafMask = outerSVG.rect();
var leaf = Snap.select('#leaf');
var sun = Snap.select('#sun');
var sunburst = Snap.select('#sunburst');
var outerSplashHolder = outerSVG.group();
var outerLeafHolder = outerSVG.group();
var outerSnowHolder = outerSVG.group();

var lightningTimeout;

 
outerLeafHolder.attr({
	'clip-path': leafMask
});

 
var sizes = {
	container: {width: 0, height: 0},
	card: {width: 0, height: 0}
}

 
var clouds = [
	{group: Snap.select('#cloud1')},
	{group: Snap.select('#cloud2')},
	{group: Snap.select('#cloud3')}
]

 
var weather = [
	{ type: 'snow', name: 'Snow'}, 
	{ type: 'wind', name: 'Windy'}, 
	{ type: 'rain', name: 'Rain'}, 
	{ type: 'thunder', name: 'Storms'},
	{ type: 'sun', name: 'Sunny'}
];

 

var settings = {
	windSpeed: 2,
	rainCount: 0,
	leafCount: 0,
	snowCount: 0,
	cloudHeight: 100,
	cloudSpace: 30,
	cloudArch: 50,
	renewCheck: 10,
	splashBounce: 80
};

var tickCount = 0;
var rain = [];
var leafs = [];
var snow = [];

 
init();

 
$(window).resize(onResize);

 
requestAnimationFrame(tick);

function init()
{
	onResize();
	
 	
	for(var i = 0; i < weather.length; i++)
	{
		var w = weather[i];
		var b = $('#button-' + w.type);
		w.button = b;
		b.bind('click', w, changeWeather);
	}
	
 	
	for(var i = 0; i < clouds.length; i++)
	{
		clouds[i].offset = Math.random() * sizes.card.width;
		drawCloud(clouds[i], i);
	}
	
 	
	TweenMax.set(sunburst.node, {opacity: 0})
	changeWeather(weather[0]);
}

function onResize()
{
 	
	sizes.container.width = container.width();
	sizes.container.height = container.height();
	sizes.card.width = card.width();
	sizes.card.height = card.height();
	sizes.card.offset = card.offset();
	
 	
	innerSVG.attr({
		width: sizes.card.width,
		height: sizes.card.height
	})
	
	outerSVG.attr({
		width: sizes.container.width,
		height: sizes.container.height
	})	
	
	backSVG.attr({
		width: sizes.container.width,
		height: sizes.container.height
	})
	
	TweenMax.set(sunburst.node, {transformOrigin:"50% 50%", x: sizes.container.width / 2, y: (sizes.card.height/8) + sizes.card.offset.top});
	TweenMax.fromTo(sunburst.node, 20, {rotation: 0}, {rotation: 360, repeat: -1, ease: Power0.easeInOut})
 
	
	leafMask.attr({x: sizes.card.offset.left, y: 0, width: sizes.container.width - sizes.card.offset.left,  height: sizes.container.height});
}

function drawCloud(cloud, i)
{
 
	
	var space  = settings.cloudSpace * i;
	var height = space + settings.cloudHeight;
	var arch = height + settings.cloudArch + (Math.random() * settings.cloudArch);
	var width = sizes.card.width;
	
	var points = [];
	points.push('M' + [-(width), 0].join(','));
	points.push([width, 0].join(','));
	points.push('Q' + [width * 2, height / 2].join(','));
	points.push([width, height].join(','));
	points.push('Q' + [width * 0.5, arch].join(','));
	points.push([0, height].join(','));
	points.push('Q' + [width * -0.5, arch].join(','));
	points.push([-width, height].join(','));
	points.push('Q' + [- (width * 2), height/2].join(','));
	points.push([-(width), 0].join(','));
	
	var path = points.join(' ');
	if(!cloud.path) cloud.path = cloud.group.path();
	cloud.path.animate({
  		d: path
	}, 0)
}

function makeRain()
{
 
	
	var lineWidth = Math.random() * 3;
	
 	
	var lineLength = currentWeather.type == 'thunder' ? 35 : 14;
	
 
	var x = Math.random() * (sizes.card.width - 40) + 20;
	
 	
	var line = this['innerRainHolder' + (3 - Math.floor(lineWidth))].path('M0,0 0,' + lineLength).attr({
		fill: 'none',
		stroke: currentWeather.type == 'thunder' ? '#777' : '#0000ff',
		strokeWidth: lineWidth
	});
	
 
	
	rain.push(line);
	
 
	
	TweenMax.fromTo(line.node, 1, {x: x, y: 0- lineLength}, {delay: Math.random(), y: sizes.card.height, ease: Power2.easeIn, onComplete: onRainEnd, onCompleteParams: [line, lineWidth, x, currentWeather.type]});
}

function onRainEnd(line, width, x, type)
{
 	
	line.remove();
	line = null;
	
 	
	for(var i in rain)
	{
		if(!rain[i].paper) rain.splice(i, 1);
	}
	
 
	
	if(rain.length < settings.rainCount)
	{
		makeRain();
		if(width > 2) makeSplash(x, type);
	}
}

function makeSplash(x, type)
{
 
	var splashLength = type == 'thunder' ? 30 : 20;
	
 
	var splashBounce = type == 'thunder' ? 120 : 100;
	
 	var splashDistance = 80;
 
	var speed = type == 'thunder' ? 0.7 : 0.5;
	
 	var splashUp = 0 - (Math.random() * splashBounce);
	
 	var randomX = ((Math.random() * splashDistance) - (splashDistance / 2));
	
 	
	var points = [];
	points.push('M' + 0 + ',' + 0);
    points.push('Q' + randomX + ',' + splashUp);
    points.push((randomX * 2) + ',' + splashDistance);
	
 	
	var splash = outerSplashHolder.path(points.join(' ')).attr({
      	fill: "none",
      	stroke: type == 'thunder' ? '#777' : '#0000ff',
      	strokeWidth: 1
    });
	
 	
	var pathLength = Snap.path.getTotalLength(splash);
	var xOffset = sizes.card.offset.left; 
	var yOffset = sizes.card.offset.top + sizes.card.height; 
    splash.node.style.strokeDasharray = splashLength + ' ' + pathLength;
	
 	TweenMax.fromTo(splash.node, speed, {strokeWidth: 2, y: yOffset, x: xOffset + 20 + x, opacity: 1, strokeDashoffset: splashLength}, {strokeWidth: 0, strokeDashoffset: - pathLength, opacity: 1, onComplete: onSplashComplete, onCompleteParams: [splash], ease:  SlowMo.ease.config(0.4, 0.1, false)})
}

function onSplashComplete(splash)
{
 	
	splash.remove();
	splash = null;
}

function makeLeaf()
{    
	var scale = 0.5 + (Math.random() * 0.5);
	var newLeaf;
	
	var areaY = sizes.card.height/2;
	var y = areaY + (Math.random() * areaY);
	var endY = y - ((Math.random() * (areaY * 2)) - areaY)
	var x;
	var endX;
	var colors = ['#76993E', '#4A5E23', '#6D632F'];
	var color = colors[Math.floor(Math.random() * colors.length)];
	var xBezier;
	
	if(scale > 0.8)
	{
		newLeaf = leaf.clone().appendTo(outerLeafHolder)
		.attr({
			fill: color
		})
		y = y + sizes.card.offset.top / 2;
		endY = endY + sizes.card.offset.top / 2;
		
		x = sizes.card.offset.left - 100;
		xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
		endX = sizes.container.width + 50;
	}
	else 
	{
		newLeaf = leaf.clone().appendTo(innerLeafHolder)
		.attr({
			fill: color
		})
		x = -100;
		xBezier = sizes.card.width / 2;
		endX = sizes.card.width + 50;
		
	}
	
	leafs.push(newLeaf);
	 
	
	var bezier = [{x:x, y:y}, {x: xBezier, y:(Math.random() * endY) + (endY / 3)}, {x: endX, y:endY}]
	TweenMax.fromTo(newLeaf.node, 2, {rotation: Math.random()* 180, x: x, y: y, scale:scale}, {rotation: Math.random()* 360, bezier: bezier, onComplete: onLeafEnd, onCompleteParams: [newLeaf], ease: Power0.easeIn})
}

function onLeafEnd(leaf)
{
	leaf.remove();
	leaf = null;
	
	for(var i in leafs)
	{
		if(!leafs[i].paper) leafs.splice(i, 1);
	}
	
	if(leafs.length < settings.leafCount)
	{
		makeLeaf();
	}
}

function makeSnow()
{
	var scale = 0.5 + (Math.random() * 0.5);
	var newSnow;
	
	var x = 20 + (Math.random() * (sizes.card.width - 40));
	var endX;  
	var y = -10;
	var endY;
	
	if(scale > 0.8)
	{
		newSnow = outerSnowHolder.circle(0, 0, 5)
			.attr({
				fill: 'white'
			})
		endY = sizes.container.height + 10;
		y = sizes.card.offset.top + settings.cloudHeight;
		x =  x + sizes.card.offset.left;
 
	}
	else 
	{
		newSnow = innerSnowHolder.circle(0, 0 ,5)
		.attr({
			fill: 'white'
		})
		endY = sizes.card.height + 10;
 
		
	}
	
	snow.push(newSnow);
	 
	
	TweenMax.fromTo(newSnow.node, 3 + (Math.random() * 5), {x: x, y: y}, {y: endY, onComplete: onSnowEnd, onCompleteParams: [newSnow], ease: Power0.easeIn})
	TweenMax.fromTo(newSnow.node, 1,{scale: 0}, {scale: scale, ease: Power1.easeInOut})
	TweenMax.to(newSnow.node, 3, {x: x+((Math.random() * 150)-75), repeat: -1, yoyo: true, ease: Power1.easeInOut})
}

function onSnowEnd(flake)
{
	flake.remove();
	flake = null;
	
	for(var i in snow)
	{
		if(!snow[i].paper) snow.splice(i, 1);
	}
	
	if(snow.length < settings.snowCount)
	{
		makeSnow();
	}
}

function tick()
{
	tickCount++;
	var check = tickCount % settings.renewCheck;
	
	if(check)
	{
		if(rain.length < settings.rainCount) makeRain();
		if(leafs.length < settings.leafCount) makeLeaf();
		if(snow.length < settings.snowCount) makeSnow();
	}
	
	for(var i = 0; i < clouds.length; i++)
	{		
		if(currentWeather.type == 'sun')
		{
			if(clouds[i].offset > -(sizes.card.width * 1.5)) clouds[i].offset += settings.windSpeed / (i + 1);
			if(clouds[i].offset > sizes.card.width * 2.5) clouds[i].offset = -(sizes.card.width * 1.5);
			clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
		}
		else
		{	
			clouds[i].offset += settings.windSpeed / (i + 1);
			if(clouds[i].offset > sizes.card.width) clouds[i].offset = 0 + (clouds[i].offset - sizes.card.width);
			clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
		}
	}
	
	requestAnimationFrame(tick);
}

function reset()
{
	for(var i = 0; i < weather.length; i++)
	{
		container.removeClass(weather[i].type);
		weather[i].button.removeClass('active');
	}
}

function updateSummaryText()
{
	summary.html(currentWeather.name);
	TweenMax.fromTo(summary, 1.5, {x: 30}, {opacity: 1, x: 0, ease: Power4.easeOut});
}

function startLightningTimer()
{
	if(lightningTimeout) clearTimeout(lightningTimeout);
	if(currentWeather.type == 'thunder')
	{
		lightningTimeout = setTimeout(lightning, Math.random()*6000);
	}	
}

function lightning()
{
	startLightningTimer();
	TweenMax.fromTo(card, 0.75, {y: -30}, {y:0, ease:Elastic.easeOut});
	
	var pathX = 30 + Math.random() * (sizes.card.width - 60);
	var yOffset = 20;
	var steps = 20;
	var points = [pathX + ',0'];
	for(var i = 0; i < steps; i++)
	{
		var x = pathX + (Math.random() * yOffset - (yOffset / 2));
		var y = (sizes.card.height / steps) * (i + 1)
		points.push(x + ',' + y);
	}
	
	var strike = weatherContainer1.path('M' + points.join(' '))
	.attr({
		fill: 'none',
		stroke: 'white',
		strokeWidth: 2 + Math.random()
	})
	
	TweenMax.to(strike.node, 1, {opacity: 0, ease:Power4.easeOut, onComplete: function(){ strike.remove(); strike = null}})
}

function changeWeather(weather)
{
	if(weather.data) weather = weather.data;
	reset();
	
	currentWeather = weather;
	
	TweenMax.killTweensOf(summary);
	TweenMax.to(summary, 1, {opacity: 0, x: -30, onComplete: updateSummaryText, ease: Power4.easeIn})
	
	container.addClass(weather.type);
	weather.button.addClass('active');
	
 	
	switch(weather.type)
	{
		case 'wind':
			TweenMax.to(settings, 3, {windSpeed: 3, ease: Power2.easeInOut});
			break;
		case 'sun':
			TweenMax.to(settings, 3, {windSpeed: 20, ease: Power2.easeInOut});
			break;
		default:
			TweenMax.to(settings, 3, {windSpeed: 0.5, ease: Power2.easeOut});
			break;
	}	
	
 	
	switch(weather.type)
	{
		case 'rain':
			TweenMax.to(settings, 3, {rainCount: 10, ease: Power2.easeInOut});
			break;
		case 'thunder':
			TweenMax.to(settings, 3, {rainCount: 60, ease: Power2.easeInOut});
			break;
		default:
			TweenMax.to(settings, 1, {rainCount: 0, ease: Power2.easeOut});
			break;
	}	
	
 	
	switch(weather.type)
	{
		case 'wind':
			TweenMax.to(settings, 3, {leafCount: 5, ease: Power2.easeInOut});
			break;
		default:
			TweenMax.to(settings, 1, {leafCount: 0, ease: Power2.easeOut});
			break;
	}	
	
 	
	switch(weather.type)
	{
		case 'snow':
			TweenMax.to(settings, 3, {snowCount: 40, ease: Power2.easeInOut});
			break;
		default:
			TweenMax.to(settings, 1, {snowCount: 0, ease: Power2.easeOut});
			break;
	}
	
 	
	switch(weather.type)
	{
		case 'sun':
			TweenMax.to(sun.node, 4, {x: sizes.card.width / 2, y: sizes.card.height / 2, ease: Power2.easeInOut});
			TweenMax.to(sunburst.node, 4, {scale: 1, opacity: 0.8, y: (sizes.card.height/2) + (sizes.card.offset.top) , ease: Power2.easeInOut});
			break;
		default:
			TweenMax.to(sun.node, 2, {x: sizes.card.width / 2, y: -100, leafCount: 0, ease: Power2.easeInOut});
			TweenMax.to(sunburst.node, 2, {scale: 0.4, opacity: 0, y: (sizes.container.height/2)-50, ease: Power2.easeInOut});
			break;
	}	
	 
	
	startLightningTimer();
}



const cardContainer = document.getElementById('card-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

prevBtn.addEventListener('click', () => {
  cardContainer.scrollBy({ left: -400, behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
  cardContainer.scrollBy({ left: 400, behavior: 'smooth' });
});
