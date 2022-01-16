var categories = data[0];
var filters = Array(categories.length).fill(null);
var resources = Array(10001).fill().map((_, idx) => idx+1)
const eventNotification = new Event('loadImages');

if (data.length > 1) {
  document.getElementById("comingsoon").classList.add("d-none");
  document.getElementById("resourcesDiv").classList.remove("d-none");
}

function loadButtons() {
  var out = "";
  for(var i = 0; i < categories.length; i++) {
    out += `<div>
    <button type="button" id="btn`+i+`" class="dropdown-toggle custom-btn btn-dark w-150p" data-bs-toggle="dropdown" aria-expanded="false">
      `+categories[i]+`  
        </button>
        <ul class="dropdown-menu">`
  
    out += `<li><button class="dropdown-item" href="#" onclick="filter(`+i+`,-1)">Clear Filter</button></li><div class="dropdown-divider"></div>`;
  
    for (var j=0; j < attributes[i].length; j++) {
      out += `<li><button class="dropdown-item" href="#" onclick="filter(`+i+`,`+j+`)">`+attributes[i][j]+`</button></li>`;
    }
    out += `</ul></div>`;
  }
  
  document.getElementById("buttons").innerHTML = out;
}

function filter(i, j) {
  filters[i] = (j == -1) ? null : attributes[i][j];
  document.getElementById("btn"+i).innerHTML = (j == -1) ? categories[i] : attributes[i][j];
  if (j == -1) {
    document.getElementById("btn"+i).classList.remove("btn-red");
    document.getElementById("btn"+i).classList.add("btn-dark");
  } else {
    document.getElementById("btn"+i).classList.remove("btn-dark");
    document.getElementById("btn"+i).classList.add("btn-red");
  }
  search();
}

function search() {
  resources = []
  for (var i=1; i < data.length; i++) {
    var valid = true;
    for (var j=0; j < categories.length; j++) {
      if (filters[j] == null) continue;
      if (filters[j] == "none" && data[i][j] == null) break;
      if (data[i][j] != filters[j]) { valid = false; break; }
    }
    if (valid) resources.push(i);
  }
  showResources();
}

function showResources() {
  var out = "";
  for(var i = 0; i < resources.length; i++)
    out += `<div class="elem"><div class="img lazy" id=`+resources[i]+`></div><div class="dcard">PBH #`+resources[i]+`</div></div>`;

  document.getElementById("resourcesDiv").innerHTML = out;
  window.dispatchEvent(eventNotification);
}

document.addEventListener("DOMContentLoaded", function() {
  var div = document.getElementById("resourcesDiv");

  if (!div.classList.contains("d-none")) {
    function lazyload() {
      var lazyloadThrottleTimeout;
      if(lazyloadThrottleTimeout) clearTimeout(lazyloadThrottleTimeout);
  
      lazyloadThrottleTimeout = setTimeout(() => {
        document.querySelectorAll(".lazy").forEach((img) => {
          if(img.offsetTop < (div.scrollTop + div.offsetHeight)) {
            img.style.backgroundImage = `url('https://ipfs.io/ipfs/`+ipfs+`/`+img.id+`.png')`;
            img.classList.remove('lazy');
          }
        });
      }, 20);
    }
    
    loadButtons();
    search();
    lazyload();
  
    div.addEventListener("scroll", lazyload);
    window.addEventListener("resize", lazyload);
    window.addEventListener("orientationChange", lazyload);
    window.addEventListener("loadImages", lazyload);
  }
});
