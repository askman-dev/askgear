import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import fs from 'node:fs'
import path from 'node:path'

function loadEnv() {
  const p = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(p)) return {}
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/)
  const env = {}
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

function toDataURL(abs, mime = 'image/jpeg') {
  const buf = fs.readFileSync(abs)
  return `data:${mime};base64,${buf.toString('base64')}`
}

function promptForK12() {
  return [
    '你是 K12（5-12 岁）题目抽取助手。',
    '从给定的单张题目图片中，识别出一组题目。',
    '仅输出 JSON，禁止输出任何解释/Markdown。',
    'JSON 结构如下：',
    '{"questions":[{"id":string,"text":string}]}',
    '要求：',
    '- text 为题目的完整文字描述（题干/选项可合并为一段）。',
    '- 不要输出除 JSON 外的任何字符。',
  ].join('\n')
}

function extractJSONObject(text) {
  const match = text.match(/\{[\s\S]*\}$/)
  if (!match) return null
  try { return JSON.parse(match[0]) } catch { return null }
}

function validateResult(obj) {
  if (!obj || !Array.isArray(obj.questions) || obj.questions.length === 0) {
    throw new Error('questions 数组为空')
  }
  const q = obj.questions[0]
  if (typeof q.id !== 'string' || typeof q.text !== 'string' || !q.text.trim()) {
    throw new Error('问题缺少 id/text')
  }
}

async function main() {
  const env = loadEnv()
  const apiKey = env.VITE_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('缺少 VITE_OPENROUTER_API_KEY')
    process.exit(2)
  }
  const MINI_MODEL = env.MINI_MODEL || env.VITE_MINI_MODEL || 'openai/gpt-5-mini'
  const client = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    headers: { 'HTTP-Referer': 'https://askgear.app', 'X-Title': 'AskGear' }
  })

  const abs = path.resolve(process.cwd(), 'public/presets/seamo-2022-paper-a.jpg')
  if (!fs.existsSync(abs)) {
    console.error('图片不存在: ', abs)
    process.exit(2)
  }
  const dataUrl = toDataURL(abs, 'image/jpeg')

  const messages = [
    { role: 'system', content: promptForK12() },
    { role: 'user', content: [ { type: 'text', text: '输出结构化 JSON 对象。' }, { type: 'image', image: dataUrl } ] }
  ]

  const { textStream } = await streamText({
    model: client.chat(MINI_MODEL),
    messages,
  })

  let full = ''
  for await (const chunk of textStream) {
    full += chunk
    const tail = full.slice(-160).replace(/\n/g, ' ')
    process.stdout.write(`\r…${tail}`)
  }
  process.stdout.write('\n')

  const obj = extractJSONObject(full)
  validateResult(obj)
  console.log('\nPASS: 识别对象有效，题目数=', obj.questions.length)
}

main().catch((e) => {
  console.error('\nFAIL:', e?.message || e)
  process.exit(1)
})
