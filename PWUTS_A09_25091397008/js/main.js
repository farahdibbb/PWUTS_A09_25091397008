$(function () {
  const PAGES = { beranda: 'pages/beranda.html', status: 'pages/status.html', ulasan: 'pages/ulasan.html' };
  const rp = n => 'Rp' + Number(n).toLocaleString('id-ID');

  /* ===== Layout utama: navigasi Ajax ===== */
  function go(key, push) {
    if (!PAGES[key]) key = 'beranda';
    if (push) history.pushState(null, '', '#' + key);
    $('#nav a').removeClass('active').filter('[href="#' + key + '"]').addClass('active');
    $('#nav').removeClass('open'); $('#menuBtn').attr('aria-expanded', false);
    $('#content').html('<p class="loading">Memuat halaman…</p>')
      .load(PAGES[key], function (res, status) {
        if (status === 'error') {
          $(this).html('<div class="alert err">Halaman gagal dimuat. Jalankan lewat server lokal (Laragon, XAMPP, atau Live Server), bukan dengan membuka file langsung.</div>');
        } else { window.scrollTo(0, 0); }
      });
  }
  $(document).on('click', '#nav a, [data-go]', function (e) {
    e.preventDefault();
    go($(this).data('go') || this.hash.slice(1), true);
  });
  $(window).on('popstate', () => go(location.hash.slice(1)));
  go(location.hash.slice(1));

  $('#menuBtn').on('click', function () {
    const o = $('#nav').toggleClass('open').hasClass('open'); $(this).attr('aria-expanded', o);
  });

  /* ===== Mode terang/gelap ===== */
  function setTheme(t) {
    $('html').attr('data-theme', t);
    $('#themeBtn').text(t === 'dark' ? 'Mode terang' : 'Mode gelap');
    try { localStorage.setItem('hola-theme', t); } catch (e) {}
  }
  let saved = null; try { saved = localStorage.getItem('hola-theme'); } catch (e) {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('#themeBtn').on('click', () => setTheme($('html').attr('data-theme') === 'dark' ? 'light' : 'dark'));

  /* ===== Halaman 2.b: Cek status + simulasi ===== */
  const STEPS = ['Sedang Diproses', 'Siap Diambil', 'Selesai'];
  const DATA = {
    '1234': { kode: 'HOLA-261026-1234', nama: 'Budi S.', layanan: 'Cuci Setrika', berat: 3.5, total: 31500, lunas: false, step: 0 },
    '5678': { kode: 'HOLA-261025-5678', nama: 'Sari W.', layanan: 'Express', berat: 2, total: 24000, lunas: true, step: 1 },
    '9012': { kode: 'HOLA-261025-9012', nama: 'Andi P.', layanan: 'Cuci Reguler', berat: 5, total: 35000, lunas: false, step: 1 },
    '7788': { kode: 'HOLA-261023-7788', nama: 'Dewi L.', layanan: 'Cuci Setrika', berat: 6, total: 54000, lunas: true, step: 2 },
    '3456': { kode: 'HOLA-261024-3456', nama: 'Rina K.', layanan: 'Setrika Saja', berat: 4, total: 20000, lunas: true, step: 2 }
  };
  const DEFAULT = JSON.parse(JSON.stringify(DATA));
  try {
    const o = JSON.parse(localStorage.getItem('hola-status')) || {};
    Object.keys(o).forEach(k => DATA[k] && $.extend(DATA[k], o[k]));
  } catch (e) {}
  function simpanStatus() {
    const o = {}; Object.keys(DATA).forEach(k => o[k] = { step: DATA[k].step, lunas: DATA[k].lunas });
    try { localStorage.setItem('hola-status', JSON.stringify(o)); } catch (e) {}
  }
  let cur = null, curKey = null;

  function render(note) {
    const d = cur;
    const li = STEPS.map((s, i) => `<li class="${i < d.step ? 'done' : i === d.step ? 'done now' : ''}">${s}</li>`).join('');
    $('#trackResult').html(`
      <div class="card">
        <h2>${d.kode}</h2>
        <ol class="steps" aria-label="Progres cucian">${li}</ol>
        <p><strong>Status sekarang: ${STEPS[d.step]}</strong></p>
        <dl class="detail">
          <div><dt>Nama</dt><dd>${d.nama}</dd></div>
          <div><dt>Layanan</dt><dd>${d.layanan}</dd></div>
          <div><dt>Berat</dt><dd>${d.berat} kg</dd></div>
          <div><dt>Total biaya</dt><dd>${rp(d.total)}</dd></div>
          <div><dt>Pembayaran</dt><dd><span class="badge ${d.lunas ? 'lunas' : 'belum'}">${d.lunas ? 'Lunas' : 'Belum Lunas'}</span></dd></div>
        </dl>
        ${d.step === 1 && d.lunas ? '<div class="alert ok">Cucianmu siap diambil. Tunjukkan nomor resi ke kasir.</div>' : ''}
        ${d.step === 1 && !d.lunas ? '<div class="alert warn">Lunasi pembayaran di gerai agar pesanan bisa diselesaikan.</div>' : ''}
        ${d.step === 2 ? '<div class="alert ok">Cucian sudah selesai. <a href="#ulasan" data-go="ulasan" class="pakai-resi">Tulis ulasan</a></div>' : ''}
        ${note || ''}
      </div>`);
  }

  function cari(val) {
    const $e = $('#resiErr'), $i = $('#resi');
    $('#trackResult').empty();
    if (!/^\d{4}$/.test(val)) {
      $i.addClass('invalid'); $e.text(val ? 'Resi harus 4 angka.' : 'Isi 4 digit terakhir nomor resi.'); return;
    }
    $i.removeClass('invalid'); $e.text('');
    if (!DATA[val]) {
      $('#trackResult').html('<div class="alert err">Resi tidak ditemukan. Periksa lagi angka di struk nota kamu.</div>'); cur = null; return;
    }
    curKey = val; cur = DATA[val]; render();
  }

  $(document).on('input', '#resi', function () { this.value = this.value.replace(/\D/g, ''); });
  $(document).on('submit', '#trackForm', function (e) { e.preventDefault(); cari($.trim($('#resi').val())); });
  $(document).on('click', '.chip', function () { $('#resi').val($(this).data('r')); cari($(this).data('r') + ''); });

  /* ===== Halaman 2.c: Form ulasan + validasi ===== */
  let ulasan = [];
  try { ulasan = JSON.parse(localStorage.getItem('hola-ulasan')) || []; } catch (e) {}
  if (!ulasan.length) ulasan = [
    { nama: 'Sari W.', rating: 5, kategori: 'Kecepatan', komentar: 'Express beneran selesai besoknya, bajunya wangi dan rapi.' },
    { nama: 'Andi P.', rating: 4, kategori: 'Keramahan kasir', komentar: 'Kasirnya ramah, status cucian mudah dicek dari HP.' },
    { nama: 'Lina M.', rating: 3, kategori: 'Harga', komentar: 'Hasil bagus, tapi harga setrika saja agak mahal buat saya.' }
  ];
  const simpan = () => { try { localStorage.setItem('hola-ulasan', JSON.stringify(ulasan)); } catch (e) {} };

  function tampilUlasan() {
    const $l = $('#daftarUlasan').empty();
    if (!$l.length) return;
    ulasan.slice().reverse().forEach(u => {
      const $c = $('<div class="card ulasan">');
      $('<div>').append($('<strong>').text(u.nama), ' ',
        $('<span class="bintang">').text('★'.repeat(u.rating) + '☆'.repeat(5 - u.rating)), ' ',
        $('<span class="hint">').text(u.kategori)).appendTo($c);
      $('<p>').text(u.komentar).appendTo($c);
      $l.append($c);
    });
    const avg = ulasan.reduce((a, u) => a + u.rating, 0) / ulasan.length;
    $('#rataRata').text('· rata-rata ' + avg.toFixed(1).replace('.', ',') + ' dari ' + ulasan.length + ' ulasan');
  }

  const RULES = {
    nama: v => !v ? 'Nama wajib diisi.' : v.length < 3 ? 'Nama minimal 3 huruf.' : !/^[A-Za-z .'-]+$/.test(v) ? 'Nama hanya boleh berisi huruf.' : '',
    resi: v => !/^\d{4}$/.test(v) ? 'Isi 4 digit terakhir resi.' : !DATA[v] ? 'Resi tidak ditemukan.'
      : DATA[v].step < 2 ? 'Cucian belum selesai. Ulasan bisa diisi setelah status Selesai.'
      : ulasan.some(u => u.resi === v) ? 'Resi ini sudah pernah diulas.' : '',
    rating: v => v ? '' : 'Pilih jumlah bintang.',
    kategori: v => v ? '' : 'Pilih hal yang dinilai.',
    komentar: v => v.length < 10 ? 'Komentar minimal 10 karakter.' : v.length > 300 ? 'Komentar maksimal 300 karakter.' : '',
    setuju: v => v ? '' : 'Centang persetujuan untuk melanjutkan.'
  };
  function nilai($f) {
    const n = $f.attr('name');
    if (n === 'rating') return $('#ulasanForm [name=rating]:checked').val() || '';
    if (n === 'setuju') return $f.is(':checked') ? '1' : '';
    return $.trim($f.val());
  }
  function cek($f) {
    const n = $f.attr('name'), msg = RULES[n](nilai($f));
    if (n === 'rating') { $('#ratingErr').text(msg); return !msg; }
    $f.toggleClass('invalid', !!msg);
    $f.closest('label').length && n === 'setuju' ? $f.closest('label').next('.err-msg').text(msg) : $f.nextAll('.err-msg').first().text(msg);
    return !msg;
  }
  $(document).on('input change', '#ulasanForm :input', function () {
    if (this.name === 'resi') this.value = this.value.replace(/\D/g, '');
    if (this.name in RULES && ($(this).hasClass('invalid') || this.name === 'rating' || this.name === 'setuju')) cek($(this));
    $('#cnt').text($('#komentar').val().length);
  });
  $(document).on('blur', '#ulasanForm [name]', function () { if (this.name in RULES && this.name !== 'rating') cek($(this)); });

  // tombol "Tulis ulasan" dari halaman status: isi resi otomatis setelah halaman termuat
  $(document).on('click', '.pakai-resi', function () { pendingResi = curKey; });
  let pendingResi = null;
  $(document).ajaxComplete(function (e, x, o) {
    if (o.url && o.url.indexOf('ulasan.html') > -1) { tampilUlasan(); if (pendingResi) { $('#ulasanForm #resi').val(pendingResi); pendingResi = null; } }
  });

  $(document).on('submit', '#ulasanForm', function (e) {
    e.preventDefault();
    const $f = $(this); let ok = true, $first = null;
    $f.find('[name]').each(function () { if (!cek($(this))) { ok = false; $first = $first || $(this); } });
    if (!ok) { $first.focus(); $('#ulasanMsg').html('<div class="alert err">Periksa kembali isian yang bertanda merah.</div>'); return; }
    const u = { nama: nilai($('#nama')), resi: nilai($('#resi')), rating: +nilai($f.find('[name=rating]')), kategori: $('#kategori').val(), komentar: nilai($('#komentar')) };
    const $btn = $f.find('button[type=submit]').prop('disabled', true).text('Mengirim…');
    // Kirim ke server HTTP publik (API uji jsonplaceholder), tanpa PHP
    $.ajax({ url: 'https://jsonplaceholder.typicode.com/posts', method: 'POST', contentType: 'application/json', data: JSON.stringify(u), dataType: 'json' })
      .done(function () {
        ulasan.push(u); simpan(); tampilUlasan();
        $('#ulasanMsg').html('<div class="alert ok">Terima kasih, ulasanmu sudah terkirim.</div>');
        $f[0].reset(); $('#cnt').text(0);
      })
      .fail(() => $('#ulasanMsg').html('<div class="alert err">Gagal terhubung ke server. Periksa koneksi internet lalu kirim ulang.</div>'))
      .always(() => $btn.prop('disabled', false).text('Kirim ulasan'));
  });
});
