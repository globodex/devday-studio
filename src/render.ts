import { assertNever, FORMATS, formatDate, type Design } from './model'

const TAU = Math.PI * 2
const COLORS = { purple: '#9146ff', blue: '#0668ff', orange: '#ff7900', green: '#00b647', white: '#e7e7e1' }
type Face = 'round' | 'plus' | 'chevron' | 'dash' | 'star'
function readableAccent(color: string, background: string): string {
  const rgb=(hex:string)=>[1,3,5].map(index=>Number.parseInt(hex.slice(index,index+2),16))
  const luminance=(channels:number[])=>channels.map(value=>{const n=value/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0)
  let channels=rgb(color)
  const backgroundLuminance=luminance(rgb(background)),target=backgroundLuminance>.5?0:255
  for(let i=0;i<30;i++){
    const foregroundLuminance=luminance(channels)
    if((Math.max(foregroundLuminance,backgroundLuminance)+.05)/(Math.min(foregroundLuminance,backgroundLuminance)+.05)>=3)break
    channels=channels.map(value=>Math.round(value*.88+target*.12))
  }
  return `rgb(${channels.join(',')})`
}
export interface RenderAssets { photo: HTMLImageElement | null }
export async function loadFonts(): Promise<void> {
  await Promise.all([document.fonts.load('400 32px "OpenAI Sans"'), document.fonts.load('700 32px "OpenAI Sans"'), document.fonts.load('400 32px "OpenAI Wordmark"')])
  await document.fonts.ready
}
export async function loadPhoto(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null
  const image = new Image()
  image.src = src
  await image.decode()
  return image
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string, maxWidth?: number, weight = 400): number {
  let chosen = size
  ctx.font = `${weight} ${chosen}px "OpenAI Sans", sans-serif`
  while (maxWidth && ctx.measureText(value).width > maxWidth && chosen > 12) { chosen -= 1; ctx.font = `${weight} ${chosen}px "OpenAI Sans", sans-serif` }
  ctx.fillStyle = color; ctx.textBaseline = 'top'; ctx.fillText(value, x, y)
  return chosen
}

function lines(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string, maxWidth: number, maxLines = 2, weight = 400): void {
  ctx.font = `${weight} ${size}px "OpenAI Sans", sans-serif`
  const words = value.split(/\s+/); let line = ''; const output: string[] = []
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) { output.push(line); line = word } else line = next
  }
  if (line) output.push(line)
  if (output.length > maxLines) {
    output.length = maxLines
    let tail = output[maxLines - 1]
    while (ctx.measureText(`${tail}…`).width > maxWidth && tail.length) tail = tail.slice(0,-1)
    output[maxLines - 1] = `${tail}…`
  }
  output.forEach((lineValue, index) => text(ctx, lineValue, x, y + index * size * 1.3, size, color, maxWidth, weight))
}

export function agent(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, face: Face, phase: number, rotation = 0): void {
  ctx.save(); ctx.translate(x,y); ctx.rotate(rotation)
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0,0,radius,0,TAU); ctx.fill()
  ctx.strokeStyle = '#11130f'; ctx.fillStyle = '#11130f'; ctx.lineWidth = radius * .075; ctx.lineCap = 'butt'
  const blink = Math.cos(phase * TAU) > .965
  for (const eyeX of [-radius * .37, radius * .37]) {
    ctx.save(); ctx.translate(eyeX,radius * .06)
    if (blink) { ctx.beginPath(); ctx.moveTo(-radius*.13,0); ctx.lineTo(radius*.13,0); ctx.stroke() }
    else {
      switch (face) {
        case 'round': ctx.beginPath(); ctx.ellipse(0,0,radius*.14,radius*.21,0,0,TAU); ctx.stroke(); break
        case 'plus': ctx.beginPath(); ctx.moveTo(-radius*.16,0);ctx.lineTo(radius*.16,0);ctx.moveTo(0,-radius*.16);ctx.lineTo(0,radius*.16);ctx.stroke(); break
        case 'chevron': ctx.beginPath(); ctx.moveTo(-radius*.14,radius*.1); ctx.lineTo(0,-radius*.12);ctx.lineTo(radius*.14,radius*.1);ctx.stroke(); break
        case 'dash': ctx.beginPath();ctx.moveTo(-radius*.16,0);ctx.lineTo(radius*.16,0);ctx.stroke();break
        case 'star': for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(-radius*.17,0);ctx.lineTo(radius*.17,0);ctx.stroke();ctx.restore()}break
        default: assertNever(face)
      }
    }
    ctx.restore()
  }
  ctx.restore()
}

function photo(ctx: CanvasRenderingContext2D, image: HTMLImageElement, d: Design, x: number, y: number, r: number): void {
  ctx.save();ctx.fillStyle = d.accent;ctx.beginPath();ctx.arc(x,y,r+10,0,TAU);ctx.fill()
  ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip()
  const scale = Math.max(r*2/image.naturalWidth,r*2/image.naturalHeight)*d.photoZoom
  const w=image.naturalWidth*scale,h=image.naturalHeight*scale
  ctx.drawImage(image,x-r-(w-r*2)*d.photoX/100,y-r-(h-r*2)*d.photoY/100,w,h)
  ctx.restore()
}

export function renderDesign(canvas: HTMLCanvasElement, d: Design, progress: number, assets: RenderAssets): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Tu navegador no permite dibujar el diseño.')
  const {width:w,height:h}=FORMATS[d.format]
  ctx.save();ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0)
  const dark=d.theme==='dark', bg=dark?'#131410':'#f7f7f2', fg=dark?'#f7f7f2':'#151710', muted=dark?'#b0b2a8':'#62675d'
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h)
  const wide=d.format==='landscape', story=d.format==='story', portrait=d.format==='portrait', p=wide?90:64
  const phase=d.motion==='still'? .25: progress
  const drift=(offset:number)=>d.motion==='float'?Math.sin((phase+offset)*TAU)*18*d.intensity/100:0
  if(d.showBrand){ctx.font='400 53px "OpenAI Wordmark", "OpenAI Sans", sans-serif';ctx.fillStyle=fg;ctx.textBaseline='top';ctx.fillText('OpenAI',p,story?100:53)}
  const dateY=story?104:55
  ctx.textAlign='right';text(ctx,formatDate(d.date),w-p,dateY,26,fg,400,700);text(ctx,d.city,w-p,dateY+34,25,fg,420);ctx.textAlign='left'
  const editorial=d.template==='editorial'
  const titleY=story?305:portrait?200:wide?160:151
  const titleWidth=wide?1130:w-p*2
  const headlineSize=editorial?(wide?140:112):(wide?180:150)
  const titleSize=text(ctx,editorial?d.title:`#${d.title}`,p,titleY,headlineSize,editorial?readableAccent(d.accent,bg):fg,titleWidth,editorial?400:700)
  if(!editorial){ctx.font=`700 ${titleSize}px "OpenAI Sans"`;ctx.fillStyle=d.accent;ctx.fillText('#',p,titleY)}
  const subY=titleY+titleSize*(editorial?1.3:1.03)
  const subSize=text(ctx,d.subtitle,p,subY,headlineSize,fg,titleWidth,editorial?400:700)
  if(d.showAgents && d.subtitle==='Community' && !editorial){
    ctx.font=`700 ${subSize}px "OpenAI Sans"`
    const cWidth=ctx.measureText('C').width, oWidth=ctx.measureText('o').width
    ctx.fillStyle=bg;ctx.fillRect(p+cWidth,subY,oWidth,subSize*1.03)
    agent(ctx,p+cWidth+oWidth/2,subY+subSize*.52,oWidth*.54,COLORS.purple,'round',phase+.21,-.16)
  }
  let heroX=wide?1530:790,heroY=wide?547:story?1320:portrait?944:748,heroR=wide?235:story?252:portrait?193:165
  let bodyY=wide?580:story?790:portrait?665:537
  let bodyWidth=wide?1050:story?900:600
  if(editorial) {bodyY=wide?580:story?790:portrait?650:525; heroR*=.9}
  if(story){heroX=742;bodyWidth=950}
  if(d.showAgents){
    agent(ctx,w+3,heroY-178+drift(.1),wide?135:105,COLORS.purple,'round',phase+.12,.13+drift(.2)*.003)
    agent(ctx,heroX-heroR-7,heroY-heroR+(story?60:-28)+drift(.32),wide?57:44,COLORS.white,'star',phase+.41,-.1)
    agent(ctx,heroX-heroR+6,heroY+heroR+51+drift(.7),wide?100:76,COLORS.green,'plus',phase+.6,.24)
    agent(ctx,w-20,heroY+heroR+69+drift(.5),wide?130:105,COLORS.orange,'dash',phase+.76,-.13)
    if(!editorial && d.title.length<10)text(ctx,'?',wide?w-210:w-112,titleY+65+drift(.4),56,COLORS.blue)
  }
  if(assets.photo) photo(ctx,assets.photo,d,heroX,heroY,heroR)
  else if(d.showAgents)agent(ctx,heroX,heroY+drift(0),heroR,editorial?COLORS.orange:COLORS.blue,editorial?'dash':'chevron',phase+.28,-.08)
  const badge=d.template==='speaker'?'SPEAKER':d.badge
  if(badge){
    ctx.font='700 23px "OpenAI Sans"';const badgeWidth=Math.min(ctx.measureText(badge).width+40,bodyWidth)
    ctx.fillStyle=d.accent;ctx.beginPath();ctx.roundRect(p,bodyY,badgeWidth,48,editorial?5:24);ctx.fill()
    text(ctx,badge,p+20,bodyY+12,23,'#10140e',badgeWidth-40,700)
  }
  text(ctx,d.tagline,p,bodyY+82,wide?36:30,fg,bodyWidth,700)
  const name=d.template==='speaker'?d.speaker:d.city
  const nameWidth=story?950:wide?1100:565
  const nameSize=text(ctx,name,p,bodyY+140,story?82:wide?79:63,fg,nameWidth,700)
  lines(ctx,d.template==='speaker'?d.role:'Aprende. Construye. Conecta.',p,bodyY+153+nameSize,wide?29:26,muted,story?880:wide?900:540,2)
  const footerHeight=story?212:portrait?156:126,footerTop=h-footerHeight
  if(d.showFooter){
    ctx.fillStyle=dark?'#25271f':'#e9ece4';ctx.fillRect(0,footerTop,w,footerHeight)
    const col2=wide?480:story?460:360, rightWidth=wide?500:310
    lines(ctx,'DevDay Exchange Community Event',p,footerTop+31,wide?25:23,fg,wide?310:260,2,700)
    const venueWidth=wide?650:story?550:310
    lines(ctx,d.venue,col2,footerTop+30,wide?24:21,fg,venueWidth,2)
    text(ctx,`${d.startTime}–${d.endTime} · UTC−5`,col2,footerTop+(d.venue.length>27?86:62),wide?23:20,fg,venueWidth)
    if(!story){ctx.textAlign='right';text(ctx,d.organizer,w-p,footerTop+43,wide?28:21,fg,rightWidth,700);ctx.textAlign='left'}
    else text(ctx,d.organizer,p,footerTop+131,26,fg,900,700)
  }
  if(d.showUrl && d.url){
    const label=d.url.replace(/^https?:\/\//,'').replace(/\/$/,'')
    const urlY=d.showFooter?footerTop-50:h-65
    text(ctx,label,p,urlY,wide?24:23,muted,wide?950:story?900:585)
  }
  ctx.restore()
}
