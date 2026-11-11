// 공식 웹 모듈 SDK. 구성 정보가 있을 때만 로드됩니다.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,updateProfile,signOut,sendPasswordResetEmail,getIdTokenResult} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import {getFirestore,collection,getDocs,query,where,setDoc,doc,addDoc,deleteDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-functions.js';
export async function connect(config){const app=initializeApp(config.firebase),auth=getAuth(app),db=getFirestore(app),functions=getFunctions(app,config.functionsRegion||'asia-northeast3');const list=async q=>(await getDocs(q)).docs.map(d=>({...d.data(),id:d.id}));return{
 onAuth:cb=>onAuthStateChanged(auth,cb),isAdmin:async u=>(await getIdTokenResult(u)).claims.admin===true,
 login:(e,p)=>signInWithEmailAndPassword(auth,e,p),signup:async(e,p,n)=>{const r=await createUserWithEmailAndPassword(auth,e,p);await updateProfile(r.user,{displayName:n});return r},signOut:()=>signOut(auth),reset:e=>sendPasswordResetEmail(auth,e),
 listProducts:()=>list(query(collection(db,'products'),where('active','==',true))),
 listCollection:name=>list(collection(db,name)),listOwnOrders:uid=>list(query(collection(db,'orders'),where('uid','==',uid))),listOwnInquiries:uid=>list(query(collection(db,'inquiries'),where('uid','==',uid))),
 saveProduct:p=>setDoc(doc(db,'products',p.id),{...p,updatedAt:serverTimestamp()}),
 inquire:d=>addDoc(collection(db,'inquiries'),{...d,createdAt:serverTimestamp()}),deleteInquiry:id=>deleteDoc(doc(db,'inquiries',id)),
 createOrder:async data=>(await httpsCallable(functions,'createOrder')(data)).data,
 updateOrder:async(id,status)=>(await httpsCallable(functions,'updateOrderStatus')({id,status})).data,
 saveContent:(key,body)=>setDoc(doc(db,'siteContent',key),{body,updatedAt:serverTimestamp()}),
 loadContent:async()=>Object.fromEntries((await list(collection(db,'siteContent'))).map(x=>[x.id,x.body]))
}}
