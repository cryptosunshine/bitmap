var arr = [];
for (let i = 0; i <= 800000; i++) {
  arr.push(Math.round(Math.random()))
}
$(function () {

  function generateCanvasWithGrid(count, numbers, lock) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    const gridSize = Math.ceil(Math.sqrt(count));
    const cellSize = 256 / gridSize;

    const ctx = canvas.getContext('2d');
    if (arr[numbers[0]] == 1) {
      ctx.fillStyle = 'green'
    } else if (arr[numbers[0]] == 0) {
      ctx.fillStyle = 'orange'
    } else if (arr[numbers[0]] == undefined) {
      ctx.fillStyle = 'orange'
    }
    ctx.strokeStyle = 'black'; // Set border color
    ctx.font = '10px sans-serif'; // Set font size and family
    ctx.textAlign = 'center'; // Center the text
    ctx.textBaseline = 'middle'; // Align the middle of the text with the cell's middle

    const borderOffset = 0.5; // Adjust for the 0.5px border

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      const x = col * cellSize + borderOffset;
      const y = row * cellSize + borderOffset;

      ctx.fillRect(x, y, cellSize - borderOffset * 2, cellSize - borderOffset * 2);
      ctx.strokeRect(x, y, cellSize - borderOffset * 2, cellSize - borderOffset * 2); // Draw border

      // Draw number
      const number = numbers[i];


      // ctx.fillStyle = arr[number] == 1 ? 'green' : 'orange'; // Reset fill color for the next cell
      if (arr[number] == 1) {
        if (lock) {
          ctx.fillStyle = 'black'; // Set text color
          ctx.fillText(number, x + cellSize / 2, y + cellSize / 2); // Center the text in the cell
        }
        ctx.fillStyle = 'green'
      } else if (arr[number] == 0) {
        if (lock) {
          ctx.fillStyle = 'black'; // Set text color
          ctx.fillText(number, x + cellSize / 2, y + cellSize / 2); // Center the text in the cell
        }
        ctx.fillStyle = 'orange'
      } else if (arr[number] == undefined) {
        ctx.fillStyle = 'orange'
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
      maxZoom: 10,
      minNativeZoom: 0, // 设置最小的本地缩放级别
      maxNativeZoom: 7, // 设置最大的本地缩放级别
      pane: 'tilePane',
      // bounds,
      noWrap: false,
      // tileSize: 100
    },

    createTile: function (coords, done) {
      // 我使用了一个公式，但是不知道为什么，这个公式是错的，每个块的编号范围是错的
      const x = coords.x;
      const y = coords.y;
      const z = coords.z;
      const gBlocks = Math.pow(4, z); // 每层的块数量
      // 超出范围
      if (x < 0 || y < 0 || x >= gBlocks / x || y >= gBlocks / y) {
        var tile = document.createElement('div');
        setTimeout(function () {
          done(null, tile);
        }, timer);
        return tile;
      }



      // const gBlocks = Math.pow(4, z); // 每层的块数量
      const total = 1048576; // 总块数 1024 * 1024
      const allBlock = Math.pow(2, z) * y + x; // 每块从左到右，从上到下的编号
      // let block = total / gBlocks * allBlock;



      // let block = total / gBlocks * allBlock;
      // let color = z == 10 && arr[block] == 1 ? 'green' : 'orange';

      // var tileHtml = `
      //   <div class='block' x='`+ x + `' style="background: ${color}">
      //   ${z == 10
      //     ?
      //     `<div class='font'>${block}</div>
      //         <div class='font'>${z},${x},${y}</div>`
      //     :
      //     `<div>
      //       <div class='font'>${z},${x},${y}</div>
      //     </div>`} `;

      var error;

      // create a <canvas> element for drawing
      var tile = L.DomUtil.create('canvas', 'leaflet-tile');

      // setup tile width and height according to the options
      var size = this.getTileSize();
      tile.width = size.x;
      tile.height = size.y;

      // get the canvas 2d context
      var ctx = tile.getContext('2d');
      let arr = [];
      for (let o = 0; o < 64; o++) {
        let block = total / gBlocks * allBlock + o;
        arr.push(block)
      }
      // generate canvas with grid using your method
      var canvasWithGrid = generateCanvasWithGrid(64, arr, z == 7); // Change the count as needed

      // draw the generated canvas onto the tile's context
      ctx.drawImage(canvasWithGrid, 0, 0);

      // pass the tile to the done() callback
      setTimeout(function () {
        done(error, tile);
      }, 1000);

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
