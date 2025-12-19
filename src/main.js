(async () => {
  const BASE = location.origin + "/stdt/list_questionnaire";

  let attend = 0;
  let absent = 0;

  const getLastPage = async () => {
    const html = await fetch(BASE).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const last = [...doc.querySelectorAll(".pagination a")]
      .find(a => a.textContent.includes("Last"));
    return last ? Number(new URL(last.href).searchParams.get("page")) : 1;
  };

  const lastPage = await getLastPage();

  for (let page = 1; page <= lastPage; page++) {
    const url = page === 1 ? BASE : `${BASE}?page=${page}`;
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    doc.querySelectorAll("table.underline tbody tr").forEach(tr => {
      const result = tr.querySelectorAll("td")[2].innerText.trim();
      if (result === "出席") attend++;
      if (result === "欠席") absent++;
    });
  }

  const total = attend + absent;
  const rate = total ? ((attend / total) * 100).toFixed(2) : "0.00";

  alert(
    `出席率集計結果\n\n` +
    `出席: ${attend}\n` +
    `欠席: ${absent}\n` +
    `出席率: ${rate}%`
  );
})();
