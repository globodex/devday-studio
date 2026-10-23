import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import ts from 'typescript'

// Compile the pure domain modules with the project's TypeScript compiler.
const output = new URL('../output/model-tests/', import.meta.url)
await mkdir(output, { recursive: true })
for (const name of ['model', 'motion', 'session']) {
  const source = await readFile(new URL(`../src/${name}.ts`, import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  await writeFile(new URL(`${name}.cjs`, output), compiled.replace('require("./model")', 'require("./model.cjs")'))
}
const require = createRequire(import.meta.url)
const model = require(fileURLToPath(new URL('model.cjs', output)))
const { agentPose } = require(fileURLToPath(new URL('motion.cjs', output)))
const { storageForSession } = require(fileURLToPath(new URL('session.cjs', output)))

test('legacy designs keep their content and gain the default artwork language', () => {
  const result = model.parseDesign({ title: 'Legacy', city: 'Loja', motion: 'float' })
  assert.equal(result.title, 'Legacy'); assert.equal(result.city, 'Loja')
  assert.equal(result.locale, 'es'); assert.equal(result.motion, 'float')
})
test('event validation checks dates, time order and registration URLs', () => {
  assert.equal(model.validateEvent(model.EVENTS[0]), null)
  for (const changes of [{ city: ' ' }, { name: '' }, { date: '2027-02-30' }, { startTime: '25:00' }, { endTime: '09:00' }, { url: 'javascript:alert(1)' }]) {
    assert.notEqual(model.validateEvent({ ...model.EVENTS[0], ...changes }), null)
  }
})
test('event storage preserves an empty list and custom events; rejects duplicate ids', () => {
  assert.deepEqual(model.parseEvents([]), [])
  const event = { ...model.EVENTS[0], id: 'custom', name: 'Cuenca 2027', city: 'Cuenca', date: '2027-01-15', note: 'Bring your laptop' }
  assert.deepEqual(model.parseEvents(JSON.parse(JSON.stringify([event]))), [event])
  assert.throws(() => model.parseEvents([event, event]))
})
test('dates use the promotion language and reject invalid calendar dates', () => {
  assert.match(model.formatDate('2027-01-15', 'en'), /JAN/)
  assert.match(model.formatDate('2027-01-15', 'es'), /ENE/)
  assert.match(model.formatDate('2027-02-30', 'en'), /CONFIRMED/)
})
for (const motion of ['float', 'orbit', 'bounce', 'waves', 'expressions', 'still']) {
  test(`${motion}: the loop closes for every agent at full intensity`, () => {
    for (const offset of [.12, .28, .41, .6, .76]) {
      const start = agentPose(motion, 0, offset, 100), end = agentPose(motion, 1, offset, 100)
      for (const key of Object.keys(start)) assert.ok(Math.abs(start[key] - end[key]) < 1e-9, key)
    }
  })
}
test('zero intensity removes spatial motion', () => {
  for (const mode of ['float', 'orbit', 'bounce', 'waves']) {
    const pose = agentPose(mode, .25, .12, 0)
    assert.equal(Math.abs(pose.x), 0); assert.equal(Math.abs(pose.y), 0)
    assert.equal(pose.scaleX, 1); assert.equal(pose.scaleY, 1)
  }
})
test('local drafts migrate once and other signed-in accounts use separate keys', () => {
  const values = new Map([[model.STORAGE_KEY, '{"city":"Loja"}']])
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } })
  try {
    const first = storageForSession({ id: 'first', email: 'a@example.test', name: 'A' })
    const second = storageForSession({ id: 'second', email: 'b@example.test', name: 'B' })
    assert.equal(values.get(first.design), '{"city":"Loja"}')
    assert.notEqual(first.design, second.design)
    assert.notEqual(first.events, second.events)
    assert.equal(values.get(second.design), undefined)
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
})
