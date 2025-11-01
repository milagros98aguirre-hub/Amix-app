
import React, { useState, useEffect } from "react";

// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2){
  const toRad = v => v * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// simulated users with coords (example coords near Mendoza/Argentina but generic)
const SIMULATED_USERS = [
  {id:1,name:"Sofía",age:24,lat:-34.9085,lon:-68.8272,desc:"Amo cafés y caminatas."},
  {id:2,name:"Camila",age:27,lat:-34.9150,lon:-68.8500,desc:"Runner y fan de series."},
  {id:3,name:"María",age:22,lat:-34.9000,lon:-68.8000,desc:"Amante de perros y arte."},
  {id:4,name:"Lucía",age:30,lat:-34.9300,lon:-68.8200,desc:"Cine y buena comida."},
  {id:5,name:"Ana",age:26,lat:-34.8900,lon:-68.8400,desc:"Yoga y plantas."}
];

export default function App(){
  const [screen, setScreen] = useState("welcome"); // welcome, intro, profile, feed
  const [profile, setProfile] = useState({name:"",age:"",desc:"",pics:[],lat:null,lon:null});
  const [matches, setMatches] = useState([]);
  const [notice, setNotice] = useState("");
  const [allowLocation, setAllowLocation] = useState(false);

  useEffect(()=>{
    if(profile.lat && profile.lon){
      // compute matches within 10 km
      const nearby = SIMULATED_USERS.map(u => ({...u, dist: distanceKm(profile.lat, profile.lon, u.lat, u.lon)}))
                       .filter(u => u.dist <= 10)
                       .sort((a,b)=>a.dist-b.dist);
      setMatches(nearby);
    }
  }, [profile.lat, profile.lon]);

  // Helpers to handle image upload (client-side)
  function handleAddPhoto(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile(prev => ({...prev, pics: [...prev.pics, reader.result].slice(0,3)}));
    };
    reader.readAsDataURL(file);
  }

  function requestLocation(){
    if(!navigator.geolocation){
      setNotice("Tu navegador no permite acceder a la ubicación.");
      return;
    }
    setNotice("Obteniendo ubicación... (pedí permiso en la ventana del navegador)");
    navigator.geolocation.getCurrentPosition(pos => {
      const {latitude, longitude} = pos.coords;
      setProfile(p => ({...p, lat: latitude, lon: longitude}));
      setAllowLocation(true);
      setNotice("Ubicación registrada.");
    }, err => {
      setNotice("No pudimos obtener tu ubicación. Permitila y volvé a intentar.");
    }, {enableHighAccuracy:true, timeout:10000});
  }

  // simple validation and move to feed
  function finishProfile(){
    if(!profile.name || !profile.age) { setNotice("Completá nombre y edad para continuar."); return; }
    if(!allowLocation) { setNotice("Activá la ubicación para encontrar amigas cerca."); return; }
    setScreen("feed");
  }

  return (
    <div className="container">
      {screen==="welcome" && (
        <div className="center">
          <div className="card center">
            <div className="logo"><span>A</span><span className="heart">💖</span><span>mix</span></div>
            <div className="h1">¡Hacer amigas nunca fue tan fácil!</div>
            <div className="p">Conectá con chicas cerca tuyo y empezá a planear salidas reales.</div>
            <button className="btn" onClick={()=>setScreen("intro")}>Iniciar</button>
            <div className="small">Valenzo Estudio • Amix</div>
          </div>
        </div>
      )}

      {screen==="intro" && (
        <div className="card">
          <h2 className="h1">¡Hola Amix! ¿Lista para conocer a tus futuras amigas? ¡Comencemos!</h2>
          <p className="p">Creá tu perfil para comenzar a ver chicas que están cerca tuyo.</p>
          <button className="btn" onClick={()=>setScreen("profile")}>Crear perfil</button>
        </div>
      )}

      {screen==="profile" && (
        <div className="card">
          <h3 className="h1">Crear perfil</h3>
          <div className="notice">{notice}</div>
          <div className="profile-pics">
            {profile.pics.map((p,i)=> <img key={i} src={p} alt="pic" className="thumb" />)}
            {profile.pics.length < 3 && (
              <label style={{display:'inline-block'}} className="thumb">
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handleAddPhoto} />
                <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#999'}}>+</div>
              </label>
            )}
          </div>
          <div className="form-row">
            <input className="input" placeholder="Nombre" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} />
            <input className="input" placeholder="Edad" type="number" value={profile.age} onChange={e=>setProfile({...profile,age:e.target.value})} />
          </div>
          <div style={{marginBottom:8}}><textarea className="input" placeholder="Descripción personal" value={profile.desc} onChange={e=>setProfile({...profile,desc:e.target.value})}></textarea></div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={requestLocation}>Activar ubicación</button>
            <button className="btn" onClick={finishProfile}>Finalizar</button>
          </div>
          <div className="small">La ubicación se usa solo para mostrar amigas en tu zona (max 10 km).</div>
        </div>
      )}

      {screen==="feed" && (
        <div>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div style={{width:56,height:56,borderRadius:12,background:'linear-gradient(90deg,var(--pink),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700}}>A</div>
                <div>
                  <div style={{fontWeight:700}}>{profile.name || "Tu perfil"}</div>
                  <div style={{fontSize:12,color:'#666'}}>{profile.age ? profile.age+" años" : ""}</div>
                </div>
              </div>
              <button className="btn" onClick={()=>{setScreen("profile"); setNotice("");}}>Editar</button>
            </div>
            <div className="notice">Mostrando chicas dentro de 10 km</div>
            <div className="list">
              {matches.length===0 && <div className="card-match"><div>No hay chicas cerca en este momento.</div></div>}
              {matches.map(m=> (
                <div key={m.id} className="card-match">
                  <div style={{width:64,height:64,borderRadius:12,background:'#f2f2f2',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{m.name[0]}</div>
                  <div style={{flex:1}}>
                    <div className="match-name">{m.name}, {m.age}</div>
                    <div className="distance">{m.desc}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="distance">{m.dist.toFixed(1)} km</div>
                    <button className="btn" onClick={()=>alert('Enviar solicitud de amistad a '+m.name)}>Conocer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{textAlign:'center',marginTop:12}} className="small">Amix demo • Datos simulados</div>
        </div>
      )}
    </div>
  );
}
