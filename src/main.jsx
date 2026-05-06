import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  comparisonTables,
  quizQuestions,
  searchableTerms,
  timeline,
  topics,
} from "./data";
import "./styles.css";

const storageKeys = {
  learned: "art-history-site:learned",
  favorites: "art-history-site:favorites",
  notes: "art-history-site:notes",
  quiz: "art-history-site:quiz",
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 浏览器隐私模式可能禁用 localStorage，学习功能仍可继续使用。
  }
}

function getAllPages() {
  return topics.flatMap((topic) => topic.pages.map((page) => ({ ...page, topic })));
}

function getPageKey(topicId, pageNumber) {
  return `${topicId}:page${String(pageNumber).padStart(2, "0")}`;
}

function PageImage({ page, className = "" }) {
  const [missing, setMissing] = useState(false);
  const topicCode = page.topicId;
  const pageCode = `page${String(page.pageNumber).padStart(2, "0")}`;

  if (missing) {
    return (
      <div className={`missing-image ${className}`}>
        图片缺失：请放入 public/art/{topicCode}/{pageCode}.png
      </div>
    );
  }

  return (
    <img
      src={page.image}
      alt={`${page.title}`}
      className={className}
      onError={() => setMissing(true)}
    />
  );
}

function Header({ activeView, onNavigate }) {
  const navItems = [
    ["home", "首页"],
    ["topics", "专题学习"],
    ["reader", "课件阅读器"],
    ["timeline", "时间轴"],
    ["compare", "风格比较"],
    ["quiz", "看图识别"],
    ["search", "搜索"],
    ["progress", "学习记录"],
    ["detect", "图片检测"],
  ];

  return (
    <header className="site-header">
      <div>
        <p className="eyebrow">Museum Learning Companion</p>
        <h1>世界美术史视觉学习站</h1>
        <p className="subtitle">
          用30张图，从史前艺术、中世纪宗教艺术到文艺复兴，建立美术史主线与看图识别能力。
        </p>
      </div>
      <nav className="nav-tabs" aria-label="主导航">
        {navItems.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeView === key ? "active" : ""}
            onClick={() => onNavigate(key)}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function Home({ learnedCount, totalPages, onOpenTopic, onOpenReader }) {
  return (
    <main className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">30 Images / 3 Topics</p>
          <h2>从图像进入美术史主线</h2>
          <p>
            以专题、时间轴、风格比较和看图识别训练组织学习，适合课堂预习、复习和快速建立图像辨认能力。
          </p>
        </div>
        <div className="progress-medallion">
          <strong>{learnedCount}</strong>
          <span>/ {totalPages}</span>
          <small>已学习页数</small>
        </div>
      </section>

      <section className="topic-card-grid">
        {topics.map((topic) => (
          <article className="topic-card" key={topic.id}>
            <p className="topic-order">{topic.order}</p>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            <div className="card-actions">
              <button type="button" onClick={() => onOpenTopic(topic.id)}>
                进入专题
              </button>
              <button type="button" className="ghost" onClick={() => onOpenReader(topic.id, 1)}>
                阅读第1页
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function TopicLearning({ selectedTopicId, learned, favorites, onSelectTopic, onOpenReader }) {
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? topics[0];

  return (
    <main className="two-column">
      <aside className="sidebar-card">
        <h2>专题学习</h2>
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className={topic.id === selectedTopic.id ? "topic-switch active" : "topic-switch"}
            onClick={() => onSelectTopic(topic.id)}
          >
            <span>{topic.order}</span>
            {topic.title}
          </button>
        ))}
      </aside>

      <section className="content-card">
        <p className="eyebrow">{selectedTopic.order}</p>
        <h2>{selectedTopic.title}</h2>
        <p className="lead">{selectedTopic.description}</p>
        <div className="page-list">
          {selectedTopic.pages.map((page) => {
            const key = getPageKey(page.topicId, page.pageNumber);
            return (
              <button
                key={page.id}
                type="button"
                className="page-row"
                onClick={() => onOpenReader(page.topicId, page.pageNumber)}
              >
                <span className="page-number">{page.pageNumber}</span>
                <span>
                  <strong>{page.title}</strong>
                  <small>
                    {learned.includes(key) ? "已学习" : "未学习"}
                    {favorites.includes(key) ? " · 已收藏" : ""}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Reader({
  selectedTopicId,
  selectedPageNumber,
  learned,
  favorites,
  notes,
  onSelectTopic,
  onSelectPage,
  onToggleLearned,
  onToggleFavorite,
  onUpdateNote,
}) {
  const topic = topics.find((item) => item.id === selectedTopicId) ?? topics[0];
  const page = topic.pages.find((item) => item.pageNumber === selectedPageNumber) ?? topic.pages[0];
  const pageKey = getPageKey(topic.id, page.pageNumber);
  const note = notes[pageKey] ?? "";

  return (
    <main className="reader-layout">
      <aside className="sidebar-card reader-sidebar">
        <h2>图片课件阅读器</h2>
        <select value={topic.id} onChange={(event) => onSelectTopic(event.target.value)}>
          {topics.map((item) => (
            <option key={item.id} value={item.id}>
              {item.order}：{item.title}
            </option>
          ))}
        </select>
        <div className="mini-page-grid">
          {topic.pages.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.pageNumber === page.pageNumber ? "active" : ""}
              onClick={() => onSelectPage(item.pageNumber)}
            >
              {String(item.pageNumber).padStart(2, "0")}
            </button>
          ))}
        </div>
        <div className="reader-tools">
          <button type="button" onClick={() => onToggleLearned(pageKey)}>
            {learned.includes(pageKey) ? "取消已学习" : "标记已学习"}
          </button>
          <button type="button" className="ghost" onClick={() => onToggleFavorite(pageKey)}>
            {favorites.includes(pageKey) ? "取消收藏" : "收藏页面"}
          </button>
        </div>
      </aside>

      <section className="reader-main">
        <div className="reader-title">
          <div>
            <p className="eyebrow">
              {topic.order} · 第 {page.pageNumber} 页
            </p>
            <h2>{page.title}</h2>
          </div>
          <div className="reader-pager">
            <button
              type="button"
              disabled={page.pageNumber === 1}
              onClick={() => onSelectPage(page.pageNumber - 1)}
            >
              上一页
            </button>
            <button
              type="button"
              disabled={page.pageNumber === 10}
              onClick={() => onSelectPage(page.pageNumber + 1)}
            >
              下一页
            </button>
          </div>
        </div>
        <PageImage page={page} className="large-page-image" />
        <label className="note-box">
          <span>学习笔记</span>
          <textarea
            value={note}
            placeholder="记录这页的一眼识别特征、关键词或课堂补充。"
            onChange={(event) => onUpdateNote(pageKey, event.target.value)}
          />
        </label>
      </section>
    </main>
  );
}

function Timeline() {
  return (
    <main className="content-card">
      <p className="eyebrow">Timeline</p>
      <h2>美术史主线时间轴</h2>
      <div className="timeline">
        {timeline.map((item, index) => (
          <React.Fragment key={item}>
            <div className="timeline-node">
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
            {index < timeline.length - 1 && <div className="timeline-arrow">↓</div>}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}

function Compare() {
  return (
    <main className="stack">
      {comparisonTables.map((table) => (
        <section className="content-card" key={table.title}>
          <p className="eyebrow">Style Comparison</p>
          <h2>{table.title}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {table.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
}

function Quiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answered, setAnswered] = useState(false);
  const [stats, setStats] = useState(() => readStorage(storageKeys.quiz, { correct: 0, total: 0 }));
  const question = quizQuestions[index];
  const isCorrect = selected === question.answer;
  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  useEffect(() => {
    writeStorage(storageKeys.quiz, stats);
  }, [stats]);

  const submit = (option) => {
    if (answered) return;
    const correct = option === question.answer;
    setSelected(option);
    setAnswered(true);
    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const next = () => {
    setIndex((value) => (value + 1) % quizQuestions.length);
    setSelected("");
    setAnswered(false);
  };

  return (
    <main className="content-card quiz-card">
      <p className="eyebrow">Image Recognition Training</p>
      <h2>看图识别训练</h2>
      <div className="quiz-meta">
        <span>
          第 {index + 1} / {quizQuestions.length} 题
        </span>
        <span>
          累计正确率：{accuracy}%（{stats.correct}/{stats.total}）
        </span>
      </div>
      <h3>{question.prompt}</h3>
      <div className="option-grid">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            className={
              answered && option === question.answer
                ? "correct"
                : answered && option === selected
                  ? "wrong"
                  : ""
            }
            onClick={() => submit(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {answered && (
        <div className={isCorrect ? "answer-panel correct-panel" : "answer-panel wrong-panel"}>
          <strong>{isCorrect ? "判断正确" : "判断错误"}</strong>
          <p>正确答案：{question.answer}</p>
          <p>{question.explanation}</p>
          <button type="button" onClick={next}>
            下一题
          </button>
        </div>
      )}
    </main>
  );
}

function Search({ onOpenReader }) {
  const [query, setQuery] = useState("");
  const allPages = useMemo(getAllPages, []);
  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? allPages.filter((page) => {
        const haystack = [
          page.title,
          page.topic.title,
          page.topic.description,
          ...page.keywords,
        ].join(" ");
        return haystack.toLowerCase().includes(normalized);
      })
    : [];

  return (
    <main className="content-card">
      <p className="eyebrow">Search</p>
      <h2>搜索功能</h2>
      <input
        className="search-input"
        value={query}
        placeholder="搜索：史前艺术、洞穴壁画、古埃及、哥特、文艺复兴、透视法……"
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="term-cloud">
        {searchableTerms.map((term) => (
          <button key={term} type="button" onClick={() => setQuery(term)}>
            {term}
          </button>
        ))}
      </div>
      <div className="search-results">
        {normalized && results.length === 0 && <p className="muted">没有找到匹配内容。</p>}
        {results.map((page) => (
          <button
            type="button"
            key={page.id}
            className="page-row"
            onClick={() => onOpenReader(page.topicId, page.pageNumber)}
          >
            <span className="page-number">{page.pageNumber}</span>
            <span>
              <strong>{page.topic.title} · {page.title}</strong>
              <small>{page.image}</small>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}

function Progress({ learned, favorites, notes, totalPages, onOpenReader }) {
  const allPages = useMemo(getAllPages, []);
  const noteEntries = Object.entries(notes).filter(([, value]) => value.trim());

  return (
    <main className="stack">
      <section className="content-card">
        <p className="eyebrow">Learning Record</p>
        <h2>学习进度记录</h2>
        <div className="stats-grid">
          <div>
            <strong>{learned.length}</strong>
            <span>/ {totalPages} 已学习</span>
          </div>
          <div>
            <strong>{favorites.length}</strong>
            <span>收藏页</span>
          </div>
          <div>
            <strong>{noteEntries.length}</strong>
            <span>笔记页</span>
          </div>
        </div>
      </section>

      <section className="content-card">
        <h2>收藏功能</h2>
        <div className="page-list">
          {favorites.length === 0 && <p className="muted">还没有收藏页面。</p>}
          {favorites.map((key) => {
            const page = allPages.find((item) => getPageKey(item.topicId, item.pageNumber) === key);
            if (!page) return null;
            return (
              <button
                type="button"
                className="page-row"
                key={key}
                onClick={() => onOpenReader(page.topicId, page.pageNumber)}
              >
                <span className="page-number">{page.pageNumber}</span>
                <span>
                  <strong>{page.topic.title} · {page.title}</strong>
                  <small>{page.image}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="content-card">
        <h2>学习笔记功能</h2>
        <div className="note-list">
          {noteEntries.length === 0 && <p className="muted">还没有学习笔记。</p>}
          {noteEntries.map(([key, value]) => {
            const page = allPages.find((item) => getPageKey(item.topicId, item.pageNumber) === key);
            return (
              <article key={key} className="note-entry">
                <strong>{page ? `${page.topic.title} · ${page.title}` : key}</strong>
                <p>{value}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ImageDetect() {
  const [results, setResults] = useState([]);
  const expectedImages = useMemo(
    () =>
      topics.flatMap((topic) =>
        topic.pages.map((page) => ({
          topicId: topic.id,
          pageNumber: page.pageNumber,
          path: page.image,
        })),
      ),
    [],
  );

  const runDetection = () => {
    Promise.all(
      expectedImages.map(
        (item) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve({ ...item, ok: true });
            image.onerror = () => resolve({ ...item, ok: false });
            image.src = item.path;
          }),
      ),
    ).then(setResults);
  };

  useEffect(() => {
    runDetection();
  }, []);

  const missing = results.filter((item) => !item.ok);

  return (
    <main className="content-card">
      <p className="eyebrow">Image Check</p>
      <h2>图片检测功能</h2>
      <p className="lead">当前仅检测三个专题的 page01-page10。</p>
      <button type="button" onClick={runDetection}>
        重新检测图片
      </button>
      <div className="detect-grid">
        {results.map((item) => {
          const pageCode = `page${String(item.pageNumber).padStart(2, "0")}`;
          return (
            <div key={item.path} className={item.ok ? "detect-ok" : "detect-missing"}>
              {item.ok ? "正常：" : `图片缺失：请放入 public/art/${item.topicId}/${pageCode}.png`}
              {item.ok && ` ${item.topicId}/${pageCode}.png`}
            </div>
          );
        })}
      </div>
      {results.length > 0 && missing.length === 0 && (
        <p className="success-message">30 张图片全部检测通过。</p>
      )}
    </main>
  );
}

function App() {
  const [activeView, setActiveView] = useState("home");
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0].id);
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [learned, setLearned] = useState(() => readStorage(storageKeys.learned, []));
  const [favorites, setFavorites] = useState(() => readStorage(storageKeys.favorites, []));
  const [notes, setNotes] = useState(() => readStorage(storageKeys.notes, {}));
  const totalPages = topics.length * 10;

  useEffect(() => writeStorage(storageKeys.learned, learned), [learned]);
  useEffect(() => writeStorage(storageKeys.favorites, favorites), [favorites]);
  useEffect(() => writeStorage(storageKeys.notes, notes), [notes]);

  const openReader = (topicId, pageNumber) => {
    setSelectedTopicId(topicId);
    setSelectedPageNumber(pageNumber);
    setActiveView("reader");
  };

  const toggleValue = (list, setter, key) => {
    setter(list.includes(key) ? list.filter((item) => item !== key) : [...list, key]);
  };

  const updateNote = (key, value) => {
    setNotes((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="app-shell">
      <Header activeView={activeView} onNavigate={setActiveView} />
      {activeView === "home" && (
        <Home
          learnedCount={learned.length}
          totalPages={totalPages}
          onOpenTopic={(topicId) => {
            setSelectedTopicId(topicId);
            setActiveView("topics");
          }}
          onOpenReader={openReader}
        />
      )}
      {activeView === "topics" && (
        <TopicLearning
          selectedTopicId={selectedTopicId}
          learned={learned}
          favorites={favorites}
          onSelectTopic={setSelectedTopicId}
          onOpenReader={openReader}
        />
      )}
      {activeView === "reader" && (
        <Reader
          selectedTopicId={selectedTopicId}
          selectedPageNumber={selectedPageNumber}
          learned={learned}
          favorites={favorites}
          notes={notes}
          onSelectTopic={(topicId) => {
            setSelectedTopicId(topicId);
            setSelectedPageNumber(1);
          }}
          onSelectPage={setSelectedPageNumber}
          onToggleLearned={(key) => toggleValue(learned, setLearned, key)}
          onToggleFavorite={(key) => toggleValue(favorites, setFavorites, key)}
          onUpdateNote={updateNote}
        />
      )}
      {activeView === "timeline" && <Timeline />}
      {activeView === "compare" && <Compare />}
      {activeView === "quiz" && <Quiz />}
      {activeView === "search" && <Search onOpenReader={openReader} />}
      {activeView === "progress" && (
        <Progress
          learned={learned}
          favorites={favorites}
          notes={notes}
          totalPages={totalPages}
          onOpenReader={openReader}
        />
      )}
      {activeView === "detect" && <ImageDetect />}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
