// Editable source for the public PNG. Open /design/social-card.html with Vite,
// then capture the canvas at its native 1200 × 630 resolution after data-ready.
// This entry is only used by the design page, not by the production editor.
import { agent, loadFonts } from './render'

async function drawSocialCard(): Promise<void> {
  await loadFonts()
  const canvas = document.querySelector('canvas')
  if (!canvas) throw new Error('Social card canvas is missing')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable')
  ctx.fillStyle = '#11130f'
  ctx.fillRect(0, 0, 1200, 630)

  const label = (text: string, x: number, y: number, size: number, color: string, weight = 400): void => {
    ctx.font = `${weight} ${size}px "OpenAI Sans", sans-serif`
    ctx.textBaseline = 'top'
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
  }
  label('COMMUNITY EVENT CREATOR', 64, 62, 22, '#b6bbae', 700)
  label('DevDay', 57, 140, 124, '#f7f7f2', 700)
  label('Studio.', 57, 267, 124, '#00b647', 700)
  label('Flyers · GIFs · Videos', 64, 456, 34, '#f7f7f2')
  ctx.strokeStyle = '#35392e'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(64, 542); ctx.lineTo(593, 542); ctx.stroke()
  label('CREATE. ANIMATE. SHARE.', 64, 565, 19, '#b6bbae', 700)
  label('ES / EN', 518, 565, 19, '#b6bbae')

  ctx.strokeStyle = '#35392e'
  ctx.beginPath(); ctx.arc(951, 316, 233, 0, Math.PI * 2); ctx.stroke()
  agent(ctx, 951, 282, 159, '#9146ff', 'round', .3, -.15)
  agent(ctx, 762, 458, 98, '#00b647', 'plus', .3, .18)
  agent(ctx, 1073, 89, 62, '#e7e7e1', 'star', .3, .25)
  agent(ctx, 1191, 352, 83, '#0668ff', 'chevron', .3, -.25)
  agent(ctx, 1075, 584, 119, '#ff7900', 'dash', .3, -.14)
  canvas.dataset.ready = 'true'
}

void drawSocialCard()
