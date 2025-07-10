chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const formatLazarTime = (sec) => {
        if (sec == null || isNaN(sec)) return "-";
        const h = Math.floor(sec / 3600) % 24;
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
      };

      const existing = document.getElementById("rail-slideout");
      if (existing) {
        existing.remove();
        return;
      }

      const container = document.createElement("div");
      container.id = "rail-slideout";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.right = "0";
      container.style.width = "300px";
      container.style.height = "100vh";
      container.style.background = "white";
      container.style.borderLeft = "1px solid #ccc";
      container.style.zIndex = "99999";
      container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
      container.style.overflowY = "auto";
      container.style.transition = "transform 0.3s ease-in-out";
      container.style.transform = "translateX(0)";
      container.innerHTML = `<h3 style="margin:1rem; ">🚆 Vonat lista</h3><p style="padding:1rem;">Ha a panel nyitva, zoomolj a térképen, hogy frissüljön a lista</p><div id="railContent" style="padding:1rem;font-family:monospace;font-size:12px"></div>`;

      document.body.appendChild(container);

      window.addEventListener("RailDataIntercepted", (e) => {
        const railContent = document.getElementById("railContent");
        if (!railContent) return;

        const trainSortedList = e.detail.sort(
          (a, b) =>
            (b.prevOrCurrentStop.arrivalDelay || 0) -
            (a.prevOrCurrentStop.arrivalDelay || 0)
        );

        const list = trainSortedList
          .map((stop) => {
            const delay = stop.prevOrCurrentStop.arrivalDelay || 0;
            const hasDelay = delay > 0;
            const hasBigDelay = delay > 600;
            const bgColor = hasDelay
              ? hasBigDelay
                ? "background-color: #c94747"
                : "background-color: orange"
              : "";

            return `
      <div style="margin-bottom:8px; border-bottom: 1px dashed #000; ${bgColor}">
           <span style="font-weight:bold;"> vonat: ${
             stop.trip.tripShortName
           } - ${stop.trip.tripHeadsign} felé</span><br>
        ⏱ késés: ${formatLazarTime(delay)}<br>
        ⏱ köv.állomás: ${
          stop.stopRelationship !== null
            ? formatLazarTime(stop.stopRelationship.arrivalTime)
            : "-"
        } ${
              stop.stopRelationship !== null
                ? stop.stopRelationship.stop.name
                : "-"
            } 
      </div>
    `;
          })
          .join("");

        railContent.innerHTML = list;
      });
    },
  });
});
