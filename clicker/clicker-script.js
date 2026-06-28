/* ===================================================
   HEARTBEAT CLICKER — script.js
   Modular game engine: state · upgrades · UI · loop
=================================================== */

"use strict";

// ═══════════════════════════════════════════════════
// 1. UTILITIES
// ═══════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);

function fmt(n) {
  if (n < 1e3)  return n.toFixed(n < 10 ? 1 : 0);
  if (n < 1e6)  return (n / 1e3).toFixed(2) + "K";
  if (n < 1e9)  return (n / 1e6).toFixed(2) + "M";
  if (n < 1e12) return (n / 1e9).toFixed(2) + "B";
  if (n < 1e15) return (n / 1e12).toFixed(2) + "T";
  if (n < 1e18) return (n / 1e15).toFixed(2) + "Qa";
  return (n / 1e18).toFixed(2) + "Qi";
}

function fmtShort(n) {
  if (n < 1e3)  return n.toFixed(1);
  if (n < 1e6)  return (n / 1e3).toFixed(1) + "K";
  if (n < 1e9)  return (n / 1e6).toFixed(1) + "M";
  if (n < 1e12) return (n / 1e9).toFixed(1) + "B";
  if (n < 1e15) return (n / 1e12).toFixed(1) + "T";
  return (n / 1e15).toFixed(1) + "Qa";
}

function fmtTime(s) {
  if (s < 60)    return s + "s";
  if (s < 3600)  return Math.floor(s / 60) + "m " + (s % 60) + "s";
  if (s < 86400) return Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m";
  return Math.floor(s / 86400) + "d " + Math.floor((s % 86400) / 3600) + "h";
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ═══════════════════════════════════════════════════
// 2. SVG ICON LIBRARY
// ═══════════════════════════════════════════════════
const ICONS = {
  cursor:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-7 1-4 6L5 3z"/></svg>`,
  zap:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  star:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  flame:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`,
  droplets:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0014 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 01-11.91 4.97"/></svg>`,
  heart:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/></svg>`,
  music:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  sun:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  wind:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
  cpu:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  gem:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="3" x2="12" y2="22"/></svg>`,
  infinity:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z"/><path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/></svg>`,
  gift:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  shield:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  bolt:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="13" y1="2" x2="3" y2="14" /><polygon points="13 2 23 14 13 14 11 22 1 10 11 10 13 2"/></svg>`,
  crown:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20l2-10 6 6 4-10 4 10-2-10"/></svg>`,
  diamond:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/></svg>`,
  leaf:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.63a.5.5 0 0 0 .68.68C8 18 14 15 17 8z"/><path d="M3.83 19.62c.86-1.1 3.06-3.15 7.17-3.62"/></svg>`,
  rocket:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m3.5 11.5 5 5"/><path d="M19.69 5.79l-2.6 2.6A2 2 0 0 1 15.68 9H8.82a2 2 0 0 0-1.41.59L3 14l4 1 1 4 4.41-4.41A2 2 0 0 0 13 13.18V6.32a2 2 0 0 1 .59-1.41l2.6-2.6a2 2 0 0 1 2.83 0l.67.67a2 2 0 0 1 0 2.81z"/></svg>`,
  snowflake:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`,
  flask:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v8l4 9H5l4-9V3z"/><line x1="6" y1="14" x2="18" y2="14"/></svg>`,
  eye:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  ghost:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>`,
  layers:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  compass:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  award:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  trophy:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
};

// ═══════════════════════════════════════════════════
// 3. UPGRADE DEFINITIONS  (55 upgrades)
// ═══════════════════════════════════════════════════
const UPGRADE_DEFS = [
  // ── CLICK upgrades ─────────────────────────────
  { id:"c01", cat:"click",      icon:"cursor",    name:"Gentle Touch",        desc:"+0.1 per click",            baseCost:10,      effect:{ clickBonus:0.1 } },
  { id:"c02", cat:"click",      icon:"zap",       name:"Firm Press",          desc:"+0.5 per click",            baseCost:50,      effect:{ clickBonus:0.5 } },
  { id:"c03", cat:"click",      icon:"flame",     name:"Passionate Click",    desc:"+1 per click",              baseCost:150,     effect:{ clickBonus:1 } },
  { id:"c04", cat:"click",      icon:"bolt",      name:"Electric Touch",      desc:"+5 per click",              baseCost:600,     effect:{ clickBonus:5 } },
  { id:"c05", cat:"click",      icon:"star",      name:"Star Tap",            desc:"+10 per click",             baseCost:2500,    effect:{ clickBonus:10 } },
  { id:"c06", cat:"click",      icon:"rocket",    name:"Rocket Punch",        desc:"+25 per click",             baseCost:8000,    effect:{ clickBonus:25 } },
  { id:"c07", cat:"click",      icon:"gem",       name:"Diamond Finger",      desc:"+75 per click",             baseCost:30000,   effect:{ clickBonus:75 } },
  { id:"c08", cat:"click",      icon:"crown",     name:"Royal Tap",           desc:"+200 per click",            baseCost:150000,  effect:{ clickBonus:200 } },
  { id:"c09", cat:"click",      icon:"diamond",   name:"Crystal Hand",        desc:"+600 per click",            baseCost:800000,  effect:{ clickBonus:600 } },
  { id:"c10", cat:"click",      icon:"infinity",  name:"Infinite Press",      desc:"+2000 per click",           baseCost:5e6,     effect:{ clickBonus:2000 } },
  { id:"c11", cat:"click",      icon:"ghost",     name:"Phantom Strike",      desc:"+8000 per click",           baseCost:40e6,    effect:{ clickBonus:8000 } },
  { id:"c12", cat:"click",      icon:"eye",       name:"Third Eye Tap",       desc:"+25K per click",            baseCost:350e6,   effect:{ clickBonus:25000 } },
  { id:"c13", cat:"click",      icon:"layers",    name:"Dimensional Press",   desc:"+100K per click",           baseCost:3e9,     effect:{ clickBonus:1e5 } },

  // ── PASSIVE upgrades ───────────────────────────
  { id:"p01", cat:"passive",    icon:"droplets",  name:"Slow Drip",           desc:"+0.2 per second",           baseCost:25,      effect:{ passiveBonus:0.2 } },
  { id:"p02", cat:"passive",    icon:"wind",      name:"Love Breeze",         desc:"+1 per second",             baseCost:100,     effect:{ passiveBonus:1 } },
  { id:"p03", cat:"passive",    icon:"music",     name:"Heartbeat Rhythm",    desc:"+3 per second",             baseCost:400,     effect:{ passiveBonus:3 } },
  { id:"p04", cat:"passive",    icon:"sun",       name:"Solar Glow",          desc:"+8 per second",             baseCost:1500,    effect:{ passiveBonus:8 } },
  { id:"p05", cat:"passive",    icon:"moon",      name:"Moonlit Flow",        desc:"+20 per second",            baseCost:5000,    effect:{ passiveBonus:20 } },
  { id:"p06", cat:"passive",    icon:"leaf",      name:"Garden of Hearts",    desc:"+50 per second",            baseCost:18000,   effect:{ passiveBonus:50 } },
  { id:"p07", cat:"passive",    icon:"flask",     name:"Love Potion",         desc:"+120 per second",           baseCost:65000,   effect:{ passiveBonus:120 } },
  { id:"p08", cat:"passive",    icon:"snowflake", name:"Frost Bloom",         desc:"+300 per second",           baseCost:280000,  effect:{ passiveBonus:300 } },
  { id:"p09", cat:"passive",    icon:"cpu",       name:"Neural Love",         desc:"+800 per second",           baseCost:1.5e6,   effect:{ passiveBonus:800 } },
  { id:"p10", cat:"passive",    icon:"rocket",    name:"Orbital Station",     desc:"+2K per second",            baseCost:8e6,     effect:{ passiveBonus:2000 } },
  { id:"p11", cat:"passive",    icon:"compass",   name:"Heart Compass",       desc:"+6K per second",            baseCost:50e6,    effect:{ passiveBonus:6000 } },
  { id:"p12", cat:"passive",    icon:"ghost",     name:"Spirit Garden",       desc:"+20K per second",           baseCost:400e6,   effect:{ passiveBonus:20000 } },
  { id:"p13", cat:"passive",    icon:"gem",       name:"Gem Reactor",         desc:"+80K per second",           baseCost:4e9,     effect:{ passiveBonus:80000 } },
  { id:"p14", cat:"passive",    icon:"diamond",   name:"Diamond Pulse",       desc:"+300K per second",          baseCost:40e9,    effect:{ passiveBonus:3e5 } },
  { id:"p15", cat:"passive",    icon:"infinity",  name:"Eternal Flow",        desc:"+1M per second",            baseCost:500e9,   effect:{ passiveBonus:1e6 } },

  // ── MULTIPLIER upgrades ────────────────────────
  { id:"m01", cat:"multiplier", icon:"star",      name:"Warm Feeling",        desc:"x1.25 all income",          baseCost:200,     effect:{ multiplier:1.25 } },
  { id:"m02", cat:"multiplier", icon:"flame",     name:"Burning Love",        desc:"x1.5 all income",           baseCost:1200,    effect:{ multiplier:1.5 } },
  { id:"m03", cat:"multiplier", icon:"heart",     name:"Open Heart",          desc:"x2 all income",             baseCost:6000,    effect:{ multiplier:2.0 } },
  { id:"m04", cat:"multiplier", icon:"sun",       name:"Golden Aura",         desc:"x2.5 all income",           baseCost:35000,   effect:{ multiplier:2.5 } },
  { id:"m05", cat:"multiplier", icon:"zap",       name:"Thunder Love",        desc:"x3 all income",             baseCost:200000,  effect:{ multiplier:3.0 } },
  { id:"m06", cat:"multiplier", icon:"shield",    name:"Love Shield",         desc:"x4 all income",             baseCost:1.2e6,   effect:{ multiplier:4.0 } },
  { id:"m07", cat:"multiplier", icon:"crown",     name:"Divine Blessing",     desc:"x5 all income",             baseCost:8e6,     effect:{ multiplier:5.0 } },
  { id:"m08", cat:"multiplier", icon:"gem",       name:"Gem Amplifier",       desc:"x7 all income",             baseCost:70e6,    effect:{ multiplier:7.0 } },
  { id:"m09", cat:"multiplier", icon:"rocket",    name:"Supernova",           desc:"x10 all income",            baseCost:700e6,   effect:{ multiplier:10.0 } },
  { id:"m10", cat:"multiplier", icon:"infinity",  name:"Infinite Love",       desc:"x15 all income",            baseCost:8e9,     effect:{ multiplier:15.0 } },
  { id:"m11", cat:"multiplier", icon:"diamond",   name:"Singularity",         desc:"x25 all income",            baseCost:100e9,   effect:{ multiplier:25.0 } },
  { id:"m12", cat:"multiplier", icon:"trophy",    name:"Legendary Heart",     desc:"x50 all income",            baseCost:1.5e12,  effect:{ multiplier:50.0 } },

  // ── CLICK MULTIPLIER ───────────────────────────
  { id:"cm1", cat:"multiplier", icon:"bolt",      name:"Quick Hands",         desc:"x1.5 click value",          baseCost:500,     effect:{ clickMultiplier:1.5 } },
  { id:"cm2", cat:"multiplier", icon:"flame",     name:"Hot Hands",           desc:"x2 click value",            baseCost:3000,    effect:{ clickMultiplier:2.0 } },
  { id:"cm3", cat:"multiplier", icon:"rocket",    name:"Speed Fingers",       desc:"x3 click value",            baseCost:25000,   effect:{ clickMultiplier:3.0 } },
  { id:"cm4", cat:"multiplier", icon:"zap",       name:"Lightning Reflex",    desc:"x5 click value",            baseCost:200000,  effect:{ clickMultiplier:5.0 } },
  { id:"cm5", cat:"multiplier", icon:"crown",     name:"King's Grasp",        desc:"x8 click value",            baseCost:2e6,     effect:{ clickMultiplier:8.0 } },
  { id:"cm6", cat:"multiplier", icon:"diamond",   name:"Diamond Tempo",       desc:"x12 click value",           baseCost:20e6,    effect:{ clickMultiplier:12.0 } },

  // ── PASSIVE MULTIPLIER ─────────────────────────
  { id:"pm1", cat:"multiplier", icon:"leaf",      name:"Fertile Ground",      desc:"x1.5 passive income",       baseCost:800,     effect:{ passiveMultiplier:1.5 } },
  { id:"pm2", cat:"multiplier", icon:"wind",      name:"Tailwind",            desc:"x2 passive income",         baseCost:5500,    effect:{ passiveMultiplier:2.0 } },
  { id:"pm3", cat:"multiplier", icon:"moon",      name:"Midnight Garden",     desc:"x3 passive income",         baseCost:45000,   effect:{ passiveMultiplier:3.0 } },
  { id:"pm4", cat:"multiplier", icon:"sun",       name:"Solar Farm",          desc:"x5 passive income",         baseCost:400000,  effect:{ passiveMultiplier:5.0 } },
  { id:"pm5", cat:"multiplier", icon:"gem",       name:"Crystal Grid",        desc:"x8 passive income",         baseCost:4e6,     effect:{ passiveMultiplier:8.0 } },
  { id:"pm6", cat:"multiplier", icon:"compass",   name:"Ley Lines",           desc:"x12 passive income",        baseCost:45e6,    effect:{ passiveMultiplier:12.0 } },

  // ── SPECIAL ────────────────────────────────────
  { id:"s01", cat:"click",      icon:"gift",      name:"Love Bomb",           desc:"+100 click, +50/s",         baseCost:100000,  effect:{ clickBonus:100, passiveBonus:50 } },
  { id:"s02", cat:"passive",    icon:"layers",    name:"Layered Love",        desc:"+500/s + x1.2 all",         baseCost:900000,  effect:{ passiveBonus:500, multiplier:1.2 } },
  { id:"s03", cat:"multiplier", icon:"award",     name:"Grand Unifier",       desc:"+2K click, x2 all",         baseCost:12e6,    effect:{ clickBonus:2000, multiplier:2.0 } },
  { id:"s04", cat:"click",      icon:"compass",   name:"Heart Compass",       desc:"+10K click, x1.5 click",    baseCost:150e6,   effect:{ clickBonus:10000, clickMultiplier:1.5 } },
  { id:"s05", cat:"passive",    icon:"trophy",    name:"Hall of Hearts",      desc:"+100K/s, x2 passive",       baseCost:2e9,     effect:{ passiveBonus:100000, passiveMultiplier:2.0 } },
];

// ═══════════════════════════════════════════════════
// 4. ACHIEVEMENT DEFINITIONS
// ═══════════════════════════════════════════════════
const ACHIEVEMENT_DEFS = [
  { id:"a01", icon:"heart",    name:"First Beat",          desc:"Click the heart once",              check: s => s.totalClicks >= 1 },
  { id:"a02", icon:"zap",      name:"Getting Warmed Up",   desc:"Click 50 times",                    check: s => s.totalClicks >= 50 },
  { id:"a03", icon:"flame",    name:"Click Machine",       desc:"Click 500 times",                   check: s => s.totalClicks >= 500 },
  { id:"a04", icon:"bolt",     name:"Tapper Supreme",      desc:"Click 5,000 times",                 check: s => s.totalClicks >= 5000 },
  { id:"a05", icon:"crown",    name:"Click Legend",        desc:"Click 50,000 times",                check: s => s.totalClicks >= 50000 },
  { id:"a06", icon:"star",     name:"First Hundred",       desc:"Earn 100 hearts",                   check: s => s.totalEarned >= 100 },
  { id:"a07", icon:"droplets", name:"Thousand Drops",      desc:"Earn 1,000 hearts",                 check: s => s.totalEarned >= 1000 },
  { id:"a08", icon:"sun",      name:"Golden Milestone",    desc:"Earn 100K hearts",                  check: s => s.totalEarned >= 1e5 },
  { id:"a09", icon:"rocket",   name:"Millionaire",         desc:"Earn 1 Million hearts",             check: s => s.totalEarned >= 1e6 },
  { id:"a10", icon:"gem",      name:"Billionaire",         desc:"Earn 1 Billion hearts",             check: s => s.totalEarned >= 1e9 },
  { id:"a11", icon:"diamond",  name:"Trillionaire",        desc:"Earn 1 Trillion hearts",            check: s => s.totalEarned >= 1e12 },
  { id:"a12", icon:"infinity", name:"Beyond Counting",     desc:"Earn 1 Quadrillion hearts",         check: s => s.totalEarned >= 1e15 },
  { id:"a13", icon:"compass",  name:"First Purchase",      desc:"Buy your first upgrade",            check: s => s.upgradesPurchased >= 1 },
  { id:"a14", icon:"layers",   name:"Collector",           desc:"Buy 10 upgrades",                   check: s => s.upgradesPurchased >= 10 },
  { id:"a15", icon:"shield",   name:"Dedicated",           desc:"Buy 25 upgrades",                   check: s => s.upgradesPurchased >= 25 },
  { id:"a16", icon:"trophy",   name:"Full Arsenal",        desc:"Buy 50 upgrades",                   check: s => s.upgradesPurchased >= 50 },
  { id:"a17", icon:"moon",     name:"Night Owl",           desc:"Play for 5 minutes",                check: s => s.playTime >= 300 },
  { id:"a18", icon:"sun",      name:"Dedicated Player",    desc:"Play for 30 minutes",               check: s => s.playTime >= 1800 },
  { id:"a19", icon:"music",    name:"Passive Master",      desc:"Reach 1K hearts/second",            check: s => s.computed.totalPPS >= 1000 },
  { id:"a20", icon:"crown",    name:"Income King",         desc:"Reach 1M hearts/second",            check: s => s.computed.totalPPS >= 1e6 },
];

// ═══════════════════════════════════════════════════
// 5. MILESTONE DEFINITIONS
// ═══════════════════════════════════════════════════
const MILESTONE_DEFS = [
  { label:"100 Hearts",      threshold:100 },
  { label:"10K Hearts",      threshold:10000 },
  { label:"1M Hearts",       threshold:1e6 },
  { label:"1B Hearts",       threshold:1e9 },
  { label:"1T Hearts",       threshold:1e12 },
  { label:"1 Qa Hearts",     threshold:1e15 },
];

// ═══════════════════════════════════════════════════
// 6. GAME STATE
// ═══════════════════════════════════════════════════
const DEFAULT_STATE = {
  points: 0,
  totalEarned: 0,
  totalClicks: 0,
  upgradesPurchased: 0,
  upgrades: {}, // id -> count purchased
  achievements: {}, // id -> true
  playTime: 0, // seconds
  computed: {
    baseClickValue: 0.1,
    clickBonus: 0,
    clickMultiplier: 1,
    passiveBonus: 0,
    passiveMultiplier: 1,
    globalMultiplier: 1,
    totalPPC: 0.1,
    totalPPS: 0,
  }
};

let STATE = deepClone(DEFAULT_STATE);

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// ═══════════════════════════════════════════════════
// 7. COMPUTED STATS ENGINE
// ═══════════════════════════════════════════════════
function recompute() {
  let clickBonus = 0;
  let passiveBonus = 0;
  let globalMult = 1;
  let clickMult = 1;
  let passiveMult = 1;

  for (const def of UPGRADE_DEFS) {
    const count = STATE.upgrades[def.id] || 0;
    if (count === 0) continue;
    const e = def.effect;
    if (e.clickBonus)        clickBonus   += e.clickBonus * count;
    if (e.passiveBonus)      passiveBonus += e.passiveBonus * count;
    if (e.multiplier)        globalMult   *= Math.pow(e.multiplier, count);
    if (e.clickMultiplier)   clickMult    *= Math.pow(e.clickMultiplier, count);
    if (e.passiveMultiplier) passiveMult  *= Math.pow(e.passiveMultiplier, count);
  }

  const baseClickValue = DEFAULT_STATE.computed.baseClickValue;
  const totalPPC = (baseClickValue + clickBonus) * clickMult * globalMult;
  const totalPPS = passiveBonus * passiveMult * globalMult;

  STATE.computed = {
    baseClickValue,
    clickBonus,
    clickMultiplier: clickMult,
    passiveBonus,
    passiveMultiplier: passiveMult,
    globalMultiplier: globalMult,
    totalPPC,
    totalPPS,
  };
}

// ═══════════════════════════════════════════════════
// 8. UPGRADE COST CALCULATOR
// ═══════════════════════════════════════════════════
function getUpgradeCost(def) {
  const count = STATE.upgrades[def.id] || 0;
  // Use different scaling for one-time vs repeatable feel
  const scale = 1.18;
  return Math.floor(def.baseCost * Math.pow(scale, count));
}

function canAfford(def) {
  return STATE.points >= getUpgradeCost(def);
}

// ═══════════════════════════════════════════════════
// 9. GAME ACTIONS
// ═══════════════════════════════════════════════════
function clickHeart() {
  const gain = STATE.computed.totalPPC;
  STATE.points += gain;
  STATE.totalEarned += gain;
  STATE.totalClicks += 1;
  checkAchievements();
  return gain;
}

function purchaseUpgrade(id) {
  const def = UPGRADE_DEFS.find(d => d.id === id);
  if (!def) return false;
  const cost = getUpgradeCost(def);
  if (STATE.points < cost) return false;
  STATE.points -= cost;
  STATE.upgrades[id] = (STATE.upgrades[id] || 0) + 1;
  STATE.upgradesPurchased += 1;
  recompute();
  checkAchievements();
  return true;
}

function checkAchievements() {
  let newUnlocks = [];
  for (const def of ACHIEVEMENT_DEFS) {
    if (!STATE.achievements[def.id] && def.check(STATE)) {
      STATE.achievements[def.id] = true;
      newUnlocks.push(def);
    }
  }
  return newUnlocks;
}

// ═══════════════════════════════════════════════════
// 10. SAVE / LOAD
// ═══════════════════════════════════════════════════
const SAVE_KEY = "heartbeat_save_v3";

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(STATE));
    showSaveIndicator();
  } catch (e) { console.warn("Save failed", e); }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    // Merge carefully
    STATE = Object.assign(deepClone(DEFAULT_STATE), saved);
    // Ensure nested objects are clean
    STATE.computed = deepClone(DEFAULT_STATE.computed);
    STATE.upgrades     = saved.upgrades     || {};
    STATE.achievements = saved.achievements || {};
    recompute();
    return true;
  } catch (e) {
    console.warn("Load failed", e);
    return false;
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  STATE = deepClone(DEFAULT_STATE);
  recompute();
  renderAll();
}

// ═══════════════════════════════════════════════════
// 11. UI — UPGRADE LIST
// ═══════════════════════════════════════════════════
let currentFilter = "all";
let upgradeListDirty = true;

function renderUpgradeList() {
  if (!upgradeListDirty) return;
  upgradeListDirty = false;

  const list = $("upgrade-list");
  list.innerHTML = "";

  const filtered = currentFilter === "all"
    ? UPGRADE_DEFS
    : UPGRADE_DEFS.filter(d => d.cat === currentFilter);

  // Group by category when "all"
  let categories = currentFilter === "all"
    ? ["click","passive","multiplier"]
    : [currentFilter];

  let count = 0;
  for (const cat of categories) {
    const group = filtered.filter(d => d.cat === cat);
    if (!group.length) continue;

    if (currentFilter === "all") {
      const hdr = document.createElement("div");
      hdr.className = "upg-category-header";
      hdr.textContent = cat === "click" ? "Click Power" : cat === "passive" ? "Passive Income" : "Multipliers";
      list.appendChild(hdr);
    }

    for (const def of group) {
      list.appendChild(buildUpgradeCard(def));
      count++;
    }
  }

  $("upgrade-count-badge").textContent = STATE.upgradesPurchased;
}

function buildUpgradeCard(def) {
  const cost = getUpgradeCost(def);
  const affordable = STATE.points >= cost;
  const purchased = STATE.upgrades[def.id] || 0;

  const card = document.createElement("div");
  card.className = "upgrade-card" +
    (affordable ? " affordable" : " disabled") +
    (purchased > 0 ? "" : "");
  card.dataset.id = def.id;

  const iconColor = def.cat === "click" ? "#e05c7a" : def.cat === "passive" ? "#60a5fa" : "#fbbf24";

  card.innerHTML = `
    <div class="upg-icon ${def.cat}" style="color:${iconColor}">
      ${ICONS[def.icon] || ICONS.star}
    </div>
    <div class="upg-body">
      <div class="upg-name">${def.name}</div>
      <div class="upg-desc">${def.desc}</div>
    </div>
    <div class="upg-cost">
      <div class="upg-cost-val">${fmtShort(cost)}</div>
      <div class="upg-cost-label">hearts</div>
    </div>
    ${purchased > 0 ? `<div class="upg-level">x${purchased}</div>` : ""}
  `;

  function doUpgradePurchase() {
    if (!canAfford(def)) return;
    const ok = purchaseUpgrade(def.id);
    if (ok) {
      card.classList.add("flash");
      card.addEventListener("animationend", () => card.classList.remove("flash"), { once: true });
      upgradeListDirty = true;
      showToast(`Purchased <strong>${def.name}</strong>!`, "upgrade",
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e05c7a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`);
      renderUpgradeList();
      renderStats();
    }
  }
  let _upgTouched = false;
  card.addEventListener("touchstart", e => {
    e.preventDefault();
    _upgTouched = true;
    doUpgradePurchase();
  }, { passive: false });
  card.addEventListener("touchend", e => { e.preventDefault(); _upgTouched = false; }, { passive: false });
  card.addEventListener("click", () => { if(!_upgTouched) doUpgradePurchase(); });

  return card;
}

function updateUpgradeAffordability() {
  const cards = $("upgrade-list").querySelectorAll(".upgrade-card");
  cards.forEach(card => {
    const def = UPGRADE_DEFS.find(d => d.id === card.dataset.id);
    if (!def) return;
    const affordable = canAfford(def);
    card.classList.toggle("affordable", affordable);
    card.classList.toggle("disabled", !affordable);
  });
}

// ═══════════════════════════════════════════════════
// 12. UI — ACHIEVEMENTS
// ═══════════════════════════════════════════════════
let achDirty = true;

function renderAchievements() {
  if (!achDirty) return;
  achDirty = false;

  const list = $("achievement-list");
  list.innerHTML = "";

  let unlocked = 0;
  for (const def of ACHIEVEMENT_DEFS) {
    const isUnlocked = !!STATE.achievements[def.id];
    if (isUnlocked) unlocked++;
    const card = document.createElement("div");
    card.className = "ach-card " + (isUnlocked ? "unlocked" : "locked");
    card.innerHTML = `
      <div class="ach-icon ${isUnlocked ? "" : "locked"}" style="${isUnlocked ? "color:#fbbf24" : ""}">
        ${ICONS[def.icon] || ICONS.star}
      </div>
      <div>
        <div class="ach-name">${def.name}</div>
        <div class="ach-desc">${def.desc}</div>
      </div>
    `;
    list.appendChild(card);
  }
  $("ach-count-badge").textContent = unlocked + "/" + ACHIEVEMENT_DEFS.length;
}

// ═══════════════════════════════════════════════════
// 13. UI — MILESTONES
// ═══════════════════════════════════════════════════
function renderMilestones() {
  const list = $("milestone-list");
  list.innerHTML = "";
  for (const m of MILESTONE_DEFS) {
    const reached = STATE.totalEarned >= m.threshold;
    const row = document.createElement("div");
    row.className = "milestone-row" + (reached ? " reached" : "");
    row.innerHTML = `
      <div class="milestone-dot"></div>
      <div class="milestone-name">${m.label}</div>
      <div class="milestone-val">${reached ? fmtShort(m.threshold) : fmtShort(m.threshold)}</div>
    `;
    list.appendChild(row);
  }
}

// ═══════════════════════════════════════════════════
// 14. UI — STATS DISPLAY
// ═══════════════════════════════════════════════════
let lastPoints = -1;
let lastPPS = -1;
let lastPPC = -1;

function renderStats() {
  const p = STATE.points;
  const c = STATE.computed;

  // Only update DOM if values changed
  if (p !== lastPoints) {
    $("points-value").textContent = fmt(p);
    $("hdr-total").textContent    = fmt(STATE.totalEarned);
    lastPoints = p;
  }
  if (c.totalPPC !== lastPPC) {
    $("hdr-per-click").textContent = fmtShort(c.totalPPC);
    $("cs-multiplier").textContent = "x" + c.globalMultiplier.toFixed(1);
    lastPPC = c.totalPPC;
  }
  if (c.totalPPS !== lastPPS) {
    $("hdr-per-sec").textContent = fmtShort(c.totalPPS) + "/s";
    lastPPS = c.totalPPS;
  }
  $("cs-clicks").textContent   = fmt(STATE.totalClicks);
  $("cs-playtime").textContent = fmtTime(Math.floor(STATE.playTime));
}

function renderAll() {
  upgradeListDirty = true;
  achDirty = true;
  lastPoints = -1; lastPPS = -1; lastPPC = -1;
  renderUpgradeList();
  renderAchievements();
  renderMilestones();
  renderStats();
}

// ═══════════════════════════════════════════════════
// 15. FLOATING TEXT & HEART ANIMATION
// ═══════════════════════════════════════════════════
const heartBtn = $("heart-btn");
const rippleEl = $("click-ripple");
const floatContainer = $("floating-texts-container");
let clickAnimTimer = null;

function triggerHeartClick(gain) {
  // Heart animation
  heartBtn.classList.remove("clicked");
  void heartBtn.offsetWidth;
  heartBtn.classList.add("clicked");
  if (clickAnimTimer) clearTimeout(clickAnimTimer);
  clickAnimTimer = setTimeout(() => heartBtn.classList.remove("clicked"), 400);

  // Ripple
  const wave = document.createElement("div");
  wave.className = "ripple-wave";
  rippleEl.appendChild(wave);
  wave.addEventListener("animationend", () => wave.remove());

  // Floating text
  const ft = document.createElement("div");
  ft.className = "float-text";
  const rx = (Math.random() - 0.5) * 60;
  ft.style.setProperty("--rx", rx + "px");
  ft.textContent = "+" + fmtShort(gain);
  floatContainer.appendChild(ft);
  ft.addEventListener("animationend", () => ft.remove());

  // Bump points display
  const pv = $("points-value");
  pv.classList.remove("bump");
  void pv.offsetWidth;
  pv.classList.add("bump");
}

// ═══════════════════════════════════════════════════
// 16. TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════
function showToast(msg, type = "info", iconHtml = "") {
  const tc = $("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = (iconHtml || "") + `<span>${msg}</span>`;
  tc.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-fade");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3200);
}

// ═══════════════════════════════════════════════════
// 17. SAVE INDICATOR
// ═══════════════════════════════════════════════════
let saveTimer = null;
function showSaveIndicator() {
  const el = $("save-indicator");
  el.classList.add("show");
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => el.classList.remove("show"), 2000);
}

// ═══════════════════════════════════════════════════
// 18. BACKGROUND CANVAS PARTICLES
// ═══════════════════════════════════════════════════
(function initParticles() {
  const canvas = $("bg-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const N = 55;
  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.35 + 0.05,
    });
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(224,92,122,${p.alpha})`;
    ctx.fill();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      drawParticle(p);
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// ═══════════════════════════════════════════════════
// 19. MOBILE NAV
// ═══════════════════════════════════════════════════
(function initMobileNav() {
  const tabs = qsa(".nav-tab");
  const leftPanel  = $("left-panel");
  const rightPanel = $("right-panel");

  function showPanel(name) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.panel === name));
    leftPanel.classList.toggle("mobile-visible",  name === "upgrades");
    rightPanel.classList.toggle("mobile-visible", name === "achievements");
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => showPanel(tab.dataset.panel));
  });
})();

// ═══════════════════════════════════════════════════
// 20. FILTER BUTTONS
// ═══════════════════════════════════════════════════
qsa(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    qsa(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    upgradeListDirty = true;
    renderUpgradeList();
  });
});

// ═══════════════════════════════════════════════════
// 21. HEART CLICK EVENT
// ═══════════════════════════════════════════════════
// ── INSTANT MOBILE TOUCH + DESKTOP CLICK ──
// touchstart fires immediately on tap — no 300ms delay
let _touchActive = false;

heartBtn.addEventListener("touchstart", e => {
  e.preventDefault(); // prevents ghost click and double-tap zoom
  _touchActive = true;
  const gain = clickHeart();
  triggerHeartClick(gain);
  renderStats();
  updateUpgradeAffordability();
}, { passive: false });

heartBtn.addEventListener("touchend", e => {
  e.preventDefault();
  _touchActive = false;
}, { passive: false });

// Fallback for desktop mouse clicks
heartBtn.addEventListener("click", () => {
  if (_touchActive) return; // already handled by touchstart
  const gain = clickHeart();
  triggerHeartClick(gain);
  renderStats();
  updateUpgradeAffordability();
});

// ═══════════════════════════════════════════════════
// 22. SAVE / RESET BUTTONS
// ═══════════════════════════════════════════════════
$("btn-save").addEventListener("click", () => saveGame());

$("btn-reset").addEventListener("click", () => {
  $("reset-modal").style.display = "flex";
});
$("modal-cancel").addEventListener("click",  () => { $("reset-modal").style.display = "none"; });
$("modal-confirm").addEventListener("click", () => {
  $("reset-modal").style.display = "none";
  resetGame();
  showToast("Game reset. Fresh start!", "info",
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>`);
});

// Close modal on overlay click
$("reset-modal").addEventListener("click", e => {
  if (e.target === $("reset-modal")) $("reset-modal").style.display = "none";
});

// ═══════════════════════════════════════════════════
// 23. MAIN GAME LOOP
// ═══════════════════════════════════════════════════
let lastTick = performance.now();
let saveAccum = 0;
let achCheckAccum = 0;
let milestoneAccum = 0;
let uiSlowAccum = 0;

function gameLoop(now) {
  const dt = Math.min((now - lastTick) / 1000, 0.5); // cap dt to 500ms
  lastTick = now;

  // Passive income
  if (STATE.computed.totalPPS > 0) {
    const passiveGain = STATE.computed.totalPPS * dt;
    STATE.points += passiveGain;
    STATE.totalEarned += passiveGain;
  }

  // Playtime
  STATE.playTime += dt;

  // Fast UI updates (~20fps for points display)
  saveAccum    += dt;
  achCheckAccum += dt;
  uiSlowAccum  += dt;
  milestoneAccum += dt;

  // Update points display continuously
  renderStats();
  updateUpgradeAffordability();

  // Check achievements every 0.5s
  if (achCheckAccum >= 0.5) {
    achCheckAccum = 0;
    const newAch = checkAchievements();
    if (newAch.length) {
      achDirty = true;
      renderAchievements();
      for (const ach of newAch) {
        showToast(`Achievement: <strong>${ach.name}</strong>`, "achievement",
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`);
      }
    }
  }

  // Update milestones every 2s
  if (milestoneAccum >= 2) {
    milestoneAccum = 0;
    renderMilestones();
  }

  // Auto-save every 30s
  if (saveAccum >= 30) {
    saveAccum = 0;
    saveGame();
  }

  requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════════════
// 24. INIT
// ═══════════════════════════════════════════════════
(function init() {
  const bar = document.getElementById('loading-bar');
  let w = 0;
  const iv = setInterval(() => {
    w += Math.random() * 25 + 10;
    bar.style.width = Math.min(w, 95) + '%';
    if (w >= 95) {
      clearInterval(iv);
      setTimeout(() => {
        bar.style.width = '100%';
        setTimeout(() => {
          document.getElementById('loading-screen').classList.add('hidden');
          _startGame();
        }, 280);
      }, 300);
    }
  }, 80);

  function _startGame() {
  const loaded = loadGame();
  recompute();
  renderAll();

  if (loaded) {
    showToast("Welcome back! Progress restored.", "info",
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`);
  }

  requestAnimationFrame(gameLoop);
  } // end _startGame
})();

/* ═══════════════════════════════════════════════════
   HEARTLY INTEGRATION BRIDGE
   Awards Heartly points when milestones are hit.
   Communicates with parent via window.parent refs.
═══════════════════════════════════════════════════ */
(function heartlyBridge() {

  // Milestone thresholds → Heartly pts awarded (one-time each)
  const HEARTLY_MILESTONES = [
    { threshold: 100,   pts: 25,  label: 'First 100 Hearts' },
    { threshold: 1000,  pts: 50,  label: '1K Hearts reached' },
    { threshold: 10000, pts: 100, label: '10K Hearts reached' },
    { threshold: 1e5,   pts: 150, label: '100K Hearts reached' },
    { threshold: 1e6,   pts: 250, label: '1M Hearts reached' },
    { threshold: 1e9,   pts: 500, label: '1B Hearts — Legend!' },
  ];

  const BRIDGE_KEY = 'hly_clicker_milestones_v1';
  let awardedMilestones = {};
  try { awardedMilestones = JSON.parse(localStorage.getItem(BRIDGE_KEY)||'{}'); } catch(e){}

  function saveBridge() {
    try { localStorage.setItem(BRIDGE_KEY, JSON.stringify(awardedMilestones)); } catch(e){}
  }

  // Award pts to Heartly parent frame
  function awardToHeartly(pts, label) {
    try {
      const p = window.parent;
      if (!p || p === window) return;
      const old = p.ptsVal || 0;
      p.ptsVal = old + pts;
      if (typeof p.animatePts === 'function')   p.animatePts(old, p.ptsVal, 800);
      if (typeof p.addTxItem  === 'function')   p.addTxItem('💖', 'Love Clicker: ' + label, 'Just now', '+' + pts, 'earn');
      if (typeof p.T          === 'function')   p.T('💖 +' + pts + ' pts — ' + label + '!');
      if (typeof p.saveState  === 'function')   p.saveState();
    } catch(e) {}
  }

  // Also award pts for each achievement unlocked (5 pts each)
  const _origCheckAch = window.checkAchievements || function(){};

  // Hook into the game loop: check milestones after each update
  // We patch the gameLoop by wrapping STATE updates
  const _origClickHeart = window.clickHeart;
  if (typeof _origClickHeart === 'function') {
    window.clickHeart = function() {
      const result = _origClickHeart.apply(this, arguments);
      checkHeartlyMilestones();
      return result;
    };
  }

  function checkHeartlyMilestones() {
    if (!STATE) return;
    HEARTLY_MILESTONES.forEach(m => {
      if (!awardedMilestones[m.threshold] && STATE.totalEarned >= m.threshold) {
        awardedMilestones[m.threshold] = true;
        saveBridge();
        awardToHeartly(m.pts, m.label);
      }
    });
  }

  // Also check passively every 5s (for passive income milestones)
  setInterval(checkHeartlyMilestones, 5000);

  // Add a back button inside the game that closes the overlay
  document.addEventListener('DOMContentLoaded', function() {
    // Inject back button into topbar
    const topBar = document.getElementById('top-bar');
    if (topBar) {
      const backBtn = document.createElement('button');
      backBtn.className = 'icon-btn';
      backBtn.id = 'btn-heartly-back';
      backBtn.title = 'Back to Heartly';
      backBtn.style.cssText = 'margin-right:4px;';
      backBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>';
      backBtn.onclick = function() {
        try {
          if (window.parent && typeof window.parent.closeClicker === 'function') {
            window.parent.closeClicker();
          }
        } catch(e) {}
      };
      // Insert as first child of topbar
      topBar.insertBefore(backBtn, topBar.firstChild);
    }
  });

})();
