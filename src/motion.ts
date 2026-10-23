import { assertNever, type Motion } from './model'

/** All poses are periodic: frame 0 and frame 1 meet without a jump. */
export function agentPose(motion: Motion, progress: number, offset: number, intensity: number) {
  const phase = (progress + offset) * Math.PI * 2, amount = intensity / 100
  const neutral = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }
  switch (motion) {
    case 'still': case 'expressions': return neutral
    case 'float': return { ...neutral, y: Math.sin(phase) * 18 * amount, rotation: Math.sin(phase) * .06 * amount }
    case 'orbit': return { ...neutral, x: Math.cos(phase) * 36 * amount, y: Math.sin(phase) * 42 * amount, rotation: Math.sin(phase) * .28 * amount }
    case 'bounce': {
      const lift = (1 - Math.cos(phase)) / 2
      const squash = Math.cos(phase) ** 12 * .12 * amount
      return { x: Math.sin(phase) * 12 * amount, y: -lift * 70 * amount, rotation: Math.sin(phase) * .22 * amount, scaleX: 1 + squash, scaleY: 1 - squash }
    }
    case 'waves': return { ...neutral, y: Math.sin(phase) * 15 * amount, rotation: Math.sin(phase) * .18 * amount, scaleX: 1 + Math.sin(phase) * .07 * amount, scaleY: 1 + Math.sin(phase) * .07 * amount }
    default: return assertNever(motion)
  }
}
