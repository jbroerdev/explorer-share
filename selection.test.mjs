import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

function element(id, rect={left:0,top:0,width:0,height:0}) {
  const classes=new Set(), listeners={};
  return {dataset:{id},style:{},listeners,children:[],scrollTop:0,scrollLeft:0,
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},
    setAttribute(){},append(){},remove(){},setPointerCapture(){},
    addEventListener:(name,handler)=>{listeners[name]=handler;},
    getBoundingClientRect:()=>({...rect,right:rect.left+rect.width,bottom:rect.top+rect.height}),
    querySelectorAll(){return this.children;}};
}
async function environment() {
  const source=await readFile(new URL('./public/app.js',import.meta.url),'utf8');
  const nodes=[{id:'docs',kind:'folder',system:true,parent:'@home'},
    {id:'a',kind:'file',name:'A',parent:'docs'},
    {id:'b',kind:'folder',name:'B',parent:'docs'},
    {id:'c',kind:'link',name:'C',parent:'docs'},
    {id:'child',kind:'folder',parent:'b'},
    {id:'target',kind:'folder',parent:'@home'}];
  const list=element('list');
  list.children=[element('a',{left:120,top:120,width:30,height:30}),
    element('b',{left:170,top:120,width:30,height:30}),
    element('c',{left:120,top:180,width:30,height:30})];
  const content=element('content',{left:100,top:100,width:500,height:500});
  const fields={list,count:element(),context:{hidden:true}};
  const context=vm.createContext({selection:new Set(),selected:null,selectionAnchor:null,cutIds:[],dragIds:[],
    dragHoverTimer:null,dragHoverId:null,marquee:null,current:'docs',nodes,state:{authenticated:true},
    get:id=>nodes.find(n=>n.id===id),$:id=>fields[id],make:()=>element(),updateStatus(){},toast(){},
    document:{querySelector:selector=>selector==='.content'?content:null,querySelectorAll:()=>[],
      addEventListener(){},body:element()},clearTimeout,setTimeout,
    api:async()=>({moved:1}),load:async()=>{}});
  vm.runInContext(source.slice(source.indexOf('function visibleIds()')),context);
  return {context,nodes,list,content};
}

test('Explorer-Auswahl: Strg, Umschalt, Ausschneiden und gültige Ziele',async()=>{
  const {context:c,nodes}=await environment();
  const visible=nodes.filter(n=>['a','b','c'].includes(n.id));
  c.selectItem(visible[0],{},visible);
  c.selectItem(visible[1],{ctrlKey:true},visible);
  assert.deepEqual([...c.selection],['a','b']);
  c.selectItem(visible[2],{shiftKey:true},visible);
  assert.deepEqual([...c.selection],['b','c']);
  c.cutSelection();assert.deepEqual([...c.cutIds],['b','c']);
  assert.equal(c.canDrop(['b'],'child'),false);
  assert.equal(c.canDrop(['b'],'b'),false);
  assert.equal(c.canDrop(['docs'],'target'),false);
  assert.equal(c.canDrop(['a'],'c'),false);
  assert.equal(c.canDrop(['a','c'],'target'),true);
  assert.deepEqual([...c.moveRoots(['b','child'])],['b']);
  let request;
  c.api=async(route,data)=>{request={route,data};return {moved:2};};
  await c.pasteSelection('target');
  assert.equal(request.route,'/api/move');
  assert.deepEqual([...request.data.ids],['b','c']);
  assert.equal(request.data.parent,'target');assert.equal(c.cutIds.length,0);
});

test('Explorer-Ziehrahmen wählt Treffer und ergänzt vorhandene Auswahl mit Strg',async()=>{
  const {context:c,content}=await environment();
  const down=ctrlKey=>({button:0,pointerId:1,clientX:105,clientY:105,ctrlKey,
    target:{closest:()=>null},preventDefault(){}});
  const move={pointerId:1,clientX:210,clientY:155};
  content.listeners.pointerdown(down(false));content.listeners.pointermove(move);
  assert.deepEqual([...c.selection],['a','b']);
  content.listeners.pointerup();assert.equal(c.marquee,null);
  c.selection.clear();c.selection.add('c');
  content.listeners.pointerdown(down(true));content.listeners.pointermove(move);
  assert.deepEqual([...c.selection],['c','a','b']);content.listeners.pointerup();
});

test('Explorer-Drag-and-drop verschiebt die gesamte Auswahl einschließlich Verknüpfungen',async()=>{
  const {context:c,nodes,list}=await environment();
  c.selection.add('a');c.selection.add('c');
  const source=list.children[0],target=element('target');
  c.wireDragSource(source,nodes.find(n=>n.id==='a'));
  c.wireDropTarget(target,'target');
  const data={setData(){}};
  source.listeners.dragstart({dataTransfer:data,preventDefault(){}});
  assert.equal(data.effectAllowed,'move');assert.deepEqual([...c.dragIds],['a','c']);
  let accepted=false,request;
  target.listeners.dragover({dataTransfer:data,preventDefault(){accepted=true;},stopPropagation(){}});
  assert.equal(accepted,true);assert.equal(data.dropEffect,'move');
  c.api=async(route,body)=>{request={route,body};return {moved:2};};
  target.listeners.drop({preventDefault(){},stopPropagation(){}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(request.route,'/api/move');assert.deepEqual([...request.body.ids],['a','c']);
  assert.equal(request.body.parent,'target');assert.equal(c.dragIds.length,0);
});
