import { assertNever, FORMATS, type Design, type ExportKind } from './model'
import { loadFonts, loadPhoto, renderDesign } from './render'

export function download(blob: Blob, name: string): void {
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),60_000)
}
function canvasBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo crear la imagen.')),type,.95))
}
export function supportedVideoType(): string | null {
  if(typeof MediaRecorder==='undefined' || !HTMLCanvasElement.prototype.captureStream)return null
  return ['video/mp4;codecs=avc1.42E01E','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type)) ?? null
}
type GifReply={type:'ready'}|{type:'done';bytes:Uint8Array}|{type:'error';message:string}

export async function exportDesign(d: Design, kind: ExportKind, onProgress:(n:number)=>void, signal:AbortSignal, stillProgress=0): Promise<{blob:Blob;name:string}> {
  const [,photo]=await Promise.all([loadFonts(),loadPhoto(d.photo)]);const assets={photo};signal.throwIfAborted()
  const canvas=document.createElement('canvas'),size=FORMATS[d.format]
  const maxEdge=kind==='gif'?720:Math.max(size.width,size.height)
  const scale=Math.min(1,maxEdge/Math.max(size.width,size.height))
  canvas.width=Math.round(size.width*scale);canvas.height=Math.round(size.height*scale)
  const filename=`devday-${d.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-')}-${d.format}`
  switch(kind){
    case 'png': case 'jpg':
      renderDesign(canvas,d,stillProgress,assets);onProgress(100)
      return {blob:await canvasBlob(canvas,kind==='png'?'image/png':'image/jpeg'),name:`${filename}.${kind}`}
    case 'gif': {
      const worker=new Worker(new URL('./gif.worker.ts',import.meta.url),{type:'module'})
      const ask=(message:object,transfer:Transferable[]=[]):Promise<GifReply>=>new Promise((resolve,reject)=>{
        const abort=()=>reject(new DOMException('Exportación cancelada','AbortError'))
        signal.addEventListener('abort',abort,{once:true})
        worker.onmessage=(event:MessageEvent<GifReply>)=>{signal.removeEventListener('abort',abort);event.data.type==='error'?reject(new Error(event.data.message)):resolve(event.data)}
        worker.onerror=()=>{signal.removeEventListener('abort',abort);reject(new Error('El codificador GIF no pudo iniciarse. Vuelve a intentarlo.'))}
        worker.postMessage(message,transfer)
      })
      try {
        await ask({type:'start'});const fps=12,total=Math.round(d.duration*fps),ctx=canvas.getContext('2d',{willReadFrequently:true})
        if(!ctx)throw new Error('Canvas no disponible.')
        for(let i=0;i<total;i++){
          signal.throwIfAborted();renderDesign(canvas,d,i/total,assets)
          const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data.buffer
          const delay=(Math.round((i+1)*100/fps)-Math.round(i*100/fps))*10
          await ask({type:'frame',pixels,width:canvas.width,height:canvas.height,delay},[pixels]);onProgress(Math.round((i+1)/total*98))
        }
        const result=await ask({type:'finish'})
        if(result.type!=='done')throw new Error('No se pudo terminar el GIF.')
        const bytes=new Uint8Array(result.bytes);onProgress(100)
        return {blob:new Blob([bytes],{type:'image/gif'}),name:`${filename}.gif`}
      } finally {worker.terminate()}
    }
    case 'video': {
      const mime=supportedVideoType();if(!mime)throw new Error('Este navegador no permite grabar video. Descarga un GIF o usa Chrome o Edge.')
      renderDesign(canvas,d,0,assets)
      const stream=canvas.captureStream(30),chunks:Blob[]=[]
      let frame=0
      try {
        const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8_000_000})
        const blob=await new Promise<Blob>((resolve,reject)=>{
          const abort=()=>{cancelAnimationFrame(frame);if(recorder.state!=='inactive')recorder.stop();reject(new DOMException('Exportación cancelada','AbortError'))}
          signal.addEventListener('abort',abort,{once:true})
          recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
          recorder.onerror=()=>{signal.removeEventListener('abort',abort);reject(new Error('No se pudo grabar el video. Prueba la exportación GIF.'))}
          recorder.onstop=()=>{signal.removeEventListener('abort',abort);resolve(new Blob(chunks,{type:mime.split(';')[0]}))}
          recorder.start();const start=performance.now()
          const tick=(now:number)=>{const elapsed=(now-start)/1000;renderDesign(canvas,d,Math.min(elapsed/d.duration,1),assets);onProgress(Math.min(99,Math.round(elapsed/d.duration*100)));if(elapsed>=d.duration)recorder.stop();else frame=requestAnimationFrame(tick)}
          frame=requestAnimationFrame(tick)
        })
        signal.throwIfAborted();onProgress(100)
        return {blob,name:`${filename}.${mime.startsWith('video/mp4')?'mp4':'webm'}`}
      } finally {cancelAnimationFrame(frame);stream.getTracks().forEach(track=>track.stop())}
    }
    default: return assertNever(kind)
  }
}
