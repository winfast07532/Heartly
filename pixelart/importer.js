/* One image converter used by the game and Robert's dashboard. No network upload. */
(function(){
  'use strict';
  window.PixelImport = async function(file,opts={}) {
    if(!file || !/^image\/(png|jpeg|webp|gif|bmp)$/.test(file.type)) throw new Error('Choose a PNG, JPG, WebP, GIF, or BMP picture.');
    if(file.size>12*1024*1024) throw new Error('Choose a picture smaller than 12 MB.');
    const cols=Math.max(8,Math.min(96,Math.round(Number(opts.cols)||32)));
    const rows=Math.max(8,Math.min(96,Math.round(Number(opts.rows)||32)));
    const count=Math.max(2,Math.min(32,Math.round(Number(opts.maxColors)||12)));
    const url=URL.createObjectURL(file), img=new Image();
    try { await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('This picture could not be read.'));img.src=url;}); }
    finally { URL.revokeObjectURL(url); }
    const canvas=document.createElement('canvas');canvas.width=cols;canvas.height=rows;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.fillStyle='#f8eee7';ctx.fillRect(0,0,cols,rows);
    // Center-crop rather than stretching faces to fit a square.
    const scale=Math.max(cols/img.naturalWidth,rows/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
    ctx.drawImage(img,(cols-w)/2,(rows-h)/2,w,h);
    const raw=ctx.getImageData(0,0,cols,rows).data, pixels=[];
    for(let i=0;i<raw.length;i+=4) pixels.push([raw[i],raw[i+1],raw[i+2]]);
    // Median cut gives a balanced palette, including less common detail colors.
    const buckets=[pixels.slice()];
    while(buckets.length<count){
      let best=-1,channel=0,score=-1;
      buckets.forEach((b,i)=>{if(b.length<2)return;for(let c=0;c<3;c++){const vals=b.map(p=>p[c]);const range=Math.max(...vals)-Math.min(...vals);if(range>score){best=i;channel=c;score=range;}}});
      if(best<0 || score<=0) break;
      const b=buckets.splice(best,1)[0].sort((a,b)=>a[channel]-b[channel]),mid=Math.floor(b.length/2);
      buckets.push(b.slice(0,mid),b.slice(mid));
    }
    const palette=buckets.map(b=>[0,1,2].map(c=>Math.round(b.reduce((s,p)=>s+p[c],0)/b.length)));
    const colors={};palette.forEach((p,i)=>colors[i+1]='#'+p.map(n=>n.toString(16).padStart(2,'0')).join(''));
    const flat=pixels.map(p=>{let at=0,min=Infinity;palette.forEach((q,i)=>{const d=p.reduce((sum,n,c)=>sum+(n-q[c])**2,0);if(d<min){min=d;at=i;}});return at+1;});
    const grid=Array.from({length:rows},(_,r)=>flat.slice(r*cols,(r+1)*cols));
    return {id:'custom_'+(crypto.randomUUID ? crypto.randomUUID() : Date.now()+'_'+Math.random().toString(36).slice(2)),title:String(opts.title||'A little memory').slice(0,80),category:opts.category||'custom',cols,rows,colors,grid,isCustom:true,desc:'A picture chosen just for you.'};
  };
})();
