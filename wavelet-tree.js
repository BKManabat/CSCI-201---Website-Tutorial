"use strict";

function initWaveletTree() {
  if (location.hash !== "#/succinct/wavelet-trees") return;
  const lesson = document.getElementById("lesson-content");
  lesson.querySelector(".mini-label").hidden = true;
  lesson.querySelector("p").hidden = true;
  lesson.insertAdjacentHTML("beforeend", `
    <h3>Split the alphabet and keep the order</h3>
    <p>Take S = <code>ACGTCGAC</code>. Put A and C on the left, G and T on the right.
      Write 0 for a symbol sent left and 1 for a symbol sent right. Repeat the split
      inside each child. The child sequences keep the original relative order [1].</p>
    <pre style="overflow-x:auto">           A C G T C G A C
              00110100
           0 /        \\ 1
        A C C A C     G T G
          01101       010
        0 / \\ 1     0 / \\ 1
         AA  CCC      GG   T</pre>
    <p>The full tree is shown above. The sequences explain construction.
      They need not be stored beside the node bit vectors.</p>
    <h3>Count C in the first seven symbols</h3>
    <p>At the root, C goes left. The first seven root bits have four zeros,
      so the new prefix length is 4. Those symbols are <code>ACCA</code>.
      At the left child, C goes right. The first four child bits have two ones.
      We reach C with count 2.</p>
    <div class="stepper" id="wavelet-demo">
      <p><label for="wavelet-symbol">Symbol</label>
        <select id="wavelet-symbol"><option>A</option><option selected>C</option><option>G</option><option>T</option></select></p>
      <p><label for="wavelet-prefix">Prefix length</label>
        <input id="wavelet-prefix" type="range" min="0" max="8" value="7">
        <output id="wavelet-length" for="wavelet-prefix">7</output></p>
      <div id="wavelet-result" aria-live="polite" class="stepper-output"></div>
      <div class="stepper-controls"><button class="btn secondary" id="wavelet-prev" type="button">Previous</button>
        <button class="btn" id="wavelet-next" type="button">Next step</button>
        <button class="btn secondary" id="wavelet-reset" type="button">Reset</button></div>
    </div>
    <h3>Use bit counts to answer symbol queries</h3>
    <p>Each level maps a prefix length into the selected child's sequence.
      A balanced binary tree on σ symbols has height ⌈log₂ σ⌉.
      Constant-time bit-vector rank therefore gives O(log σ) symbol rank.
      Here the three bit vectors use 8 + 5 + 3 = 16 bits before rank indexes
      and topology storage [1].</p>
    <p>Built over the BWT, a wavelet tree supplies Occ(c, i). Backward search
      then takes O(m log σ) time for a pattern of length m. Locating the
      matches needs suffix-array recovery as well. This DNA sequence illustrates
      rank only, not a BWT construction.</p>
    <p>The browser demonstration scans short strings to show the mapping.
      It does not implement constant-time bit-vector rank.</p>
    <h3>Reference</h3>
    <p>[1] Gonzalo Navarro (2014), <a href="https://doi.org/10.1016/j.jda.2013.07.004"
      target="_blank" rel="noopener noreferrer">Wavelet Trees for All</a>, Sections 2.1–2.2.</p>
  `);
  const symbol = document.getElementById("wavelet-symbol");
  const prefix = document.getElementById("wavelet-prefix");
  let step = 0;
  function show() {
    const c = symbol.value, i = Number(prefix.value);
    const right = "GT".includes(c);
    const rootBit = right ? "1" : "0";
    const childBit = "CT".includes(c) ? "1" : "0";
    const child = right ? "010" : "01101";
    const j = [..."00110100".slice(0, i)].filter(b => b === rootBit).length;
    const k = [...child.slice(0, j)].filter(b => b === childBit).length;
    const stages = [
      `Start with the first ${i} symbols: ${"ACGTCGAC".slice(0, i) || "empty"}. Find ${c}.`,
      `At the root, ${c} goes ${right ? "right" : "left"}. rank_${rootBit}(00110100, ${i}) = ${j}. Carry prefix length ${j} to the child.`,
      `At the ${right ? "GT" : "AC"} child, ${c} goes ${childBit === "1" ? "right" : "left"}. rank_${childBit}(${child}, ${j}) = ${k}. The ${c} leaf gives rank_${c}(S, ${i}) = ${k}.`
    ];
    document.getElementById("wavelet-length").textContent = i;
    document.getElementById("wavelet-result").textContent = `Step ${step + 1} of 3. ${stages[step]}`;
    document.getElementById("wavelet-prev").disabled = step === 0;
    document.getElementById("wavelet-next").disabled = step === 2;
  }
  symbol.addEventListener("change", () => { step = 0; show(); });
  prefix.addEventListener("input", () => { step = 0; show(); });
  document.getElementById("wavelet-prev").addEventListener("click", () => { step--; show(); });
  document.getElementById("wavelet-next").addEventListener("click", () => { step++; show(); });
  document.getElementById("wavelet-reset").addEventListener("click", () => { step = 0; symbol.value = "C"; prefix.value = 7; show(); });
  show();
}
