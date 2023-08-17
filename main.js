$(function () {
  
  var timer = 50;
  var bounds = new L.LatLngBounds(new L.LatLng(-2000, 2000), new L.LatLng(-2000, 2000));
  var map = L.map('mapContainer', {
    crs: L.CRS.Simple,
    // maxBounds: bounds,
    maxBoundsViscosity: 1.0,
  }).setView([0, 0], 0);

  var jsonAvter = {
    "10,0,0": "/avtar/shine.png",
    "10,1,0": "/avtar/shine.png",
    "10,0,1": "/avtar/shine.png",
    "10,1,1": "/avtar/shine.png",
    "9,0,0": "/avtar/shine.png",
    "10,2,0": "/avtar/tom.png",
    "10,6,0": "/avtar/jack.png",
  }

  L.GridLayer.CanvasCircles = L.GridLayer.extend({
    options: {
      minZoom: 4,
      maxZoom: 10,
      // bounds,
      noWrap: false,
      tileSize: 50
    },
    
    createTile: function (coords, done) {
      const x = coords.x;
      const y = coords.y;
      const z = coords.z;
      const gBlocks = Math.pow(4, z); // 每层的块数量

      const block = y * 1024 + x; // 

      const total = 1048576; // 总块数 1024 * 1024

      const allBlock = Math.pow(2, z) * y + x; // 每块从左到右，从上到下的编号

      const block1 = total / gBlocks; // 每大块包含小块的数量


      if (x < 0 || y < 0 || x >= gBlocks/x || y >= gBlocks/y) {
        var tile = document.createElement('div');
        setTimeout(function () {
          done(null, tile);
        }, timer);
        return tile;
      }

      let key = z+','+x+','+y;

      if(jsonAvter[key]) {
        var tileHtml = `<div class='block'>
          <img src='${jsonAvter[key]}'/>
        </div>`;
        var tile = document.createElement('div');
        tile.innerHTML = tileHtml;
  
        setTimeout(function () {
          done(null, tile);
        }, timer);
  
        return tile;
      }
      // ${z == 10 ? `<p class='font'>block: ${block}</p>` : ``}
      // <p class='font'>position: ${z},${x},${y}</p>
      var tileHtml = `
        <div class='block' x='`+x+`'>
        ${z == 10 
          ? `<p class='font'>${block}</p>` 
          : `<p class='font'>${block1 * allBlock}  ${block1 * allBlock + block1}</p>`}
        
          
        </div>
      `;

      var tile = document.createElement('div');

      tile.innerHTML = tileHtml;

      setTimeout(function () {
        done(null, tile);
      }, timer);

      return tile;
    }
  });
  
  L.gridLayer.canvasCircles = function () {

		return new L.GridLayer.CanvasCircles();
	};

  map.on('click', function(event) {
    // 在这里处理点击事件
    console.log('Map clicked at:', event);
  });

	var cavasGridLayer = L.gridLayer.canvasCircles();
	map.addLayer(cavasGridLayer);
});
