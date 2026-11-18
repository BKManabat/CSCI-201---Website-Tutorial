"use strict";

function initCompressedSuffix() {
  const route = location.hash.split("/")[2];
  if (!location.hash.startsWith("#/compressed/")) return;
  const content = {
    "compressed-sa": `
      <h3>Count first, locate separately</h3>
      <p>Searching for <code>ana</code> in <code>banana$</code> gives suffix-array
        interval [2, 4). Its width gives two matches. Their text positions are
        SA[2] = 3 and SA[3] = 1.</p>
      <p>A plain suffix array stores n positions using Θ(n log n) bits.
        Compressed suffix arrays support queries without storing every position
        as a full-width integer. Grossi and Vitter give an O(n log σ)-bit
        representation for a fixed trade-off parameter, with different costs
        for retrieving positions [1].</p>
      <p>The FM-index uses a related approach: store selected suffix-array values
        and follow LF to recover missing values [2]. This sampling example is not
        an implementation of Grossi and Vitter's full structure.</p>
      <div class="table-wrap"><table class="data-table"><caption>Sample text positions divisible by 2</caption>
        <thead><tr><th>Row</th><th>SA value</th><th>Stored?</th></tr></thead>
        <tbody><tr><td>0</td><td>6</td><td>Yes</td></tr><tr><td>1</td><td>5</td><td>No</td></tr>
        <tr><td>2</td><td>3</td><td>No</td></tr><tr><td>3</td><td>1</td><td>No</td></tr>
        <tr><td>4</td><td>0</td><td>Yes</td></tr><tr><td>5</td><td>4</td><td>Yes</td></tr>
        <tr><td>6</td><td>2</td><td>Yes</td></tr></tbody></table></div>
      <p>For row 2, LF(2) = 6 and the stored SA[6] is 2. Add the one LF step
        to recover 3. For row 3, LF(3) = 4 and SA[4] is 0, giving 1.</p>
      <div class="formula">SA[i] = (SA[j] + t) mod n</div>
      <p>Here t LF steps reach sampled row j. LF decreases the text position
        by one modulo n. Sampling values divisible by d guarantees at most
        d − 1 steps. Sampling every d-th row does not give that guarantee.</p>
      <p>Use the <a href="#/fm-index/sa-sampling">existing sampling walkthrough</a>
        for the LF trace, then <a href="#/compressed/tradeoffs">change the sampling interval</a>.</p>
      <h3>Reference</h3><p>[1] Roberto Grossi and Jeffrey Scott Vitter (2005),
        <a href="https://doi.org/10.1137/S0097539702402354">Compressed Suffix Arrays and Suffix Trees with Applications to Text Indexing and String Matching</a>.</p>
      <p>[2] Eddie Ferro and Christina Boucher (2025), <a href="https://doi.org/10.4230/OASIcs.Manzini.2025.6">Optimizing the Performance of the FM-Index for Large-Scale Data</a>.</p>`,
    "compressed-st": `
      <h3>Represent shared prefixes</h3>
      <p>The suffixes <code>ana$</code> and <code>anana$</code> share the prefix
        <code>ana</code>. Their lowest common ancestor in a suffix tree has
        string depth 3. String depth counts characters, not tree edges.</p>
      <p>A compressed suffix tree combines compact sequence information with
        tree navigation. One implementation uses a compressed suffix array,
        compressed longest-common-prefix information, balanced parentheses for
        topology, and support for lowest-common-ancestor queries [1, 2].</p>
      <h3>Encode the branching structure</h3>
      <p>Start with this whole ordered tree. It illustrates topology only,
        not the complete suffix tree of <code>banana$</code>.</p>
      <pre style="overflow-x:auto">        R
       / \\
      U   c
     / \\
    a   b</pre>
      <p>Write an opening parenthesis when entering a node and a closing one
        when leaving it. Visit children from left to right.</p>
      <div class="stepper" id="topology-demo"><div id="topology-result" class="stepper-output" aria-live="polite"></div>
        <div class="stepper-controls"><button type="button" class="btn secondary" id="topology-prev">Previous</button>
        <button type="button" class="btn" id="topology-next">Next step</button>
        <button type="button" class="btn secondary" id="topology-reset">Reset</button></div></div>
      <p>Five nodes produce ten parentheses: <code>((()())())</code>.
        Encoding each parenthesis with one bit uses 2N bits for N nodes,
        before navigation indexes. This stores branching structure only.
        Text access, suffix positions, and string depths need other components.</p>
      <p>Sadakane's compressed suffix tree supports full suffix-tree functionality
        in O(n log σ) bits. Operation costs vary. Compression does not imply
        that every navigation operation remains constant-time [1].</p>
      <h3>References</h3><p>[1] Kunihiko Sadakane (2007),
        <a href="https://doi.org/10.1007/s00224-006-1198-x">Compressed Suffix Trees with Full Functionality</a>.</p>
      <p>[2] Niko Välimäki, Veli Mäkinen, Wolfgang Gerlach, and Kashyap Dixit,
        <a href="https://doi.org/10.1145/1498698.1594228">Engineering a Compressed Suffix Tree Implementation</a>, ACM Journal of Experimental Algorithmics 14.</p>`,
    "tradeoffs": `
      <h3>Store fewer positions, follow more LF steps</h3>
      <p>For <code>banana$</code>, keep suffix-array values divisible by d.
        Increase d to store fewer samples. Some rows then need more LF steps
        before reaching a sample. This changes locating, not the backward-search interval.</p>
      <div class="stepper" id="sampling-demo"><p><label for="sampling-distance">Sampling interval d</label>
        <select id="sampling-distance"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></p>
        <div id="sampling-result" aria-live="polite"></div></div>
      <p>There are ⌈n/d⌉ stored values, each needing ⌈log₂ n⌉ bits in a
        fixed-width representation. A separate structure must identify sampled
        rows and map them to these values. The table counts sample values only,
        not the whole index.</p>
      <p>With constant-time sample lookup and LF cost tLF, locating one result
        takes O(1 + d tLF). The bound follows from at most d − 1 LF steps.</p>
      <h3>Choose the operations you need</h3>
      <ul><li>Rank/select supports queries on bit vectors.</li>
        <li>A wavelet tree extends rank to a larger alphabet.</li>
        <li>An FM-index counts matches and uses sampling to locate them.</li>
        <li>A compressed suffix tree adds navigation over shared prefixes.</li></ul>
      <p>A read search that only counts and locates patterns may not need full
        suffix-tree navigation. Analyses using suffix links or shared-prefix
        relationships need more operations. Compare both storage and query time
        for the actual workload. A smaller representation is not automatically faster.</p>
      <p>The explorer retains the full suffix array to show and check the example.
        It is not itself a compressed index.</p>
      <h3>Reference</h3><p>Gonzalo Navarro (2014),
        <a href="https://doi.org/10.1016/j.jda.2013.07.004">Wavelet Trees for All</a>,
        and the sources in <a href="#/compressed/compressed-sa">Compressed Suffix Arrays</a>
        and <a href="#/compressed/compressed-st">Compressed Suffix Trees</a>.
        For FM-index sampling, see Ferro and Boucher (2025),
        <a href="https://doi.org/10.4230/OASIcs.Manzini.2025.6">Optimizing the Performance of the FM-Index for Large-Scale Data</a>.</p>`
  };
  if (!content[route]) return;
  const lesson = document.getElementById("lesson-content");
  lesson.querySelector(".mini-label").hidden = true;
  lesson.querySelector("p").hidden = true;
  lesson.insertAdjacentHTML("beforeend", content[route]);
  if (route === "compressed-st") {
    const visits = ["Enter R", "Enter U", "Enter a", "Leave a", "Enter b", "Leave b", "Leave U", "Enter c", "Leave c", "Leave R"];
    const parentheses = "((()())())";
    let step = 0;
    function show() {
      document.getElementById("topology-result").textContent = step === 0 ? "Start before entering the root. No parentheses yet." : `${visits[step - 1]}. Sequence so far: ${parentheses.slice(0, step)} (${step} of 10 parentheses).`;
      document.getElementById("topology-prev").disabled = step === 0;
      document.getElementById("topology-next").disabled = step === 10;
    }
    document.getElementById("topology-prev").addEventListener("click", () => { step--; show(); });
    document.getElementById("topology-next").addEventListener("click", () => { step++; show(); });
    document.getElementById("topology-reset").addEventListener("click", () => { step = 0; show(); });
    show();
  }
  if (route === "tradeoffs") {
    const SA = [6, 5, 3, 1, 0, 4, 2], LF = [1, 5, 6, 4, 0, 2, 3];
    function show() {
      const d = Number(document.getElementById("sampling-distance").value);
      const samples = SA.filter(v => v % d === 0);
      const rows = SA.map((value, i) => {
        let j = i, steps = 0;
        const path = [i];
        while (SA[j] % d !== 0) { j = LF[j]; steps++; path.push(j); }
        return `<tr><th scope="row">${i}</th><td>${value}</td><td>${value % d === 0 ? "Yes" : "No"}</td><td>${path.join(" → ")}</td><td>${steps}</td><td>(${SA[j]} + ${steps}) mod 7 = ${(SA[j] + steps) % 7}</td></tr>`;
      }).join("");
      document.getElementById("sampling-result").innerHTML = `<p>${samples.length} sampled values use ${samples.length * 3} bits at three bits each. Full SA values use 21 bits.</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Row</th><th>SA</th><th>Stored?</th><th>LF row path</th><th>Steps</th><th>Recovered SA</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    document.getElementById("sampling-distance").addEventListener("change", show);
    show();
  }
}
