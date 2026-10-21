import { GIFEncoder, quantize, applyPalette, type Encoder } from 'gifenc'
import { assertNever } from './model'
type Message = {type:'start'} | {type:'frame';pixels:ArrayBuffer;width:number;height:number;delay:number} | {type:'finish'}
let encoder: Encoder | null = null
self.onmessage = (event: MessageEvent<Message>) => {
  try {
    const message=event.data
    switch(message.type){
      case 'start': encoder=GIFEncoder();self.postMessage({type:'ready'});break
      case 'frame': {
        if(!encoder)throw new Error('No se inició el GIF.')
        const rgba=new Uint8Array(message.pixels),palette=quantize(rgba,256),indices=applyPalette(rgba,palette)
        encoder.writeFrame(indices,message.width,message.height,{palette,delay:message.delay,repeat:0})
        self.postMessage({type:'ready'});break
      }
      case 'finish': {
        if(!encoder)throw new Error('No se inició el GIF.')
        encoder.finish();const bytes=encoder.bytes();self.postMessage({type:'done',bytes});encoder=null;break
      }
      default: assertNever(message)
    }
  } catch(error){ self.postMessage({type:'error',message:error instanceof Error?error.message:'No se pudo crear el GIF.'}) }
}
