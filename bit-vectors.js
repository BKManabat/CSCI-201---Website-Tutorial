"use strict";

function initBitVectors() {
  if (location.hash !== "#/succinct/bit-vectors") return;
  const lesson = document.getElementById("lesson-content");
  lesson.querySelector(".mini-label").hidden = true;
  lesson.querySelector("p").hidden = true;
  lesson.insertAdjacentHTML("beforeend", `
    <h3>Keep the bits, store a few counts</h3>
    <p>For <code>B = 1011010</code>, counting all seven bits gives four ones.
      Repeating that scan for every rank query repeats work. Instead, store
      counts at block boundaries and scan only the short remainder.</p>
    <p>Split this vector into small blocks of two bits:
      <code>10 | 11 | 01 | 0</code>. Group them into large blocks of four bits:
      <code>1011 | 010</code>. The final blocks can be shorter.</p>
    <div class="table-wrap"><table class="data-table">
      <caption>Stored counts for B = 1011010</caption>
      <thead><tr><th scope="col">Small-block start</th>
        <th scope="col">Large-block start</th>
        <th scope="col">Ones before large block</th>
        <th scope="col">Ones from large-block start to small-block start</th></tr></thead>
      <tbody>
        <tr><th scope="row">0</th><td>0</td><td>0</td><td>0</td></tr>
        <tr><th scope="row">2</th><td>0</td><td>0</td><td>1</td></tr>
        <tr><th scope="row">4</th><td>4</td><td>3</td><td>0</td></tr>
        <tr><th scope="row">6</th><td>4</td><td>3</td><td>1</td></tr>
      </tbody>
    </table></div>
    <p>The table repeats the large-block count to show which values go
      together. Only one absolute count per large block is needed.
      Each small block stores a count relative to its large-block start.</p>

    <div class="stepper" id="block-count-demo">
      <h3>Build a rank answer</h3>
      <p><label for="block-count-prefix">Prefix length i</label>
        <input type="range" id="block-count-prefix" min="0" max="7" value="7">
        <output id="block-count-length" for="block-count-prefix">7</output></p>
      <div id="block-count-result" class="stepper-output" aria-live="polite"></div>
      <div class="stepper-controls">
        <button type="button" class="btn secondary" id="block-count-prev">Shorter prefix</button>
        <button type="button" class="btn" id="block-count-next">Longer prefix</button>
        <button type="button" class="btn secondary" id="block-count-reset">Reset</button>
      </div>
    </div>
    <p>For <code>i = 7</code>, there are three ones before position 4,
      one in positions 4 and 5, and none in position 6.
      Therefore <code>rank₁(B, 7) = 3 + 1 + 0 = 4</code>.
      At an exact block boundary, the remainder is empty.
      The prefix always excludes position <code>i</code>.</p>

    <h3>Account for the storage</h3>
    <p>A packed vector of n bits needs n bits for the sequence itself.
      There are 2ⁿ possible binary sequences, so representing every such
      sequence requires at least n bits in the worst case.
      An index adds storage for answering queries.</p>
    <p>Storing a fixed-width count for every prefix needs
      ⌈log₂(n + 1)⌉ bits per count, or Θ(n log n) bits overall.
      Relative counts need fewer bits because they count only within a
      large block. For this example, a global count from 0 to 7 needs
      three bits. A count from 0 to 4 also needs three bits, so this tiny
      example does not demonstrate a space saving.</p>
    <p>A succinct bit-vector representation uses n + o(n) bits in total.
      The extra storage divided by n approaches zero as n grows.
      This is an asymptotic guarantee, not a promise that the overhead
      is small for every input size.</p>
    <p>In the theoretical construction, large blocks have about (log₂ n)²
      bits and small blocks about (log₂ n)/2 bits. A shared lookup table
      supplies the remaining small-block count. These choices give o(n)
      auxiliary bits and constant-time rank on a word RAM with
      Θ(log n)-bit words. Select needs additional indexing [1].</p>
    <p>The four-bit and two-bit blocks above only illustrate the sum.
      This page stores its example as a JavaScript string and scans the
      remainder. It does not implement the packed representation or the
      constant-time lookup table.</p>
    <p>Compare this with the
      <a href="#/fm-index/rank-checkpoints">FM-index checkpoint lesson</a>,
      or return to <a href="#/succinct/rank-select">rank and select</a>
      to check the query definitions.</p>
    <h3>Reference</h3>
    <p>[1] Gonzalo Navarro, <a href="https://doi.org/10.1016/j.jda.2013.07.004"
      target="_blank" rel="noopener noreferrer">Wavelet Trees for All</a>,
      Journal of Discrete Algorithms 25 (2014), 2–20, Section 2.2.
      <a href="https://users.dcc.uchile.cl/~gnavarro/ps/jda13.pdf"
      target="_blank" rel="noopener noreferrer">Author's version</a>.</p>
  `);

  const B = "1011010";
  const largeCounts = [0, 3];
  const smallCounts = [0, 1, 0, 1];
  const prefix = document.getElementById("block-count-prefix");
  const previous = document.getElementById("block-count-prev");
  const next = document.getElementById("block-count-next");

  function showCount() {
    const i = Number(prefix.value);
    const large = Math.floor(i / 4) * 4;
    const small = Math.floor(i / 2) * 2;
    const a = largeCounts[large / 4];
    const b = smallCounts[small / 2];
    const rest = B.slice(small, i);
    let c = 0;
    for (const bit of rest) if (bit === "1") c++;
    document.getElementById("block-count-length").textContent = i;
    document.getElementById("block-count-result").innerHTML = `
      <ol>
        <li>Read the count before large-block start ${large}: <strong>${a}</strong>.</li>
        <li>Read the relative count from ${large} up to small-block start ${small}: <strong>${b}</strong>.</li>
        <li>Scan B[${small}..${i}), the remainder <code>${rest || "empty"}</code>: <strong>${c}</strong> ones.</li>
      </ol>
      <p><code>rank₁(B, ${i}) = ${a} + ${b} + ${c} = ${a + b + c}</code>.</p>
      <p>Only ${rest.length} of the ${i} prefix bits were scanned for this query.</p>`;
    previous.disabled = i === 0;
    next.disabled = i === B.length;
  }
  prefix.addEventListener("input", showCount);
  previous.addEventListener("click", () => { prefix.value = Number(prefix.value) - 1; showCount(); });
  next.addEventListener("click", () => { prefix.value = Number(prefix.value) + 1; showCount(); });
  document.getElementById("block-count-reset").addEventListener("click", () => { prefix.value = 7; showCount(); });
  showCount();
}
