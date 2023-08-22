
var arr = [];
for (let i = 0; i <= 800000; i++) {
  arr.push(Math.round(Math.random()))
}

var bytesToHex = function (bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] >>> 4).toString(16));
      hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join("");
}
const b = bytesToHex(maps.result.bitMap.data)

console.log(b.length)

$(function () {

  const TileSize = 256

  function generateCanvasWithGrid(z, coords) {

    const canvas = document.createElement('canvas');
    // const n = TileSize / Math.pow(2, z+1);
    var n = 1
    var borderOffset = 0.2 // Adjust for the 0.5px border
    if (z === 0) {
      n = 128
      borderOffset = 0
    }
    else if (z === 1) {
      n = 64
      borderOffset = 0.5
    }
    else if (z === 2) {
      n = 32
      borderOffset = 0.5
    }
    else if (z === 3) {
      n = 16
      borderOffset = 1
    }
    else if (z === 4) {
      n = 8
      borderOffset = 1
    }
    else if (z === 5) {
      n = 4
      borderOffset = 1
    }
    const gridSize = TileSize; // 格子宽度
    const cellSize = gridSize / n; // 格子大小

    // console.log(z, n, gridSize, cellSize)


    canvas.width = TileSize
    canvas.height = TileSize

    const ctx = canvas.getContext('2d');

    if (z == 0) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const row = i;
          const col = j;
          
          const x = col * cellSize + borderOffset;
          const y = row * cellSize + borderOffset;

          ctx.fillStyle = Math.round(Math.random() * 100) % 100 == 1 ? '#66BD89' : '#D8E4DD';
          // ctx.fillStyle = "#66BD89";
          ctx.fillRect(x, y, cellSize - borderOffset * 2, cellSize - borderOffset * 2);

        }
      }
      return canvas
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const row = i;
        const col = j;
        // borderOffset = 0

        const x = col * cellSize + borderOffset;
        const y = row * cellSize + borderOffset;

        ctx.fillStyle = 1 % 2 == 1 ? '#66BD89' : '#D8E4DD';
        // ctx.fillStyle = "#66BD89";
        ctx.fillRect(x, y, cellSize - borderOffset * 2, cellSize - borderOffset * 2);

        

        if (z >= 3) {
          const blockNumber = (row + (n * coords.y)) * 512 + col + (n * coords.x)
          ctx.fillStyle = 'black'; // Set text color
          ctx.font = '10px sans-serif'; // Set font size and family
          ctx.textAlign = 'center'; // Center the text
          ctx.textBaseline = 'middle'; // Align the middle of the text with the cell's middle
          ctx.fillText(blockNumber, x + cellSize / 2, y + cellSize / 2); // Center the text in the cell
        }
      }
    }

    // for (let i = 0; i < all; i++) {
    //   const row = Math.floor(i / n);
    //   const col = i % n;

    //   const x = col * cellSize + borderOffset;
    //   const y = row * cellSize + borderOffset;


    //   ctx.fillStyle = i % 2 == 1 ? '#66BD89' : '#D8E4DD';
    //   // ctx.fillStyle = "#66BD89";
    //   ctx.fillRect(x, y, cellSize - borderOffset * 2, cellSize - borderOffset * 2);

    //   if (z >= 5) {
    //     ctx.fillStyle = 'black'; // Set text color
    //     ctx.font = '6px sans-serif'; // Set font size and family
    //     ctx.textAlign = 'center'; // Center the text
    //     ctx.textBaseline = 'middle'; // Align the middle of the text with the cell's middle
    //     ctx.fillText(i.toString(), x + cellSize / 2, y + cellSize / 2); // Center the text in the cell
    //   }

    // }

    return canvas;
  }





  var timer = 0;
  var bounds = new L.LatLngBounds(new L.LatLng(50, -120), new L.LatLng(-4200, 1200)); // 边界0,0  -4096,1024
  var map = L.map('mapContainer', {
    crs: L.CRS.Simple,
    maxBounds: bounds,
    zoomControl: false,
    // zoomAnimation: false, // 地图缩放动画
    // markerZoomAnimation: false,
    maxBoundsViscosity: 1.0,
  }).setView([0, 0], 0);

  L.GridLayer.CanvasCircles = L.GridLayer.extend({
    options: {
      tileSize: TileSize,
      minZoom: 0,
      maxZoom: 5,
      minNativeZoom: 0, // 设置最小的本地缩放级别
      // maxNativeZoom: 10, // 设置最大的本地缩放级别
      pane: 'tilePane',
      // bounds,
      noWrap: false,
      // tileSize: 100
    },

    createTile: function (coords, done) {

      const x = coords.x;
      const y = coords.y;
      const z = coords.z;

      const total = 1048576; // 总块数 1024 * 1024
      const xBlocks = 256; // x每层的块数量
      const yBlocks = 256; // y层

      let error;

      // create a <canvas> element for drawing
      let tile = L.DomUtil.create('canvas', 'leaflet-tile');

      // setup tile width and height according to the options
      let size = this.getTileSize();
      tile.width = size.x;
      tile.height = size.y;

      // get the canvas 2d context
      let ctx = tile.getContext('2d');

      // const n = 256 / Math.pow(2, z + 3 - 2);
      // console.log("x:"+x+"y:"+y+"z:"+z)
      // console.log("层级："+z+"每一行canvas数量:"+(xBlocks / n)+"每个canvas每行小块数:"+n)

      // 超出范围
      if (x < 0 || y < 0 || x >= xBlocks / TileSize * 4 * Math.pow(2, z) || y >= yBlocks / TileSize * 4 * Math.pow(2, z + 2)) {
        let tile = document.createElement('div');
        setTimeout(function () {
          done(null, tile);
        }, timer);
        return tile;
      }

      // let arr = [];
      // const allBlock = Math.pow(2, z) * y + x; // 每块从左到右，从上到下的编号
      // for (let o = 0; o < 256; o++) {
      //   let block = total / gBlocks * allBlock + o;
      //   arr.push(block)
      // }
      // generate canvas with grid using your method
      let canvasWithGrid = generateCanvasWithGrid(z, coords); // Change the count as needed

      // draw the generated canvas onto the tile's context
      ctx.drawImage(canvasWithGrid, 0, 0);

      // pass the tile to the done() callback
      setTimeout(function () {
        done(error, tile);
      }, 1);

      var nwPoint = coords.scaleBy(size)
      var nw = map.unproject(nwPoint, coords.z)

      ctx.fillStyle = 'black';
      ctx.fillText('zoom: ' + coords.z, 10, 10);
      ctx.fillText('x: ' + coords.x, 20, 20);
      ctx.fillText('y: ' + coords.y, 30, 30);
      // ctx.fillText('n: ' + n, 20, 20);
      // ctx.strokeStyle = 'red';
      // ctx.beginPath();
      // ctx.moveTo(0, 0);
      // ctx.lineTo(size.x - 1, 0);
      // ctx.lineTo(size.x - 1, size.y - 1);
      // ctx.lineTo(0, size.y - 1);
      // ctx.closePath();
      // ctx.stroke();

      return tile;
    }
  });

  L.gridLayer.canvasCircles = function () {

    return new L.GridLayer.CanvasCircles();
  };

  // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>',
  //   tileSize: TileSize,
  //     minZoom: 0,
  //     maxZoom: 5,
  // }).addTo(map)

  map.on('click', function (event) {

    var layerPoint = event.layerPoint;

    // 将像素坐标转换为地理坐标
    var latlng = map.layerPointToLatLng(layerPoint);
  
    // 获取瓦片坐标（coords）
    var coords = {
      x: Math.floor(latlng.lng),
      y: Math.floor(latlng.lat),
      z: map.getZoom()
    };
    
    const block = Math.trunc(Math.trunc(coords.y % 2 == 0 ? Math.abs(coords.y + 1)/ 2 : Math.abs(coords.y)/ 2) * 512 + coords.x / 2)
    console.log('Clicked at:', coords);
    console.log('Clicked at:', block);
  });

  map.on('zoomend', function(event) {
    let zoomLevel = map.getZoom();

    let gap = [50, 50, 40, 30, 20, 10]; 
    console.log()
    // 设置边界
    map.setMaxBounds(new L.LatLngBounds(
      new L.LatLng(0 + gap[zoomLevel], 0 - gap[zoomLevel]),
      new L.LatLng(-4096 - gap[zoomLevel], 1024 + gap[zoomLevel]))
    )
  });

  console.log(map.getSize())
  setTimeout(() => {
    // map.panTo(new L.LatLng(-230, 130));
  }, 1000);



  var cavasGridLayer = L.gridLayer.canvasCircles();
  map.addLayer(cavasGridLayer);
});
