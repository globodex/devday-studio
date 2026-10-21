import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, CheckCheck, ChevronDown, CircleHelp, FileDown, FolderOpen, ImagePlus, Info, LoaderCircle, Maximize2, Monitor, MoreHorizontal, Palette, Pause, Play, RotateCcw, SlidersHorizontal, Smartphone, Sparkles, Square, Trash2, Type, Upload, WandSparkles, X } from 'lucide-react'
import { ACCENTS, DEFAULT_DESIGN, EVENTS, FORMATS, STORAGE_KEY, loadDesign, parseDesign, safeUrl, type Design, type ExportKind, type Format, type Template } from './model'
import { download, exportDesign, supportedVideoType } from './export'
import Preview from './Preview'

type Tab='content'|'design'|'motion'
function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>}
function Toggle({label,checked,onChange,description}:{label:string;checked:boolean;onChange:(checked:boolean)=>void;description?:string}){return <label className="toggle-row"><span>{label}{description&&<small>{description}</small>}</span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span className="toggle-track" aria-hidden="true"/></label>}
function FormatIcon({format,size=16}:{format:Format;size?:number}){return format==='landscape'?<Monitor size={size}/>:format==='story'?<Smartphone size={size}/>:<Square size={size} style={format==='portrait'?{transform:'scaleX(.8)'}:undefined}/>}

function TemplatePreview({kind}:{kind:Template}){return <div className={`template-preview ${kind}`} aria-hidden="true"><span className="mini-brand">OpenAI</span><b>DevDay<br/>Community</b><span className="mini-dot dot-one"/><span className="mini-dot dot-two"/><span className="mini-dot dot-three"/>{kind==='speaker'&&<span className="mini-photo"/>}<span className="mini-line"/></div>}

async function readImage(file:File):Promise<string>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Elige una foto JPG, PNG o WebP.')
  if(file.size>20*1024*1024)throw new Error('La foto supera 20 MB. Elige una imagen más pequeña.')
  const bitmap=await createImageBitmap(file)
  try{
    const canvas=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale)
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo preparar la foto.')
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.88)
  }finally{bitmap.close()}
}

export default function App(){
  const [design,setDesign]=useState<Design>(loadDesign)
  const [tab,setTab]=useState<Tab>('content')
  const [playing,setPlaying]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [position,setPosition]=useState(0)
  const [saved,setSaved]=useState(true)
  const [storageError,setStorageError]=useState(false)
  const [notice,setNotice]=useState('')
  const [menu,setMenu]=useState(false)
  const [resetConfirm,setResetConfirm]=useState(false)
  const [exportOpen,setExportOpen]=useState(false)
  const [exportKind,setExportKind]=useState<ExportKind>('png')
  const [exporting,setExporting]=useState(false)
  const [exportProgress,setExportProgress]=useState(0)
  const [exportError,setExportError]=useState('')
  const [uploading,setUploading]=useState(false)
  const [helpOpen,setHelpOpen]=useState(false)
  const [large,setLarge]=useState(false)
  const uploadRef=useRef<HTMLInputElement>(null),importRef=useRef<HTMLInputElement>(null),exportDialog=useRef<HTMLDialogElement>(null)
  const abortRef=useRef<AbortController|null>(null)
  const size=FORMATS[design.format],preset=EVENTS.find(event=>event.id===design.presetId),videoType=supportedVideoType()

  function update<K extends keyof Design>(key:K,value:Design[K]){setDesign(previous=>({...previous,[key]:value}));setSaved(false)}
  useEffect(()=>{setSaved(false);const timer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(design));setSaved(true);setStorageError(false)}catch{setStorageError(true)}},450);return()=>clearTimeout(timer)},[design])
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),6000);return()=>clearTimeout(timer)},[notice])
  useEffect(()=>{const dialog=exportDialog.current;if(exportOpen&&!dialog?.open)dialog?.showModal();else if(!exportOpen&&dialog?.open)dialog?.close()},[exportOpen])
  useEffect(()=>()=>abortRef.current?.abort(),[])
  function applyPreset(id:string){const event=EVENTS.find(item=>item.id===id);if(event){setDesign(previous=>({...previous,...event,presetId:id}));setNotice(`Datos de ${event.city} cargados. Puedes editarlos.`)}}
  async function uploadPhoto(file:File|undefined){if(!file)return;setUploading(true);try{const photo=await readImage(file);setDesign(previous=>({...previous,photo,photoZoom:1,photoX:50,photoY:50}));setNotice('Foto añadida. Ajusta su encuadre debajo.')}catch(error){setNotice(error instanceof Error?error.message:'No se pudo cargar la foto.')}finally{setUploading(false);if(uploadRef.current)uploadRef.current.value=''}}
  function chooseTemplate(template:Template){setDesign(previous=>({...previous,template,photo:template==='speaker'&&!previous.photo?'/assets/host.jpg':previous.photo}));setNotice(template==='speaker'?'Plantilla speaker con la foto del anfitrión de Luma. Puedes reemplazarla.':'Plantilla actualizada.')}
  async function importProject(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file)return;try{if(file.size>5_000_000)throw new Error('El archivo supera 5 MB.');const value:unknown=JSON.parse(await file.text());setDesign(parseDesign(value));setNotice('Diseño importado.')}catch(error){setNotice(error instanceof Error?error.message:'No se pudo importar el diseño.')}event.target.value=''}
  async function startExport(){
    setExportError('');setExporting(true);setExportProgress(0);setPlaying(false)
    const controller=new AbortController();abortRef.current=controller
    try{const result=await exportDesign({...design},exportKind,setExportProgress,controller.signal,position);download(result.blob,result.name);setNotice(`${result.name} listo para descargar.`);setExportOpen(false)}
    catch(error){if(error instanceof Error&&error.name!=='AbortError')setExportError(error.message)}
    finally{setExporting(false);abortRef.current=null}
  }
  const textInput=(key:'title'|'subtitle'|'city'|'venue'|'url'|'organizer'|'speaker'|'role'|'tagline'|'badge',placeholder?:string,maxLength=80)=><input value={design[key]} onChange={e=>update(key,e.target.value)} placeholder={placeholder} maxLength={maxLength}/>

  return <div className="app-shell">
    <header className="app-header">
      <a className="brand" href="/" aria-label="DevDay Studio, inicio"><span className="brand-mark" aria-hidden="true"><i/><i/></span><span>DevDay <strong>Studio</strong></span><span className="brand-edition">Community edition</span></a>
      <div className="header-actions"><span className={`save-state ${storageError?'warning':''}`}>{storageError?<Info size={14}/>:saved?<CheckCheck size={15}/>:<LoaderCircle size={14}/>}<span>{storageError?'Sin guardar':saved?'Guardado en este navegador':'Guardando…'}</span></span>
        <div className="project-menu"><button className="icon-button" aria-label="Opciones del diseño" aria-expanded={menu} onClick={()=>setMenu(!menu)}><MoreHorizontal size={21}/></button>{menu&&<><button className="menu-dismiss" aria-label="Cerrar opciones" onClick={()=>setMenu(false)}/><div className="dropdown-menu"><button onClick={()=>{download(new Blob([JSON.stringify(design,null,2)],{type:'application/json'}),'devday-diseno.json');setMenu(false)}}><FileDown size={16}/>Guardar archivo editable</button><button onClick={()=>{importRef.current?.click();setMenu(false)}}><FolderOpen size={16}/>Abrir archivo editable</button><button onClick={()=>{setResetConfirm(true);setMenu(false)}}><RotateCcw size={16}/>Empezar de nuevo</button></div></>}</div>
        <button className="primary-button export-top" onClick={()=>setExportOpen(true)}><ArrowDownToLine size={16}/><span>Exportar</span><ChevronDown size={14}/></button>
      </div>
    </header>

    <main className={`workspace ${large?'large-preview':''}`}>
      <aside className="inspector" aria-label="Editar diseño">
        <div className="inspector-title"><h1>Crea tu próximo encuentro.</h1><p>Tu comunidad. Tu evento. Tu diseño.</p></div>
        <div className="editor-tabs" role="tablist" aria-label="Opciones de edición">
          {([{id:'content',label:'Contenido',icon:Type},{id:'design',label:'Diseño',icon:Palette},{id:'motion',label:'Animación',icon:Sparkles}] as const).map(item=><button key={item.id} id={`tab-${item.id}`} role="tab" aria-selected={tab===item.id} aria-controls={`panel-${item.id}`} onClick={()=>setTab(item.id)} className={tab===item.id?'active':''}><item.icon size={16}/>{item.label}</button>)}
        </div>
        <div className="inspector-scroll" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab==='content'&&<>
            <section className="form-section"><div className="section-heading"><h2>Tu evento</h2><span className="section-note">Ecuador</span></div>
              <Field label="Cargar un evento"><div className="select-wrap"><select value={design.presetId} onChange={e=>applyPreset(e.target.value)}>{EVENTS.map(item=><option value={item.id} key={item.id}>{item.city} · {item.date.slice(8)}/{item.date.slice(5,7)}/2026</option>)}</select><ChevronDown size={15}/></div></Field>
              {preset?.note&&<p className="inline-note"><Info size={15}/>{preset.note}</p>}
              <div className="two-columns"><Field label="Título">{textInput('title','DevDay',28)}</Field><Field label="Segunda línea">{textInput('subtitle','Community',30)}</Field></div>
              <Field label="Ciudad">{textInput('city','Guayaquil',45)}</Field>
              <div className="date-time"><Field label="Fecha"><input type="date" value={design.date} onChange={e=>update('date',e.target.value)}/></Field><Field label="Desde"><input type="time" value={design.startTime} onChange={e=>update('startTime',e.target.value)}/></Field><Field label="Hasta"><input type="time" value={design.endTime} onChange={e=>update('endTime',e.target.value)}/></Field></div>
              <p className="field-hint">Hora de Ecuador · UTC−5</p>
            </section>
            <section className="form-section"><div className="section-heading"><h2>El mensaje</h2><span className="section-note">Hazlo tuyo</span></div>
              <Field label="Frase principal">{textInput('tagline','Nos vemos en DevDay.',65)}</Field>
              {design.template==='speaker'?<><Field label="Nombre del speaker">{textInput('speaker','Nombre y apellido',55)}</Field><Field label="Cargo o descripción">{textInput('role','Cargo · Organización',100)}</Field></>:<Field label="Etiqueta">{textInput('badge','COMMUNITY EVENT',30)}</Field>}
              <Field label="Foto o imagen"><button className={`photo-uploader ${design.photo?'has-photo':''}`} disabled={uploading} onClick={()=>uploadRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void uploadPhoto(e.dataTransfer.files[0])}}>
                {design.photo?<img src={design.photo} alt="Foto seleccionada"/>:<span className="upload-icon"><ImagePlus size={23}/></span>}<span><b>{uploading?'Preparando imagen…':design.photo?'Cambiar imagen':'Sube tu imagen'}</b><small>JPG, PNG o WebP · hasta 20 MB</small></span><Upload size={17}/>
              </button></Field>
              {design.photo&&<div className="photo-controls"><Field label="Zoom"><input type="range" min="1" max="3" step=".05" value={design.photoZoom} onChange={e=>update('photoZoom',Number(e.target.value))}/></Field><div className="two-columns"><Field label="Posición horizontal"><input type="range" min="0" max="100" value={design.photoX} onChange={e=>update('photoX',Number(e.target.value))}/></Field><Field label="Posición vertical"><input type="range" min="0" max="100" value={design.photoY} onChange={e=>update('photoY',Number(e.target.value))}/></Field></div><button className="text-button" onClick={()=>update('photo','')}><Trash2 size={14}/>Quitar imagen</button></div>}
            </section>
            <section className="form-section"><div className="section-heading"><h2>Los detalles</h2></div><Field label="Lugar">{textInput('venue','Nombre del espacio',100)}</Field><Field label="Organiza">{textInput('organizer','Tu comunidad',70)}</Field><Field label="Enlace de registro">{textInput('url','https://luma.com/tu-evento',180)}</Field>{safeUrl(design.url)&&<a href={safeUrl(design.url)??undefined} target="_blank" rel="noreferrer" className="source-link">Ver evento en Luma<ArrowUpRight size={14}/></a>}</section>
          </>}
          {tab==='design'&&<>
            <section className="form-section"><div className="section-heading"><h2>Una idea, tres estilos</h2></div><div className="template-grid">{([{id:'community',label:'Community'},{id:'speaker',label:'Speaker'},{id:'editorial',label:'Editorial'}] as const).map(item=><button key={item.id} className={`template-button ${design.template===item.id?'selected':''}`} onClick={()=>chooseTemplate(item.id)} aria-pressed={design.template===item.id}><TemplatePreview kind={item.id}/><span>{item.label}{design.template===item.id&&<Check size={13}/>}</span></button>)}</div><p className="field-hint">Inspirado en los assets digitales de DevDay.</p></section>
            <section className="form-section"><div className="section-heading"><h2>Fondo y color</h2></div><div className="theme-buttons"><button className={design.theme==='dark'?'selected':''} aria-pressed={design.theme==='dark'} onClick={()=>update('theme','dark')}><span className="theme-swatch dark"/>Oscuro{design.theme==='dark'&&<Check size={14}/>}</button><button className={design.theme==='light'?'selected':''} aria-pressed={design.theme==='light'} onClick={()=>update('theme','light')}><span className="theme-swatch light"/>Claro{design.theme==='light'&&<Check size={14}/>}</button></div><Field label="Color de acento"><div className="color-swatches">{ACCENTS.map((color,i)=><button key={color} aria-label={['Verde','Violeta','Azul','Naranja'][i]} aria-pressed={design.accent===color} className={design.accent===color?'selected':''} style={{background:color}} onClick={()=>update('accent',color)}>{design.accent===color&&<Check size={18}/>}</button>)}<label className="custom-color" title="Color personalizado"><Palette size={18}/><input aria-label="Color personalizado" type="color" value={design.accent} onChange={e=>update('accent',e.target.value)}/></label></div></Field></section>
            <section className="form-section"><div className="section-heading"><h2>Lo que se ve</h2></div><Toggle label="Agentes y expresiones" checked={design.showAgents} onChange={v=>update('showAgents',v)}/><Toggle label="Marca OpenAI" checked={design.showBrand} onChange={v=>update('showBrand',v)}/><Toggle label="Información al pie" checked={design.showFooter} onChange={v=>update('showFooter',v)}/><Toggle label="Enlace de registro" checked={design.showUrl} onChange={v=>update('showUrl',v)}/></section>
            <section className="form-section reference-section"><h2>La familia DevDay</h2><p>La tipografía y paleta de tus assets, listas para tu comunidad.</p><img src="/assets/agents-reference.png" alt="Referencia digital oficial con agentes de colores" loading="lazy"/></section>
          </>}
          {tab==='motion'&&<>
            <section className="form-section"><div className="section-heading"><h2>Dale vida a tu evento</h2></div><p className="section-description">Pequeños movimientos. Mucha personalidad.</p><div className="motion-list">{([{id:'float',label:'Flotar y parpadear',detail:'Un movimiento suave, en bucle.'},{id:'expressions',label:'Solo expresiones',detail:'Los agentes parpadean en su lugar.'},{id:'still',label:'Sin movimiento',detail:'Una composición completamente estática.'}] as const).map(item=><button className={design.motion===item.id?'selected':''} key={item.id} onClick={()=>update('motion',item.id)} aria-pressed={design.motion===item.id}><span className={`radio ${design.motion===item.id?'checked':''}`}/><span><b>{item.label}</b><small>{item.detail}</small></span></button>)}</div></section>
            <section className="form-section"><Field label={`Duración del ciclo · ${design.duration} segundos`}><input type="range" min="2" max="12" step="1" value={design.duration} onChange={e=>update('duration',Number(e.target.value))}/></Field><Field label={`Intensidad · ${design.intensity}%`}><input type="range" min="0" max="100" value={design.intensity} onChange={e=>update('intensity',Number(e.target.value))} disabled={design.motion!=='float'}/></Field><p className="inline-note"><Info size={16}/>El GIF se repite automáticamente. El video exporta un ciclo completo.</p></section>
            <section className="motion-demo"><span className={`demo-agent ${playing&&design.motion!=='still'?'moving':''}`} aria-hidden="true"><i/><i/></span><h3>Los detalles hacen la diferencia.</h3><p>Reproduce tu diseño para ver a los agentes en acción.</p><button className="secondary-button" onClick={()=>setPlaying(!playing)}>{playing?<Pause size={16}/>:<Play size={16}/>} {playing?'Pausar vista previa':'Reproducir vista previa'}</button></section>
          </>}
        </div>
        <div className="inspector-bottom"><span className="local-dot"/><span>Tu diseño se guarda en este dispositivo.</span><button aria-label="Cómo funciona" onClick={()=>setHelpOpen(!helpOpen)}><CircleHelp size={16}/></button></div>
      </aside>

      <section className="preview-panel" aria-label="Lienzo de diseño">
        <div className="canvas-toolbar"><div className="canvas-heading"><span className="status-dot"/><span>Vista previa en vivo</span></div><button className="icon-button" title={large?'Mostrar editor':'Ampliar vista previa'} aria-label={large?'Mostrar editor':'Ampliar vista previa'} onClick={()=>setLarge(!large)}>{large?<SlidersHorizontal size={18}/>:<Maximize2 size={17}/>}</button></div>
        <div className="format-toolbar" aria-label="Formato del diseño">{(Object.keys(FORMATS) as Format[]).map(format=><button key={format} onClick={()=>update('format',format)} className={design.format===format?'selected':''} aria-pressed={design.format===format}><FormatIcon format={format}/><span>{FORMATS[format].label}</span><small>{FORMATS[format].ratio}</small></button>)}</div>
        <div className="canvas-stage"><Preview design={design} playing={playing} position={position} onPosition={setPosition}/></div>
        <div className="preview-meta"><span>{size.width} × {size.height} px</span><span>{design.theme==='dark'?'Fondo oscuro':'Fondo claro'}<i/>{design.template==='speaker'?'Speaker':design.template==='editorial'?'Editorial':'Community'}</span></div>
        <div className="transport"><button className="play-button" aria-label={playing?'Pausar animación':'Reproducir animación'} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}</button><div className="transport-label"><b>{playing?'En movimiento':'Vista pausada'}</b><span>{design.duration} s · Bucle continuo</span></div><input aria-label="Fotograma de la animación" type="range" min="0" max="1000" value={Math.round(position*1000)} onChange={e=>{setPlaying(false);setPosition(Number(e.target.value)/1000)}}/><span className="time-display">{(position*design.duration).toFixed(1)}<span> / {design.duration.toFixed(1)} s</span></span><button className="icon-button" aria-label="Reiniciar animación" onClick={()=>setPosition(0)}><RotateCcw size={17}/></button></div>
        <p className="canvas-tip"><WandSparkles size={14}/>Edita a la izquierda. La magia sucede aquí.</p>
      </section>
    </main>

    <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden-input" onChange={e=>void uploadPhoto(e.target.files?.[0])}/><input ref={importRef} type="file" accept=".json,application/json" className="hidden-input" onChange={e=>void importProject(e)}/>
    {notice&&<div className="toast" role="status"><Info size={17}/><span>{notice}</span><button aria-label="Cerrar aviso" onClick={()=>setNotice('')}><X size={16}/></button></div>}
    {storageError&&<div className="storage-banner" role="alert">No hay espacio para guardar. Exporta tu archivo editable desde el menú de opciones.</div>}
    {resetConfirm&&<div className="confirm-bar" role="alert"><span>¿Empezar de nuevo? Se reemplazará el borrador actual.</span><button className="secondary-button" onClick={()=>setResetConfirm(false)}>Cancelar</button><button className="primary-button" onClick={()=>{setDesign({...DEFAULT_DESIGN});setPosition(0);setResetConfirm(false);setNotice('Nuevo diseño listo.')}}>Empezar de nuevo</button></div>}
    {helpOpen&&<div className="help-panel"><button className="icon-button" aria-label="Cerrar ayuda" onClick={()=>setHelpOpen(false)}><X size={18}/></button><h2>De la idea al encuentro.</h2><p>Elige un evento, edita el texto y añade una foto. En Diseño puedes cambiar de plantilla y fondo; en Animación, ajustar los agentes.</p><p>Descarga PNG o JPG a resolución completa, GIF de hasta 720 px o video. Usa el menú de opciones para guardar y abrir archivos editables.</p><p>Las fotos se procesan en tu navegador. El borrador queda en este dispositivo.</p><small>Eventos consultados en Luma el 21 de octubre de 2026. Confirma sus datos antes de compartir.</small></div>}

    <dialog ref={exportDialog} className="export-dialog" onCancel={e=>{if(exporting)e.preventDefault();else setExportOpen(false)}} onClose={()=>{if(!exporting)setExportOpen(false)}}>
      <div className="dialog-header"><div><h2>Listo para compartir.</h2><p>Tu próximo encuentro, en el formato que necesitas.</p></div><button className="icon-button" aria-label="Cerrar exportación" disabled={exporting} onClick={()=>setExportOpen(false)}><X size={20}/></button></div>
      <div className="export-options">{([{id:'png',label:'Imagen PNG',detail:'Máxima calidad · Sin pérdida'},{id:'jpg',label:'Imagen JPG',detail:'Más ligera · Lista para redes'},{id:'gif',label:'GIF animado',detail:'720 px · 12 fps · Bucle continuo'},{id:'video',label:`Video ${videoType?.startsWith('video/mp4')?'MP4':'WebM'}`,detail:videoType?'Resolución completa · 30 fps':'No disponible en este navegador'}] as const).map(item=><button key={item.id} disabled={exporting||(item.id==='video'&&!videoType)} onClick={()=>setExportKind(item.id)} className={exportKind===item.id?'selected':''} aria-pressed={exportKind===item.id}><span className={`radio ${exportKind===item.id?'checked':''}`}/><span><b>{item.label}</b><small>{item.detail}</small></span>{exportKind===item.id&&<Check size={17}/>}</button>)}</div>
      <div className="export-summary"><FormatIcon format={design.format}/><span>{size.label} · {exportKind==='gif'?`${Math.round(size.width*Math.min(1,720/Math.max(size.width,size.height)))} × ${Math.round(size.height*Math.min(1,720/Math.max(size.width,size.height)))}`:`${size.width} × ${size.height}`} px{(exportKind==='gif'||exportKind==='video')?` · ${design.duration} segundos`:''}</span></div>
      {exportError&&<p className="export-error" role="alert">{exportError}</p>}
      {exporting?<div className="export-progress"><div><span>Preparando tu {exportKind==='gif'?'GIF':exportKind==='video'?'video':'imagen'}…</span><b>{exportProgress}%</b></div><progress max="100" value={exportProgress}/><p>Mantén esta pestaña abierta hasta terminar.</p><button className="secondary-button" onClick={()=>abortRef.current?.abort()}>Cancelar exportación</button></div>:<button className="primary-button download-button" onClick={()=>void startExport()}><ArrowDownToLine size={18}/>Descargar {exportKind==='video'?'video':exportKind.toUpperCase()}</button>}
    </dialog>
  </div>
}
