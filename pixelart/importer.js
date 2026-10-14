/* One image converter used by the game and Robert's dashboard. No network upload. */
(function(){
  'use strict';
  window.PixelImport = async function(file,opts={}) {
    if(!file || !/^image\/(png|jpeg|webp|gif|bmp)$/.test(file.type)) throw new Error('Choose a PNG, JPG, WebP, GIF, or BMP picture.');
    if(file.size>12*1024*1024) throw new Error('Choose a picture smaller than 12 MB.');
    const cols=Math.max(8,Math.min(1000,Math.round(Number(opts.cols)||32)));
    const rows=Math.max(8,Math.min(1000,Math.round(Number(opts.rows)||32)));
    const count=Math.max(2,Math.min(100,Math.round(Number(opts.maxColors)||12)));
    const url=URL.createObjectURL(file), img=new Image();
    try { await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('This picture could not be read.'));img.src=url;}); }
    finally { URL.revokeObjectURL(url); }
    const canvas=document.createElement('canvas');canvas.width=cols;canvas.height=rows;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.fillStyle='#f8eee7';ctx.fillRect(0,0,cols,rows);
    // Center-crop rather than stretching faces to fit a square.
    const scale=Math.max(cols/img.naturalWidth,rows/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
    ctx.imageSmoothingEnabled=opts.pixelated!==true;
    const x=Math.max(0,Math.min(1,Number.isFinite(opts.cropX)?opts.cropX:0.5)),y=Math.max(0,Math.min(1,Number.isFinite(opts.cropY)?opts.cropY:0.5));
    ctx.drawImage(img,(cols-w)*x,(rows-h)*y,w,h);
    const raw=ctx.getImageData(0,0,cols,rows).data;
    const exact=new Map(),hist=new Map();
    for(let i=0;i<raw.length;i+=4){
      const r=raw[i],g=raw[i+1],b=raw[i+2],key=(r<<16)|(g<<8)|b;
      if(exact.size<=count)exact.set(key,[r,g,b]);
      const bin=((r>>3)<<10)|((g>>3)<<5)|(b>>3);
      let h=hist.get(bin);if(!h){h=[0,0,0,0];hist.set(bin,h);}h[0]+=r;h[1]+=g;h[2]+=b;h[3]++;
    }
    let palette;
    if(exact.size<=count)palette=[...exact.values()];
    else {
      const buckets=[[...hist.values()].map(h=>[h[0]/h[3],h[1]/h[3],h[2]/h[3],h[3]])];
      while(buckets.length<count){
        let best=-1,channel=0,score=-1;
        buckets.forEach((bucket,i)=>{if(bucket.length<2)return;for(let c=0;c<3;c++){let min=255,max=0;for(const p of bucket){min=Math.min(min,p[c]);max=Math.max(max,p[c]);}if(max-min>score){score=max-min;best=i;channel=c;}}});
        if(best<0||score<=0)break;
        const bucket=buckets.splice(best,1)[0].sort((a,b)=>a[channel]-b[channel]),mid=Math.floor(bucket.length/2);
        buckets.push(bucket.slice(0,mid),bucket.slice(mid));
      }
      palette=buckets.map(bucket=>{const n=bucket.reduce((s,p)=>s+p[3],0);return [0,1,2].map(c=>Math.round(bucket.reduce((s,p)=>s+p[c]*p[3],0)/n));});
    }
    const colors={};palette.forEach((p,i)=>colors[i+1]='#'+p.map(n=>n.toString(16).padStart(2,'0')).join(''));
    const cache=new Map(),flat=new Uint8Array(cols*rows);
    for(let i=0;i<flat.length;i++){
      const r=raw[i*4],g=raw[i*4+1],b=raw[i*4+2],key=exact.size<=count?(r<<16)|(g<<8)|b:((r>>3)<<10)|((g>>3)<<5)|(b>>3);
      let chosen=cache.get(key);
      if(!chosen){let min=Infinity;for(let j=0;j<palette.length;j++){const q=palette[j],d=(r-q[0])**2+(g-q[1])**2+(b-q[2])**2;if(d<min){min=d;chosen=j+1;}}cache.set(key,chosen);}
      flat[i]=chosen;if(i%65536===0)await new Promise(resolve=>setTimeout(resolve,0));
    }
    const grid=Array.from({length:rows},(_,r)=>Array.from(flat.subarray(r*cols,(r+1)*cols)));
    return {id:'custom_'+(crypto.randomUUID ? crypto.randomUUID() : Date.now()+'_'+Math.random().toString(36).slice(2)),title:String(opts.title||'A little memory').slice(0,80),category:opts.category||'custom',cols,rows,colors,grid,isCustom:true,desc:'A picture chosen just for you.'};
  };
})();
