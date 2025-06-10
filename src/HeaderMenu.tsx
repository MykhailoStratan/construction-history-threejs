import { useState } from 'react'
import './HeaderMenu.css'

export default function HeaderMenu() {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(!open)

  return (
    <header className="header-menu">
      <button className="menu-toggle" aria-label="Toggle menu" onClick={toggle}>
        ☰
      </button>
      <nav className={`menu-items${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        <button>Home</button>
        <button>Services</button>
        <button>Prices</button>
        <button>Contacts</button>
        <button>About</button>
      </nav>
    </header>
  )
}
