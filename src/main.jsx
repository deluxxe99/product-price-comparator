
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

function ProductPriceComparator() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("searchHistory");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const fetchComparison = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/compare?query=" + encodeURIComponent(query));
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setResults(data);
      setSearchHistory((prev) => [...new Set([query, ...prev])].slice(0, 10));
    } catch (err) {
      setError("Error fetching comparison data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateProfitMargin = (prices) => {
    const values = Object.values(prices).map((p) => parseFloat(p.price.replace(/[^\d.]/g, "")));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return ((max - min) / min) * 100;
  };

  return (
    <div style={{ padding: 20, maxWidth: 960, margin: '0 auto' }}>
      <h1>🛒 Marketplace Price Comparator</h1>
      <p>Compare product prices across Amazon, eBay, and Walmart to find the best deal or resale opportunity.</p>
      <div style={{ marginBottom: 20 }}>
        <input
          style={{ padding: 8, width: '70%' }}
          placeholder="Search product"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={fetchComparison} style={{ padding: 8, marginLeft: 8 }}>
          {loading ? "Searching..." : "Compare Prices"}
        </button>
      </div>
      {searchHistory.length > 0 && (
        <div>
          <strong>Recent Searches:</strong>
          <div>
            {searchHistory.map((item, index) => (
              <button key={index} onClick={() => { setQuery(item); fetchComparison(); }} style={{ margin: 4 }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {Object.keys(results).length > 0 && (
        <div style={{ display: 'flex', gap: 20 }}>
          {Object.entries(results).map(([store, data]) => (
            <div key={store} style={{ border: '1px solid #ddd', padding: 16 }}>
              <h2>{store}</h2>
              <p>{data.price}</p>
              <a href={data.url} target="_blank" rel="noopener noreferrer">View</a>
            </div>
          ))}
        </div>
      )}
      {Object.keys(results).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <strong>
            Estimated Profit Margin: {calculateProfitMargin(results).toFixed(2)}%
          </strong>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ProductPriceComparator />);
