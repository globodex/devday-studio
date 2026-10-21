import { useEffect, useRef, useState } from 'react'
import { FORMATS, type Design } from './model'
import { loadFonts, loadPhoto, renderDesign } from './render'

interface Props { design: Design; playing: boolean; position: number; onPosition: (position: number) => void }
export default function Preview({design,playing,position,onPosition}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const [photo,setPhoto]=useState<HTMLImageElement|null>(null)
  const [ready,setReady]=useState(false)
  const [error,setError]=useState('')
  const positionRef=useRef(position)
  const callbackRef=useRef(onPosition)
  const size=FORMATS[design.format]
  useEffect(()=>{loadFonts().then(()=>setReady(true)).catch(()=>setError('No se pudo cargar la tipografía. Recarga la página.'))},[])
  useEffect(()=>{let alive=true;setPhoto(null);setError('');loadPhoto(design.photo).then(image=>{if(alive)setPhoto(image)}).catch(()=>{if(alive)setError('No se pudo leer la foto. Sube otra imagen.')});return()=>{alive=false}},[design.photo])
  useEffect(()=>{positionRef.current=position},[position])
  useEffect(()=>{callbackRef.current=onPosition},[onPosition])
  useEffect(()=>{
    if(!ready || !canvasRef.current)return
    const canvas=canvasRef.current
    let frame=0,last=performance.now(),lastUpdate=last
    const draw=(now:number)=>{
      if(playing)positionRef.current=(positionRef.current+(now-last)/(design.duration*1000))%1
      last=now
      renderDesign(canvas,design,positionRef.current,{photo})
      if(playing && now-lastUpdate>90){callbackRef.current(positionRef.current);lastUpdate=now}
      if(playing)frame=requestAnimationFrame(draw)
    }
    draw(last);return()=>cancelAnimationFrame(frame)
  },[design,photo,playing,ready])
  useEffect(()=>{if(!playing&&ready&&canvasRef.current)renderDesign(canvasRef.current,design,position,{photo})},[design,photo,playing,position,ready])
  return <div className={`artwork-wrap ${design.format}`} style={{aspectRatio:`${size.width}/${size.height}`}}>
    <canvas ref={canvasRef} width={size.width} height={size.height} aria-label={`Vista previa: ${design.title} ${design.subtitle}, ${design.city}, ${design.date}`} role="img" />
    {!ready&&<div className="canvas-loading">Preparando tu diseño…</div>}
    {error&&<div className="canvas-error" role="alert">{error}</div>}
  </div>
}
