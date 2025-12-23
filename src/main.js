async function main() {
  const BASE = location.origin + "/stdt/list_questionnaire";

  let attend = 0;
  let absent = 0;
  const statsByMonth = {};

  const status = document.createElement("div");
  status.style.cssText = `
    position:fixed;
    bottom:20px;
    right:20px;
    padding:10px 14px;
    background:#333;
    color:#fff;
    font-size:14px;
    z-index:99999;
    border-radius:6px;
  `;
  status.textContent = "出席率集計中…";
  document.body.appendChild(status);

  const getLastPage = async () => {
    const html = await fetch(BASE).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const last = [...doc.querySelectorAll(".pagination a")]
      .find(a => a.textContent.includes("Last"));
    return last ? Number(new URL(last.href).searchParams.get("page")) : 1;
  };

  const lastPage = await getLastPage();

  for (let page = 1; page <= lastPage; page++) {
    status.textContent = `出席率集計中… ${page}/${lastPage} ページ`;

    const url = page === 1 ? BASE : `${BASE}?page=${page}`;
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    doc.querySelectorAll("table.underline tbody tr").forEach(tr => {
      const tds = tr.querySelectorAll("td");

      const comment = tds[4].innerText.trim();
      const dateText = tds[6].innerText;

      const match = dateText.match(/(\d{4})年(\d{1,2})月/);
      if (!match) return;

      const monthKey = `${match[1]}-${match[2].padStart(2, "0")}`;

      if (!statsByMonth[monthKey]) {
        statsByMonth[monthKey] = { attend: 0, absent: 0 };
      }

      if (comment === "") {
        absent++;
        statsByMonth[monthKey].absent++;
      } else {
        attend++;
        statsByMonth[monthKey].attend++;
      }
    });
  }

  status.remove();

  const total = attend + absent;
  const overallRate = total ? ((attend / total) * 100).toFixed(2) : "0.00";

  let best = null;
  let worst = null;

  for (const [month, v] of Object.entries(statsByMonth)) {
    const t = v.attend + v.absent;
    if (t === 0) continue;

    const rate = (v.attend / t) * 100;

    if (!best || rate > best.rate) best = { month, ...v, rate };
    if (!worst || rate < worst.rate) worst = { month, ...v, rate };
  }

  alert(
    `出席率集計結果\n\n` +
    `【全体】\n` +
    `出席: ${attend}\n` +
    `欠席: ${absent}\n` +
    `出席率: ${overallRate}%\n\n` +
    `一番出席している月\n` +
    `${best.month}: ${best.rate.toFixed(1)}%\n` +
    `（出席 ${best.attend} / 欠席 ${best.absent}）\n\n` +
    `一番出席していない月\n` +
    `${worst.month}: ${worst.rate.toFixed(1)}%\n` +
    `（出席 ${worst.attend} / 欠席 ${worst.absent}）`
  );
}
