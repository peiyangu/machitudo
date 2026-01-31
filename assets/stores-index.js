(function () {
  var sortMode = 'name'; // 'name' | 'booth'

  function getData() {
    if (typeof allStoresData !== 'undefined' && Array.isArray(allStoresData)) return allStoresData;
    if (Array.isArray(window.allStoresData)) return window.allStoresData;
    return [];
  }

  function getBoothList(boothNumber) {
    if (!boothNumber) return [];
    return String(boothNumber)
      .split(/[\s,、\/]+/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  function sortBoothList(list) {
    var arr = list.slice();
    arr.sort(function (a, b) {
      var an = parseInt(a, 10);
      var bn = parseInt(b, 10);
      var aNum = Number.isFinite(an);
      var bNum = Number.isFinite(bn);
      if (aNum && bNum) return an - bn;
      if (aNum && !bNum) return -1;
      if (!aNum && bNum) return 1;
      return String(a).localeCompare(String(b), 'ja');
    });
    return arr;
  }

  function collectItems() {
    var data = getData();
    var items = [];
    for (var i = 0; i < data.length; i++) {
      var s = data[i];
      var name = String(s.name || '').trim();
      if (!name) continue;
      var booths = sortBoothList(getBoothList(s.boothNumber));
      var primaryBooth = booths.length ? booths[0] : '';
      var primaryNum = Number.parseInt(primaryBooth, 10);
      if (!Number.isFinite(primaryNum)) primaryNum = NaN;
      items.push({ name: name, booths: booths, primaryBooth: primaryBooth, primaryNum: primaryNum });
    }
    return items;
  }

  function compareByName(a, b) {
    return a.name.localeCompare(b.name, 'ja');
  }

  function compareByBooth(a, b) {
    var an = a.primaryNum;
    var bn = b.primaryNum;
    var aHas = Number.isFinite(an);
    var bHas = Number.isFinite(bn);
    if (aHas && bHas) {
      if (an !== bn) return an - bn;
      // 同じ番号なら名前で
      return compareByName(a, b);
    }
    if (aHas && !bHas) return -1; // 番号がある方を先に
    if (!aHas && bHas) return 1;
    // どちらも非数値：文字比較（空は後ろ）
    var ap = a.primaryBooth || '';
    var bp = b.primaryBooth || '';
    if (ap && bp) {
      var cmp = ap.localeCompare(bp, 'ja');
      return cmp !== 0 ? cmp : compareByName(a, b);
    }
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;
    return compareByName(a, b);
  }

  function render(items) {
    var tbody = document.getElementById('storeIndexBody');
    var headingMode = document.getElementById('storeIndexMode');
    if (!tbody) return;

    // ソート
    var sorted = items.slice();
    if (sortMode === 'booth') {
      sorted.sort(compareByBooth);
      if (headingMode) headingMode.textContent = '（ブース番号順）';
    } else {
      sorted.sort(compareByName);
      if (headingMode) headingMode.textContent = '（あいうえお順）';
    }

    var frag = document.createDocumentFragment();
    for (var j = 0; j < sorted.length; j++) {
      var item = sorted[j];
      var tr = document.createElement('tr');

      var tdName = document.createElement('td');
      tdName.textContent = item.name;
      tdName.className = 'store-index-name-cell';

      var tdBooths = document.createElement('td');
      tdBooths.className = 'store-index-booths';

      if (item.booths.length) {
        for (var k = 0; k < item.booths.length; k++) {
          var b = item.booths[k];
          var a = document.createElement('a');
          a.href = 'venue-map.html?booth=' + encodeURIComponent(b);
          a.textContent = 'ブース ' + b;
          a.className = 'store-booth-badge';
          a.style.marginRight = '6px';
          a.setAttribute('title', '会場マップでブース ' + b + ' を表示');
          a.addEventListener('click', function () {
            try { sessionStorage.setItem('machitudo_visited', 'true'); } catch (_) {}
          });
          tdBooths.appendChild(a);
        }
      } else {
        var none = document.createElement('span');
        none.textContent = 'ブース未設定';
        none.style.color = '#888';
        tdBooths.appendChild(none);
      }
      tr.appendChild(tdName);
      tr.appendChild(tdBooths);
      frag.appendChild(tr);
    }
    tbody.innerHTML = '';
    tbody.appendChild(frag);
  }

  function init() {
    var items = collectItems();
    var btnName = document.getElementById('sortByNameBtn');
    var btnBooth = document.getElementById('sortByBoothBtn');

    function updateButtons() {
      if (btnName) btnName.setAttribute('aria-pressed', String(sortMode === 'name'));
      if (btnBooth) btnBooth.setAttribute('aria-pressed', String(sortMode === 'booth'));
    }

    if (btnName) {
      btnName.addEventListener('click', function () {
        sortMode = 'name';
        updateButtons();
        render(items);
      });
    }
    if (btnBooth) {
      btnBooth.addEventListener('click', function () {
        sortMode = 'booth';
        updateButtons();
        render(items);
      });
    }

    updateButtons();
    render(items);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
