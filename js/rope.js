window.rope = function( canvas, middle, topY, bottomY ){
  const ctx = canvas.getContext('2d');

  // 实际像素转成绳子像素
  const translate = (x) => {
    return x - middle;
  }

  // 绳子像素转成实际像素
  const translateBack = (x) => {
    return x + middle;
  }

  function drawBezier(from, to) {
    ctx.beginPath()
    ctx.moveTo(from.x, from.y);
    //console.log(from, to )
    ctx.quadraticCurveTo(to.x, from.y, to.x, to.y);
    ctx.stroke();
  }

  const drawLine = (fromPt, l, radius, y_inc, dir) =>{
    if(l < 0) return {x: fromPt.x, y:fromPt.y+y_inc};
    const left = translateBack(-radius);
    const right = translateBack(radius);
    let dist = radius;
    let togo = 0, nextPt;

    ctx.moveTo(fromPt.x, fromPt.y);
    if(dir > 0){
      // 向右
      togo = right - fromPt.x;
      if(togo > l){
        dist = translate(fromPt.x + l);
      }
      nextPt = { x:translateBack(dist), y:fromPt.y };
      ctx.lineTo(nextPt.x, nextPt.y);
      nextPt.y -= y_inc;
      if(togo < l)
        ctx.quadraticCurveTo(nextPt.x + 8, fromPt.y - y_inc / 2, nextPt.x, nextPt.y);

    }else{
      //向左
      togo = fromPt.x - left;
      if(togo > l){

        dist = -translate(fromPt.x - l);
        //console.log(fromPt.x , l, fromPt.x - l, dist)
      }
      nextPt = { x:translateBack(-dist), y:fromPt.y };
      ctx.lineTo(nextPt.x, nextPt.y);
      nextPt.y -= y_inc;
      if(togo < l)
        ctx.quadraticCurveTo(nextPt.x - 8, fromPt.y - y_inc / 2, nextPt.x, nextPt.y);
    }

    return drawLine(nextPt, l - togo, radius, y_inc, -dir);
  }


  const drawBubblesGenerator = (num, bottomY, bubbleSpan, offsetHeight) => {
    let start = 0;
    let bubbleExpansion = 80;
    let bubble_radius = 6;
    let step = bubble_radius / bubbleExpansion;

    const bubbles = [];

    start += offsetHeight;
    while(num--){
      bubbles.push({
        x: middle,
        y: 0,
        yinit: start + 20,
        r: 0,
        show: false
      });
      start += bubbleSpan[num];
    }
    function isVisible(bubble, length){
      const view = bubble.yinit - length;
      return view > 0 && view < bottomY;
    }
    return (length) => {
      //console.log(bubble.x, bubble.y - length)
      let bb;
      // 根据距离调整泡泡
      for (let i = 0; i < bubbles.length; i++) {
        bb = bubbles[i]
        if(isVisible(bb, length)){
          bb.y = bb.yinit - length;
          bb.r = bottomY - bb.y > bubbleExpansion ? bubble_radius: step*(bottomY - bb.y);
          bb.show = true
        }else{
          bb.show = false;
        }
      }
      // 渲染
      for (let i = 0; i < bubbles.length; i++) {
        let bubble = bubbles[i];
        if(bubble.show){
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.r, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }

  /*
  parameters:

    radius: 绳子折叠的半径
    y_inc:  绳子折叠的高度
    length: 绳子的总长

  return:
    // delta为一个空隙时间
    (delta) => {}

  */
  const action = (radius, y_inc, length, color, bubbleSpan)=> {
    let l = 0,
        remain = length,
        lastPT;
    // 初始化最底部起点
    const pt = {}
    pt.x = translateBack(0);
    pt.y = bottomY;
    topPt = {};
    topPt.x = translateBack(0);
    topPt.y = topY;

    drawLine(pt, length, radius, y_inc, 1);
    ctx.stroke();
    const bubbleTick = drawBubblesGenerator(20, topY , bubbleSpan, 156);
    return (delta) => {
      l += delta;
      remain -= delta;
      //console.log(remain)
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      lastPT = drawLine(pt, remain, radius, y_inc, 1);
      ctx.stroke();
      drawBezier(lastPT, topPt)
      ctx.moveTo(topPt.x, topPt.y);
      ctx.lineTo(topPt.x, 0);
      ctx.stroke();
      bubbleTick(l)
    }
  }

  const animInit = (duration, mid_new, l_new) => {
    let start;
    const step_middle = (middle - mid_new) / duration;
    const step_length = (length - l_new) / duration;

    const anim = (timestamp)=>{
      if (!start) start = timestamp;
      var progress = timestamp - start; //已持续的时间
      //动画逻辑



      if (progress < duration) {
        window.requestAnimationFrame(anim);
      }
    }
  }

  return {
    action,
    transform(mid_new, l_new){

    }
  }
}
