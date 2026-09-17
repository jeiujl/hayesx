import {getChatGPTUser} from '../../chatgpt-auth';
import {database} from '@/lib/storage';
import groups from '../../data/checklist.json';
export async function GET(){
 try{const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in to save and retrieve your records.'},{status:401});
 const db=database();const settings=await db.prepare('SELECT kind,data FROM settings WHERE owner=?').bind(user.userId).all();
 const logs=await db.prepare('SELECT data,signed_at FROM flights WHERE owner=? ORDER BY date DESC').bind(user.userId).all();
 return Response.json({user:{name:user.fullName??'',email:user.email},settings:Object.fromEntries(settings.results.map((r:any)=>[r.kind,JSON.parse(r.data)])),logs:logs.results.map((r:any)=>({...JSON.parse(r.data),signedAt:r.signed_at}))},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error(e);return Response.json({error:'Your records are unavailable. Please try again.'},{status:503});}
}
function text(v:unknown,max=200){return typeof v==='string'&&v.trim().length<=max?v.trim():''}
export async function POST(request:Request){
 try{const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in before saving.'},{status:401});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 if(Number(request.headers.get('content-length'))>100000)return Response.json({error:'Record is too large.'},{status:413});
 const body:any=await request.json();const db=database();let data:any;
 if(body.kind==='flight'){
 const f=body.data;if(!f||!text(f.id)||!text(f.pilot)||!text(f.serial)||!text(f.aircraft)||!text(f.category)||!text(f.from)||!text(f.to)||!text(f.weather,2000)||!text(f.signature)||f.certified!==true||!Number.isInteger(f.minutes)||f.minutes<=0||f.minutes>1440||typeof f.date!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(f.date)||!Number.isFinite(Date.parse(f.date)))return Response.json({error:'Complete all required flight fields and certify the record.'},{status:400});
 data={id:f.id,pilot:text(f.pilot),serial:text(f.serial),aircraft:text(f.aircraft),category:text(f.category),from:text(f.from),to:text(f.to),weather:text(f.weather,2000),signature:text(f.signature),certified:true,minutes:f.minutes,date:f.date,timeZone:text(f.timeZone),notes:text(f.notes,5000)};
 const signedAt=new Date().toISOString();await db.prepare('INSERT INTO flights (id,owner,date,signed_at,data) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(data.id,user.userId,data.date,signedAt,JSON.stringify(data)).run();
 const row=await db.prepare('SELECT data,signed_at FROM flights WHERE id=? AND owner=?').bind(data.id,user.userId).first();if(!row)return Response.json({error:'Record identifier conflict.'},{status:409});return Response.json({record:{...JSON.parse(row.data as string),signedAt:row.signed_at}});
 }
 if(body.kind==='profile'){const f=body.data;if(!f||!text(f.name)||!text(f.serial))return Response.json({error:'Enter your name and aircraft serial number.'},{status:400});data={name:text(f.name),serial:text(f.serial),aircraft:text(f.aircraft)||'HayesX-250',category:text(f.category)||'Ultralight FAA Part 103'};}
 else if(body.kind==='checklist'){const f=body.data;const valid=new Set(groups.flatMap((g,i)=>g.items.map((_,j)=>`${i}-${j}`)));if(!f||!Array.isArray(f.checked)||f.checked.some((k:any)=>!valid.has(k)))return Response.json({error:'Invalid checklist item.'},{status:400});data={checked:[...new Set(f.checked)],startedAt:text(f.startedAt),completedAt:f.checked.length===valid.size?new Date().toISOString():null};}
 else if(body.kind==='draft'){if(!body.data)return Response.json({error:'Missing message.'},{status:400});data={subject:text(body.data.subject),body:text(body.data.body,5000),updatedAt:new Date().toISOString()};}
 else return Response.json({error:'Unknown record type.'},{status:400});
 await db.prepare('INSERT INTO settings (owner,kind,data) VALUES (?,?,?) ON CONFLICT(owner,kind) DO UPDATE SET data=excluded.data').bind(user.userId,body.kind,JSON.stringify(data)).run();return Response.json({data});
 }catch(e){console.error(e);return Response.json({error:'Could not save. Your input is still here; please try again.'},{status:503});}
}

