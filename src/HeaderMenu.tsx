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
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#prices">Prices</a>
        <a href="#contacts">Contacts</a>
        <a href="#about">About</a>
      </nav>
    </header>
  )
}
