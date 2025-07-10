(function () {
  const origFetch = window.fetch;

  window.fetch = async (...args) => {
    const url = args[0];

    const response = await origFetch(...args);
    const cloned = response.clone();

    try {
      const data = await cloned.json();

      if (url.includes('default/index/graphql')) {
        const railItems = [];

        const vehiclePositions = data?.data?.vehiclePositions || [];

        for (const item of vehiclePositions) {
          const mode = item?.trip?.route?.mode;
          if (mode === "RAIL") {
            railItems.push(item);
          }
        }

        window.dispatchEvent(new CustomEvent('RailDataIntercepted', { detail: railItems }));
      }
    } catch (err) {
      console.warn("JSON feldolgozási hiba:", err);
    }

    return response;
  };
})();
