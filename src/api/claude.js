const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'

async function callClaude(prompt, maxTokens = 300) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(res.status)
    const data = await res.json()
    return data.content?.[0]?.text?.trim() ?? null
  } catch (err) {
    console.warn('Claude API:', err.message)
    return null
  }
}

// Generate a random in-game event
export async function generateRandomEvent(gameState) {
  const prompt = `Du bist Erzähler für "GrimLedger", ein Idle-RPG. Der Spieler ist Händler, Schmied, Dungeon-Manager, Nekromant und Tavernen-Besitzer.

Spieler-Status: Level ${gameState.player.level}, ${Math.floor(gameState.gold)} Gold, ${gameState.undead.length} Untote Diener, Verlies Stufe ${gameState.buildings.dungeon.level}.

Erstelle ein kurzes, atmosphärisches Ereignis auf Deutsch. NUR JSON, kein Markdown:
{"title":"...(max 5 Wörter)","msg":"...(max 25 Wörter, düster-fantasievoll)","goldChange":0,"type":"bonus|neutral|penalty"}`

  const raw = await callClaude(prompt, 200)
  if (!raw) return null

  try {
    const clean = raw.replace(/```[a-z]*|```/g, '').trim()
    return JSON.parse(clean)
  } catch { return null }
}

// Generate hero dialogue
export async function generateHeroSpeech(heroName, heroClass, tavernLevel) {
  const prompt = `Du spielst ${heroName}, ein${['Krieger','Magier','Barbar'].includes(heroClass) ? 'en' : 'e'} ${heroClass} in einer mittelalterlichen Taverne (Stufe ${tavernLevel}). Sag genau EINEN atmosphärischen Satz auf Deutsch, max. 12 Wörter. Nur den Satz, nichts anderes.`

  return callClaude(prompt, 100)
}
