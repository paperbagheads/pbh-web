const config = {
  src: 'public/images/artboard.png',
  rows: 10,
  cols: 6
}

const randomRange = (min, max) => min + Math.random() * (max - min)
const randomIndex = (array) => randomRange(0, array.length) | 0
const removeFromArray = (array, i) => array.splice(i, 1)[0]
const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item))
const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array))
const getRandomFromArray = (array) => (array[randomIndex(array) | 0])

const resetPeep = ({ stage, peep }) => {
  const direction = Math.random() > 0.5 ? 1 : -1
  const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
  const startY = stage.height - peep.height + offsetY
  let startX
  let endX
  
  if (direction === 1) {
    startX = -peep.width
    endX = stage.width
    peep.scaleX = 1
  } else {
    startX = stage.width + peep.width
    endX = 0
    peep.scaleX = -1
  }
  
  peep.x = startX
  peep.y = startY
  peep.anchorY = startY
  
  return { startX, startY, endX}
}

const normalWalk = ({ peep, props }) => {
  const { startX, startY, endX } = props
  const xDuration = 10
  const yDuration = 0.25
  const tl = gsap.timeline()
  tl.timeScale(randomRange(0.5, 1.5))
  tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0)
  tl.to(peep, { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 }, 0)
  return tl
}

const walks = [normalWalk,]

class Peep {
  constructor({ image, rect }) {
    this.image = image
    this.setRect(rect)
    this.x = 0
    this.y = 0
    this.anchorY = 0
    this.scaleX = 1
    this.walk = null
  }
  
  setRect (rect) {
    this.rect = rect
    this.width = rect[2]
    this.height = rect[3]
    this.drawArgs = [this.image, ...rect, 0, 0, this.width, this.height]  
  }
  
  render (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.scaleX, 1)
    ctx.drawImage(...this.drawArgs)
    ctx.restore()
  }
}


const img = document.createElement('img')
img.onload = init
img.src = config.src
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const stage = { width: 0, height: 0}
const allPeeps = []
const availablePeeps = []
const crowd = []

function init () {  
  createPeeps()
  resize()
  gsap.ticker.add(render)
  window.addEventListener('resize', resize)
}

function createPeeps () {
  const { rows, cols } = config
  const { naturalWidth: width, naturalHeight: height } = img
  const total = rows * cols
  const rectWidth = width / rows
  const rectHeight = height / cols
  
  for (let i = 0; i < total; i++) {
    allPeeps.push(new Peep({
      image: img,
      rect: [(i % rows) * rectWidth, (i / rows | 0) * rectHeight, rectWidth, rectHeight]
    }))
  }  
}

function resize () {
  stage.width = canvas.clientWidth
  stage.height = canvas.clientHeight
  canvas.width = stage.width * devicePixelRatio
  canvas.height = stage.height * devicePixelRatio

  crowd.forEach((peep) => { peep.walk.kill() })  
  crowd.length = 0
  availablePeeps.length = 0
  availablePeeps.push(...allPeeps)
  initCrowd()
}

function initCrowd () {
  while (availablePeeps.length) {
    addPeepToCrowd().walk.progress(Math.random())
  }
}

function addPeepToCrowd () {
  const peep = removeRandomFromArray(availablePeeps)
  const walk = getRandomFromArray(walks)({ peep, props: resetPeep({ peep, stage }) })
  .eventCallback('onComplete', () => {
    removePeepFromCrowd(peep)
    addPeepToCrowd()
  })
  
  peep.walk = walk
  crowd.push(peep)
  crowd.sort((a, b) => a.anchorY - b.anchorY)
  return peep
}

function removePeepFromCrowd (peep) {
  removeItemFromArray(crowd, peep)
  availablePeeps.push(peep)
}

function render () {
  canvas.width = canvas.width
  ctx.save()
  ctx.scale(devicePixelRatio, devicePixelRatio)
  crowd.forEach((peep) => { peep.render(ctx) })
  ctx.restore()
}

// var deadline = new Date(2022, 2-1, 2, 12, 0, 0, 0);
   
function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
          'total': t,
          'days': days,
          'hours': hours,
          'minutes': minutes,
          'seconds': seconds
    };
}

function initializeClock(id, endtime) {
    var clock = document.getElementById(id);
    var daysSpan = clock.querySelector('#days');
    var hoursSpan = clock.querySelector('#hours');
    var minutesSpan = clock.querySelector('#minutes');
    var secondsSpan = clock.querySelector('#seconds');

    function updateClock() {
          var t = getTimeRemaining(endtime);

          daysSpan.innerHTML = t.days;
          hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
          minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
          secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

          if (t.total <= 0) {
                clearInterval(timeinterval);
          }
      }

      updateClock();
      var timeinterval = setInterval(updateClock, 1000);
}

// initializeClock('clock', deadline);


var context = window.document.querySelector('.js-loop'),
  disableScroll = false,
  scrollWidth = 0,
  scrollPos = 0;

function getScrollPos () {
  return (context.pageXOffset || context.scrollLeft) - (context.clientLeft || 0);
}

function setScrollPos (pos) {
  context.scrollLeft = pos;
}

function reCalc () {
  scrollPos = getScrollPos();
  scrollWidth = context.scrollWidth;

  if (scrollPos <= 0) {
    setScrollPos(1);
  }
}

function scrollUpdate () {
  if (!disableScroll) {
    scrollPos = getScrollPos();

    if (scrollPos >= scrollWidth) {
      setScrollPos(1);
      disableScroll = true;
    } else if (scrollPos <= 0) {
      setScrollPos(scrollWidth);
      disableScroll = true;
    }
  }

  if (disableScroll) {
    window.setTimeout(() => { disableScroll = false;}, 40);
  }
}

window.requestAnimationFrame(reCalc);
context.addEventListener('scroll', () => window.requestAnimationFrame(scrollUpdate), false);
window.addEventListener('resize', () => window.requestAnimationFrame(reCalc), false);


var scrollSpeed = 1
function autoScroll () {
    setScrollPos(getScrollPos() + scrollSpeed)
    window.requestAnimationFrame(autoScroll)
}

autoScroll()

const Confettiful = function (div) {
  const confettiDiv = document.createElement('div');
  confettiDiv.classList.add('confetti-container');
  confettiDiv.id = "confettiDiv"
  div.style.position = 'relative';
  div.appendChild(confettiDiv);

  this.confettiInterval = setInterval(() => {
    const confettiElement = document.createElement('div');
    confettiElement.classList.add('confetti', 'confetti--animation-' + ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)]);
    confettiElement.style.left = Math.floor(Math.random() * confettiDiv.offsetWidth) + 'px';
    confettiElement.style.width = Math.floor(Math.random() * 3) + 7 + 'px';
    confettiElement.style.height = confettiElement.style.width;
    confettiElement.style.backgroundColor = ['#fce18a', '#ff726d', '#b48def', '#f4306d'][Math.floor(Math.random() * 4)];
    confettiElement.removeTimeout = setTimeout(() => confettiElement.parentNode.removeChild(confettiElement), 3000);
    confettiDiv.appendChild(confettiElement);
  }, 25);

  // var iframe = document.createElement('iframe');
  // iframe.src = "https://www.youtube.com/embed/5lr_2pgzs80?&autoplay=1"
  // iframe.style.display = "none";
  // confettiDiv.appendChild(iframe);
};

  // if (window.confettiful) {
  //   delete window.confettiful;
  //   window.confettiful = null;
  //   document.getElementById("confettiDiv").remove();
  // } else {
  //   window.confettiful = new Confettiful(document.querySelector('.js-container'));
  // }

function throwConfetti() {
  // if (window.confettiful) {
  //   delete window.confettiful;
  //   window.confettiful = null;
  //   document.getElementById("confettiDiv").remove();
  // }
  if (!window.confettiful) {
    window.confettiful = new Confettiful(document.querySelector('.js-container'));
  }
}

function onKonamiCode(key, cb) {
  var input = '';
  document.addEventListener('keydown', function (e) {
    input += ("" + e.keyCode);
    if (input === key) {
      return cb();
    }
    if (!key.indexOf(key)) return;
    input = ("" + e.keyCode);
  });
}

onKonamiCode('38384040373937396665', function () {
  document.getElementById("konami").style.visibility = 'visible';
})

onKonamiCode('8085828076697685717379', function () {
  document.getElementById('theme-switch').click();
})

onKonamiCode('65787978658069', function () {
  document.getElementById('theme-switch').click();
})

function hideKonamiImages() {
  document.getElementById('konami').style.visibility = "hidden";
}

function showNFT() {
  document.getElementById("konami").style.visibility = 'visible';
}

function trip() {
  (d=document).getElementById("tripDiv").appendChild(p = d.createElement('pre')),d.getElementById("tripDiv").classList.remove("d-none"),j=0,M=Math,setInterval(()=>{for(T='$PBH .',s='',i=492;i--;)s+=i%41?T[M.abs(-j+5*M.hypot(((i% 41)-20)/10, (((i/41)|0)-5)/5)|0)%6]:'\n';p.textContent=s;j++;},150)
  $('html,body').animate({ scrollTop: $("#tripDiv").offset().top });
}

function float() {
  if (document.getElementById("pbhtitle").classList.contains("d-none")) {
    document.getElementById("pbhtitle").classList.remove("d-none");
    document.getElementById("float").classList.add("d-none");
  } else {
    document.getElementById("pbhtitle").classList.add("d-none");
    document.getElementById("float").classList.remove("d-none");
  }
}