import { useState } from 'react'

/* ====== Edit event content here ====== */
const EVENT = {
  venue: 'IT Hub, Nizamabad, Telangana',
  mapQuery: 'IT Hub Nizamabad Telangana', // replace with the exact address for a precise pin
  date: 'Dates announced soon',
}
const GUESTS = [ // placeholders until confirmed
  { role: 'Chief guest', name: 'To be announced' },
  { role: 'Guest of honour', name: 'To be announced' },
  { role: 'Celebrity performer', name: 'To be announced' },
  { role: 'Anchor and host', name: 'To be announced' },
]
const HIGHLIGHTS = [
  ['Musical night', 'Live music after the demos, with the whole hall on its feet.'],
  ['Stay provided', 'Rest between rounds. Accommodation is on us.'],
  ['Food provided', 'Meals and snacks through the night, Veg and Non-Veg.'],
  ['Hampers', 'Every participant takes home a GenIgnite hamper.'],
  ['Participation certificate', 'Every registered student receives a certificate.'],
  ['Bring your own gear', 'Carry your laptop, charger and personal belongings.'],
]
const BRANCHES = ['CSE','IT','AI & ML','Data Science','Cybersecurity','ECE','EEE','Other IT-related']
const SIZES = ['S','M','L','XL','XXL']
const TECH = ['Generative AI','Agentic AI','LLMs & RAG','Machine Learning','Computer Vision','Cybersecurity','Data Science','IoT & Embedded','Blockchain','Cloud & DevOps','AR / VR','Full-Stack Web']
const FEES = { INDIVIDUAL: 899, TEAM: 2199, STALL: 15000 }
const TITLES = { INDIVIDUAL: 'Individual registration', TEAM: 'Team registration', STALL: 'Stall booking' }
const configuredApi = import.meta.env.VITE_API_URL?.trim()
const API = configuredApi && (configuredApi.startsWith('https://') || configuredApi.startsWith('http://'))
  ? configuredApi.replace(/\/+$/, '')
  : 'https://genignitetestbackend.onrender.com/api'
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(EVENT.mapQuery)
const blank = () => ({ name:'', email:'', phone:'', college:'', branch:'', year:'', tshirt:'', food:'' })

async function post(path, body) {
  const res = await fetch(API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
  return data
}
const Field = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>

function MemberCard({ m, i, kind, onChange }) {
  const set = k => e => onChange(i, k, e.target.value)
  const stall = kind === 'STALL'
  const title = kind === 'INDIVIDUAL' ? 'Your details' : i === 0 ? (stall ? 'Stall lead' : 'Team leader') : `Member ${i + 1}`
  return (
    <fieldset className="card">
      <legend>{title}</legend>
      <div className="grid">
        <Field label="Full name"><input value={m.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Email"><input type="email" value={m.email} onChange={set('email')} /></Field>
        <Field label="Mobile number"><input inputMode="numeric" maxLength={10} value={m.phone} onChange={set('phone')} /></Field>
        <Field label={stall ? 'Company or organisation (optional)' : 'College name'}><input value={m.college} onChange={set('college')} /></Field>
        {!stall && <>
          <Field label="Branch"><select value={m.branch} onChange={set('branch')}><option value="">Select branch</option>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Year of study"><select value={m.year} onChange={set('year')}><option value="">Select year</option><option>3rd Year</option><option>4th Year</option></select></Field>
        </>}
        <Field label="T-shirt size"><select value={m.tshirt} onChange={set('tshirt')}><option value="">Select size</option>{SIZES.map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Food preference"><div className="seg">{['Veg','Non-Veg'].map(f => <button type="button" key={f} className={m.food === f ? 'on' : ''} onClick={() => onChange(i, 'food', f)}>{f}</button>)}</div></Field>
      </div>
    </fieldset>
  )
}

export default function App() {
  const [type, setType] = useState(null)
  const [members, setMembers] = useState([])
  const [teamName, setTeamName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [abstractText, setAbstract] = useState('')
  const [tech, setTech] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(null)

  const jump = () => setTimeout(() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' }), 30)
  const choose = t => { setType(t); setMembers(Array.from({ length: t === 'TEAM' ? 3 : t === 'STALL' ? 3 : 1 }, blank)); setErr(''); jump() }
  const back = () => { setType(null); setErr(''); jump() }
  const change = (i, k, v) => setMembers(ms => ms.map((m, j) => j === i ? { ...m, [k]: v } : m))
  const toggle = t => setTech(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t])
  const addMember = () => members.length < 5 && setMembers(ms => [...ms, blank()])
  const dropMember = () => members.length > 3 && setMembers(ms => ms.slice(0, -1))

  const validate = () => {
    const stall = type === 'STALL'
    if (type !== 'INDIVIDUAL' && !teamName.trim()) return stall ? 'Enter your stall name.' : 'Enter your team name.'
    if (!stall && !projectName.trim()) return 'Enter your project name.'
    if (!abstractText.trim()) return stall ? 'Describe what you will showcase.' : 'Write a short abstract of your project.'
    const need = stall ? ['name','email','phone','tshirt','food'] : Object.keys(blank())
    for (const [i, m] of members.entries()) {
      const who = type === 'INDIVIDUAL' ? '' : `Member ${i + 1}: `
      if (need.some(k => !String(m[k]).trim())) return `${who}fill in every required field.`
      if (!/^\S+@\S+\.\S+$/.test(m.email)) return `${who}enter a valid email.`
      if (!/^\d{10}$/.test(m.phone)) return `${who}mobile number must be 10 digits.`
    }
    return ''
  }

  const submitRegistration = async () => {
    const msg = validate()
    if (msg) return setErr(msg)

    setErr('')
    setBusy(true)
    try {
      const result = await post('/registrations/order', {
        type,
        teamName,
        projectName,
        abstractText,
        techInterests: tech.join(', '),
        members,
      })
      setDone(result)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <nav className="nav">
        <a href="https://genignitetechnologies.in/" className="logo" target="_blank" rel="noreferrer">GenIgnite</a>
        <div className="links"><a href="#highlights">Highlights</a><a href="#prizes">Prizes</a><a href="#guests">Guests</a><a href="#stalls">Stalls</a><a href="#venue">Venue</a></div>
        <a href="#register" className="navcta">Register</a>
      </nav>

      <header className="hero" id="top">
        <div className="stage" aria-hidden="true">
          <i className="beam b1" /><i className="beam b2" /><i className="beam b3" /><i className="beam b4" /><i className="floor" />
        </div>
        <div className="hero-in">
          <p className="brand">GenIgnite Technologies presents</p>
          <h1>GenZ Hackers Night</h1>
          <p className="lead">India's all-night hackathon for B.Tech 3rd and 4th year students. Build a unique AI idea, pitch it on stage, and walk away with prizes, a pre-placement offer, and a night of live music.</p>
          <div className="row"><a className="cta big" href="#register">Register now</a><a className="ghost" href="#prizes">See what you can win</a></div>
          <dl className="facts">
            <div><dt>Where</dt><dd>IT Hub, Nizamabad</dd></div>
            <div><dt>When</dt><dd>{EVENT.date}</dd></div>
            <div><dt>Who</dt><dd>B.Tech 3rd and 4th year</dd></div>
            <div><dt>Fee</dt><dd>₹899 solo, ₹2,199 per team of 3</dd></div>
          </dl>
        </div>
      </header>

      <section className="sec" id="highlights">
        <h2>Everything is taken care of</h2>
        <p className="sub">Show up with your laptop and your idea. We handle the rest.</p>
        <div className="tiles">
          {HIGHLIGHTS.map(([t, d], i) => (
            <article key={t} className={'tile' + (i === 0 ? ' music' : '')}>
              {i === 0 && <div className="eq" aria-hidden="true">{Array.from({ length: 9 }, (_, k) => <span key={k} style={{ animationDelay: `${k * 0.12}s` }} />)}</div>}
              <h3>{t}</h3><p>{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec" id="prizes">
        <h2>Prizes and opportunities</h2>
        <div className="podium">
          <div className="pz p2"><small>Second prize</small><b>₹25,000</b></div>
          <div className="pz p1"><small>First prize</small><b>₹50,000</b></div>
          <div className="pz p3"><small>Third prize</small><b>A special gift</b></div>
        </div>
        <div className="two">
          <article className="card"><h3>Pre-placement offers</h3><p>The best ideas get picked, and their teams receive a pre-placement offer.</p></article>
          <article className="card"><h3>Interview opportunity</h3><p>Any unique idea can earn an invitation to attend an interview with us, even outside the podium.</p></article>
          <article className="card"><h3>What we look for</h3><p>Your idea must be unique, and it should be AI-powered. Copies of common projects will not make the cut.</p></article>
        </div>
        <p className="sub">Build with</p>
        <div className="chips">{TECH.map(t => <span key={t}>{t}</span>)}</div>
      </section>

      <section className="sec" id="guests">
        <h2>Guests on the night</h2>
        <p className="sub">Our chief guest, celebrity and anchor are being finalised. Names will appear here as soon as they are confirmed.</p>
        <div className="tiles four">{GUESTS.map(g => <article key={g.role} className="tile guest"><div className="avatar" aria-hidden="true" /><h3>{g.name}</h3><p>{g.role}</p></article>)}</div>
      </section>

      <section className="sec" id="stalls">
        <div className="stallbox">
          <div><h2>Want a stall at the event?</h2><p>Showcase your product or brand to hundreds of student developers. A stall team has 3 to 5 members.</p></div>
          <div className="stallprice"><b>₹15,000</b><button className="cta" onClick={() => choose('STALL')}>Book a stall</button></div>
        </div>
      </section>

      <section className="sec" id="venue">
        <h2>Venue</h2>
        <p className="sub">GenIgnite Technologies, {EVENT.venue}. Select the map to open it in Google Maps.</p>
        <div className="map">
          <iframe title="Venue map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(EVENT.mapQuery)}&output=embed`} />
          <a className="maplink" href={MAPS_URL} target="_blank" rel="noreferrer" aria-label="Open venue in Google Maps"><span>Open in Google Maps</span></a>
        </div>
      </section>

      <section className="sec reg" id="register">
        {done ? (
          <div className="card success">
            <h2>Registration submitted!</h2>
            <p>{done.message || 'Your registration has been received.'}</p>
            <strong className="rid">{done.registrationId}</strong>
            <p>Status: <b>{done.status || 'PENDING'}</b></p>
            <p>Keep this registration ID safe. Online payment is not enabled yet; the registration fee has not been charged. Please wait for payment instructions from the organisers.</p>
          </div>
        ) : !type ? (
          <>
            <h2>Register</h2>
            <div className="choices">
              <button className="choice" onClick={() => choose('INDIVIDUAL')}><b>Individual</b><span className="price">₹899</span><small>Register on your own</small></button>
              <button className="choice" onClick={() => choose('TEAM')}><b>Team of 3</b><span className="price">₹2,199</span><small>One payment for all three members</small></button>
              <button className="choice" onClick={() => choose('STALL')}><b>Stall</b><span className="price">₹15,000</span><small>3 to 5 members, for companies and creators</small></button>
            </div>
            <p className="note">Hackathon entries are open to B.Tech 3rd and 4th year students. Registered students receive a participation certificate.</p>
          </>
        ) : (
          <>
            <button className="back" onClick={back}>← Back</button>
            <h2>{TITLES[type]}</h2>
            {type !== 'INDIVIDUAL' && <fieldset className="card"><legend>{type === 'STALL' ? 'Stall' : 'Team'}</legend><Field label={type === 'STALL' ? 'Stall or brand name' : 'Team name'}><input value={teamName} onChange={e => setTeamName(e.target.value)} /></Field></fieldset>}
            <fieldset className="card"><legend>{type === 'STALL' ? 'What you will showcase' : 'Your project'}</legend>
              {type !== 'STALL' && <Field label="Project name"><input value={projectName} onChange={e => setProjectName(e.target.value)} /></Field>}
              <Field label={type === 'STALL' ? 'Description' : 'Abstract (what it does, who it helps, how AI is used)'}><textarea rows={5} maxLength={3000} value={abstractText} onChange={e => setAbstract(e.target.value)} /></Field>
            </fieldset>
            {members.map((m, i) => <MemberCard key={i} m={m} i={i} kind={type} onChange={change} />)}
            {type === 'STALL' && <div className="row"><button className="ghost" onClick={addMember} disabled={members.length >= 5}>Add member</button><button className="ghost" onClick={dropMember} disabled={members.length <= 3}>Remove member</button></div>}
            {type !== 'STALL' && <fieldset className="card"><legend>Technologies you want to build with</legend><div className="chips pick">{TECH.map(t => <button type="button" key={t} className={tech.includes(t) ? 'on' : ''} onClick={() => toggle(t)}>{t}</button>)}</div></fieldset>}
            {err && <p className="error" role="alert">{err}</p>}
            <button className="cta" disabled={busy} onClick={submitRegistration}>{busy ? 'Submitting…' : 'Submit registration'}</button>
            <p className="note">Submitting this form saves your registration as pending. Online payment is not enabled yet.</p>
          </>
        )}
      </section>

      <footer>
        <div className="lead-row">
          <div><b>Anga Neha Yadav</b><span>CEO, GenIgnite Technologies</span></div>
          <div><b>Mahipal Anga</b><span>Director, GenIgnite Technologies</span></div>
        </div>
        <small>© {new Date().getFullYear()} GenIgnite Technologies, Nizamabad. All rights reserved.</small>
      </footer>
    </>
  )
}
