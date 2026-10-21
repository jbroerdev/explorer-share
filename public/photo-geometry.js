export function photoLayout({width,height,viewportWidth,viewportHeight,angle=0,mode='fit',scale=1,x=0,y=0}) {
  if(!width||!height||viewportWidth<=0||viewportHeight<=0)return null;
  const swapped=Math.abs(Math.round(angle/90))%2===1;
  const rotatedWidth=swapped?height:width,rotatedHeight=swapped?width:height;
  const fitted=Math.min(1,Math.max(1,viewportWidth-24)/rotatedWidth,Math.max(1,viewportHeight-24)/rotatedHeight);
  const actual=mode==='fit'?fitted:Math.max(.05,Math.min(16,scale));
  const maxX=Math.max(0,(rotatedWidth*actual-viewportWidth)/2);
  const maxY=Math.max(0,(rotatedHeight*actual-viewportHeight)/2);
  return {scale:actual,width:width*actual,height:height*actual,
    x:Math.max(-maxX,Math.min(maxX,x)),y:Math.max(-maxY,Math.min(maxY,y))};
}

export function zoomAt({scale,nextScale,x,y,anchorX=0,anchorY=0}) {
  const next=Math.max(.05,Math.min(16,nextScale)),ratio=next/scale;
  return {scale:next,x:anchorX-(anchorX-x)*ratio,y:anchorY-(anchorY-y)*ratio};
}
