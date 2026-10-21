const fs=require('fs'),vm=require('vm'),assert=require('assert');const nodes={};const node=()=>({innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){},add(){}}});const c={document:{querySelector:s=>nodes[s]||(nodes[s]=node()),querySelectorAll:()=>[]},window:{scrollTo(){}},localStorage:{getItem:()=>null,setItem(){}},console};vm.createContext(c);vm.runInContext(fs.readFileSync('docs/index.html','utf8').split('<script>')[1].split('</script>')[0],c);assert.equal(vm.runInContext('verses.length',c),17);for(const m of ['read','quiz','blank','order','recite','write'])for(let i=0;i<17;i++){vm.runInContext(`mode='${m}';idx=${i};render()`,c);assert(nodes['#exercise'].innerHTML.includes(`3장 ${i+1}절`));if(m==='quiz'){assert.equal((nodes['#exercise'].innerHTML.match(/data-correct=/g)||[]).length,4);assert.equal((nodes['#exercise'].innerHTML.match(/data-correct="true"/g)||[]).length,1)}}
vm.runInContext("range='all';go('blank');blankType='verse';render()",c);assert(nodes['#exercise'].innerHTML.includes('한 절 전체 쓰기'));
vm.runInContext("progress={1:{weak:true},2:{weak:true}};range='weak';go('recite');mark(false);next()",c);assert(nodes['#exercise'].innerHTML.includes('3장 2절'));
assert.equal(vm.runInContext("diffText('위의 것을','위의 것을')",c),'위의 것을');assert(vm.runInContext("diffText('위의','위의 것을')",c).includes('<mark>'));
console.log('PASS: 102 mode/verse renders, four-option quizzes, full-verse blank, weak-review progression, answer comparison.');
vm.runInContext("range='all';go('quiz')",c);assert.equal(vm.runInContext('sub',c),'phrase');assert(nodes['#exercise'].innerHTML.indexOf('>구절</button>')<nodes['#exercise'].innerHTML.indexOf('>단어</button>'));
for(const kind of ['phrase','word'])for(let verse=0;verse<17;verse++){
 vm.runInContext(`sub='${kind}';idx=${verse};render()`,c);

 for(let turn=0;turn<20;turn++){
  vm.runInContext('render()',c);const html=nodes['#exercise'].innerHTML;
  assert.equal((html.match(/data-correct=/g)||[]).length,4);assert.equal((html.match(/data-correct="true"/g)||[]).length,1);
  const answer=html.match(/data-correct="true"[^>]*>(.*?)<\/button>/)[1];
  const prompt=html.match(/<p class="verse">(.*?)<\/p>/)[1].replace(/<span[^>]*>.*?<\/span>/,answer).replace(/\s+/g,' ').trim();
  assert.equal(prompt,vm.runInContext(`verses[${verse}].text`,c));
 }
}
vm.runInContext("idx=0;mode='blank';blankType='word';questionBags.clear()",c);const seen=new Set();const wordCount=vm.runInContext("verses[0].text.split(/\s+/).length",c);
for(let i=0;i<wordCount;i++){vm.runInContext('render()',c);const position=vm.runInContext("questionBags.get('blank-word-1').last",c);assert(!seen.has(position));seen.add(position);c.document.querySelector('#answer').value=vm.runInContext('blankAnswer',c);vm.runInContext('checkBlank()',c);assert.equal(nodes['#feedback'].textContent,'정답이에요!')}
vm.runInContext("mode='recite';hint=0;render();hint=1;render()",c);const clue=vm.runInContext('hintPosition',c);vm.runInContext('render()',c);assert.equal(vm.runInContext('hintPosition',c),clue);
for(let i=0;i<20;i++){vm.runInContext("mode='order';render()",c);const chips=[...nodes['#exercise'].innerHTML.matchAll(/data-order="(\d+)"[^>]*>(.*?)<\/button>/g)];assert.equal(chips.sort((a,b)=>+a[1]-b[1]).map(x=>x[2]).join(' '),vm.runInContext('verses[0].text',c))}
console.log('PASS: randomized quiz context/options, blank coverage and grading, stable hint, order reconstruction.');
