"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/content/site";
export default function Header(){
const path=usePathname();const [open,setOpen]=useState(false);const toggle=useRef<HTMLButtonElement>(null);
useEffect(()=>{const close=(e:KeyboardEvent)=>{if(open&&e.key==="Escape"){setOpen(false);toggle.current?.focus();}};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[open]);
return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="studio-wrap header-inner"><Link href="/" onClick={()=>setOpen(false)} aria-label="Global Virtual Experts home"><Image className="brand-logo" src="/brand/gve-header-mark.svg" alt="Global Virtual Experts" width={500} height={500} priority/></Link><nav aria-label="Main" className="desktop-nav">{nav.map(n=><Link key={n.href} href={n.href} aria-current={path===n.href||path.startsWith(n.href+"/")?"page":undefined}>{n.label}</Link>)}</nav><Link href="/contact-us/#book" onClick={()=>setOpen(false)} className="button amber header-call">Book a free call</Link><button ref={toggle} className="mobile-toggle" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={()=>setOpen(!open)}>{open?"×":"☰"}</button></div>{open&&<nav id="mobile-menu" className="mobile-navigation" aria-label="Mobile">{[...nav,{href:"/contact-us/#book",label:"Book a free call"}].map(n=><Link href={n.href} key={n.href} onClick={()=>setOpen(false)} aria-current={path===n.href||path.startsWith(n.href+"/")?"page":undefined}>{n.label}</Link>)}</nav>}</header></>;
}
