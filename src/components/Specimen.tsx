export function Specimen() {
  const lines=Array.from({length:14},(_,i)=>{const y=54+i*17;return <path key={i} d={`M110 ${y}Q230 ${y-22} 365 ${y+6} M${125+i*16} 40Q${165+i*11} 180 ${110+i*21} 350`} />;});
  return <div className="specimen"><div className="specimen-head"><span><i className="status-dot"/> INSPECTION WORKSPACE</span><span>ILLUSTRATION</span></div><svg viewBox="0 0 470 390" role="img" aria-label="Illustration of a wireframe figurine with detached detail and a highlighted surface patch; not an analysis of a model.">
    <defs><linearGradient id="spec-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a3c9c1" stopOpacity=".13"/><stop offset="1" stopColor="#73a0b8" stopOpacity=".02"/></linearGradient><clipPath id="spec-clip"><path d="M148 94Q165 45 228 48Q290 45 311 101L309 181Q302 212 275 225L274 250Q332 257 354 287L371 339H105L120 291Q141 261 196 250L194 225Q158 209 148 174Z"/></clipPath><pattern id="spec-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#ffffff05"/></pattern></defs>
    <rect width="470" height="390" fill="url(#spec-grid)"/><ellipse cx="237" cy="344" rx="158" ry="26" fill="none" stroke="#8ed2b51e"/><path d="m60 344 176-66 175 66-175 28Z" fill="none" stroke="#8ed2b519"/>
    <path d="M148 94Q165 45 228 48Q290 45 311 101L309 181Q302 212 275 225L274 250Q332 257 354 287L371 339H105L120 291Q141 261 196 250L194 225Q158 209 148 174Z" fill="url(#spec-fill)" stroke="#90b9b0" strokeWidth="1.3"/>
    <g clipPath="url(#spec-clip)" stroke="#8ebbb66b" strokeWidth=".7" fill="none">{lines}<path d="m150 105 75 55 85-50M160 176l65-16 77 18M195 225l30-65 50 65M120 291l75-41 42 88 37-88 80 37"/></g>
    <path d="m151 78-14-37 27-18 25 25Z" fill="#ff9e6817" stroke="#ffad7e" strokeDasharray="4 3"/><path d="m295 110 16 33-34 14Z" fill="#ff9e6814" stroke="#ffad7e"/>
    <path d="M154 43H84V71M301 139h72v37" fill="none" stroke="#ffad7e7c"/><circle cx="154" cy="43" r="3" fill="#ffad7e"/><circle cx="301" cy="139" r="3" fill="#ffad7e"/>
    <g fill="#d9e2e8" fontSize="10" fontFamily="monospace"><text x="24" y="87">DETACHED DETAIL</text><text x="329" y="194">SURFACE PATCH</text><text x="28" y="365" fill="#71828b">FRONT / PERSPECTIVE</text></g>
  </svg><div className="specimen-foot"><span>01 / FIND THE CAUSE</span><span className="mono">MESH → METHOD</span></div></div>;
}
