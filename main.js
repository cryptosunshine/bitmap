var arr = [];
for (let i = 0; i <= 800000; i++) {
  arr.push(Math.round(Math.random()))
}

$(function () {

  function generateCanvasWithGrid(count, numbers, z) {
    const canvas = document.createElement('canvas');
    const gridSize = 256; // 格子宽度
    const cellSize = gridSize / count; // 格子大小

    // Set the canvas size to a higher resolution
    canvas.width = 256; // canvas 宽度
    canvas.height = 256; // canvas 高度

    const ctx = canvas.getContext('2d');
    // ctx.scale(Math.pow(2, z - 2), Math.pow(2, z - 2));

    const borderOffset = 0.1; // Adjust for the 0.5px border

    for (let i = 0; i < count * count; i++) {
      const number = numbers[i];

      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      const x = col * cellSize + borderOffset;
      const y = row * cellSize + borderOffset;

      ctx.fillStyle = arr[number] == 1 ? 'green' : 'orange';
      ctx.fillRect(x, y, cellSize - borderOffset * 2, cellSize - borderOffset * 2);

      // Draw number
      if(z === 8) {
        console.log(cellSize)
        console.log(x,y)
      }
      

      if (z == 8) {
        ctx.fillStyle = 'black'; // Set text color
        ctx.font = '10px sans-serif'; // Set font size and family
        ctx.textAlign = 'center'; // Center the text
        ctx.textBaseline = 'middle'; // Align the middle of the text with the cell's middle
        ctx.fillText(number, x + cellSize / 2, y + cellSize / 2); // Center the text in the cell
      }

    }

    return canvas;
  }





  var timer = 0;
  var bounds = new L.LatLngBounds(new L.LatLng(-2000, 2000), new L.LatLng(-2000, 2000));
  var map = L.map('mapContainer', {
    crs: L.CRS.Simple,
    // maxBounds: bounds,
    // zoomAnimation: false, // 地图缩放动画
    // markerZoomAnimation: false,
    maxBoundsViscosity: 1.0,
  }).setView([0, 0], 0);

  L.GridLayer.CanvasCircles = L.GridLayer.extend({
    options: {
      minZoom: 2,
      maxZoom: 8,
      minNativeZoom: 0, // 设置最小的本地缩放级别
      maxNativeZoom: 10, // 设置最大的本地缩放级别
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
      const xBlocks = 1024; // x每层的块数量
      const yBlocks = 1024; // y层

      let error;

      // create a <canvas> element for drawing
      let tile = L.DomUtil.create('canvas', 'leaflet-tile');

      // setup tile width and height according to the options
      let size = this.getTileSize();
      tile.width = size.x;
      tile.height = size.y;

      // get the canvas 2d context
      let ctx = tile.getContext('2d');

      const n = 256 / Math.pow(2, z - 2);
      
      // 超出范围
      if (x < 0 || y < 0 || x >= xBlocks / n || y >= yBlocks / n) {
        let tile = document.createElement('div');
        setTimeout(function () {
          done(null, tile);
        }, timer);
        return tile;
      }
      console.log("x:"+x+"y:"+y+"z:"+z)
      console.log("层级："+z+"每一行canvas数量:"+(xBlocks / n)+"每个canvas每行小块数:"+n)

      let arr = [];


      for (let by = 0; by < n; by++) {
        
        for (let bx = 0; bx < n; bx++) {
          let block = bx

          arr.push(block)
        }
        
      }


    
     
      // generate canvas with grid using your method
      let canvasWithGrid = generateCanvasWithGrid(n, arr, z); // Change the count as needed

      // draw the generated canvas onto the tile's context
      ctx.drawImage(canvasWithGrid, 0, 0);

      // pass the tile to the done() callback
      setTimeout(function () {
        done(error, tile);
      }, 1);

      return tile;
    }
  });

  L.gridLayer.canvasCircles = function () {

    return new L.GridLayer.CanvasCircles();
  };

  map.on('click', function (event) {
    // 在这里处理点击事件
    console.log('Map clicked at:', event);
    // map.panTo(new L.LatLng(event.latlng.lat, event.latlng.lng));
  });
  console.log(map.getSize())
  setTimeout(() => {
    map.panTo(new L.LatLng(-130, 130));
  }, 300);



  var cavasGridLayer = L.gridLayer.canvasCircles();
  map.addLayer(cavasGridLayer);
});
