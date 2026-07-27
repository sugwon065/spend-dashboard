"use client";

import { useEffect, useMemo, useState } from "react";
import spendData from "./data/spend-data.example.json";

const REFERENCE_WIDTH = 2005;
const REFERENCE_HEIGHT = 1200;
const VIEWPORT_GUTTER = 96;

type Transaction = {
  dateTime: string;
  month: string;
  source: string;
  id: string;
  description: string;
  category: string;
  amount: number;
};

type CategoryDatum = {
  name: string;
  amount: number;
  color: string;
};

const transactions = (spendData.transactions as Transaction[]).filter(
  (item) => item.category !== "여행·숙박",
);
const latestMonth = spendData.meta.latestMonth;
const months = spendData.meta.months;
const selectableMonths = months.filter((month) => {
  const monthNumber = Number(month.slice(5));
  return monthNumber >= 1 && monthNumber <= 6;
});
const chartMonths = selectableMonths;
const initialMonth =
  selectableMonths[selectableMonths.length - 1] ?? latestMonth;

const categoryColors: Record<string, string> = {
  "생활·기타": "#3082F7",
  "교육/여가": "#8E6CED",
  교통: "#24BBBC",
  식비: "#FDBC37",
  카페: "#F96965",
  "간편결제·선불": "#3EBC68",
};

const categoryStrokeColors: Record<string, string> = {
  "생활·기타": "#086FEA",
  "교육/여가": "#6848D8",
  교통: "#128B8C",
  식비: "#D88D00",
  카페: "#DD3734",
  "간편결제·선불": "#238E49",
};

const categories = [
  "생활·기타",
  "교육/여가",
  "교통",
  "식비",
  "카페",
  "간편결제·선불",
];

const formatWon = (value: number) =>
  `${Math.round(value).toLocaleString("ko-KR")}원`;

const formatCompactWon = (value: number) => {
  if (Math.abs(value) >= 10000) {
    const compact = Math.round((value / 10000) * 10) / 10;
    return `${compact.toLocaleString("ko-KR")}만`;
  }
  return value.toLocaleString("ko-KR");
};

const formatRoundedManWon = (value: number) => {
  const manWon = Math.round(value / 10000);
  return `${manWon.toLocaleString("ko-KR")}만원`;
};

const formatDecimalManWon = (value: number) => {
  const manWon = Math.round((value / 10000) * 10) / 10;
  return `${manWon.toLocaleString("ko-KR")}만원`;
};

const monthLabel = (month: string) => `${Number(month.slice(5))}월`;

const longMonthLabel = (month: string) =>
  `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`;

const sumTransactions = (items: Transaction[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

const polarPoint = (angle: number, radius: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 120 + radius * Math.cos(radians),
    y: 120 + radius * Math.sin(radians),
  };
};

const createDonutPath = (startAngle: number, endAngle: number) => {
  const safeEndAngle = Math.min(endAngle, startAngle + 359.999);
  const outerStart = polarPoint(startAngle, 108);
  const outerEnd = polarPoint(safeEndAngle, 108);
  const innerEnd = polarPoint(safeEndAngle, 62);
  const innerStart = polarPoint(startAngle, 62);
  const largeArc = safeEndAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A 108 108 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A 62 62 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
};

function Trend({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) {
    return <span className="trend neutral">전월 비교 없음</span>;
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return (
    <span className={`trend ${direction}`}>
      전월 대비{" "}
      <strong>
        {direction === "up" ? "▲" : direction === "down" ? "▼" : "−"}{" "}
        {Math.abs(change).toFixed(1)}%
      </strong>
    </span>
  );
}

function KpiCard({
  label,
  current,
  previous,
}: {
  label: string;
  current: number;
  previous: number;
}) {
  return (
    <article className="kpi-card">
      <div className="kpi-copy">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{formatWon(current)}</div>
        <Trend current={current} previous={previous} />
      </div>
    </article>
  );
}

function MonthlyChart({
  data,
  activeCategory,
  selectedMonth,
}: {
  data: { month: string; amount: number }[];
  activeCategory: string;
  selectedMonth: string;
}) {
  const maxValue = Math.max(...data.map((item) => item.amount), 1);
  const filteredBarColor =
    activeCategory === "전체" ? "#334E78" : categoryColors[activeCategory];
  const mutedBarBackground =
    activeCategory === "전체"
      ? "rgba(51, 78, 120, 0.34)"
      : `${filteredBarColor}61`;

  return (
    <div className="bar-chart monthly-chart" aria-label="월별 지출 금액 차트">
      <div className="y-guides" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="bars">
        {data.map((item) => {
          const isSelectedMonth = item.month === selectedMonth;

          return (
            <div
              className={`bar-column ${isSelectedMonth ? "selected-month" : ""}`}
              key={item.month}
            >
              <span className="bar-value">
                {formatCompactWon(item.amount)}
              </span>
              <div
                className={`bar monthly-bar ${isSelectedMonth ? "" : "muted"}`}
                style={{
                  height: `${Math.max((item.amount / maxValue) * 100, item.amount ? 5 : 0)}%`,
                  background: isSelectedMonth
                    ? filteredBarColor
                    : mutedBarBackground,
                }}
              >
                {isSelectedMonth && (
                  <span className="current-month-badge">이번 달</span>
                )}
              </div>
              <span className="bar-label">{monthLabel(item.month)}</span>
            </div>
          );
        })}
      </div>
      <div className="chart-legend">
        {activeCategory === "전체"
          ? "월별 총지출액"
          : `${activeCategory} 월별 총지출액`}
      </div>
    </div>
  );
}

function DailyChart({
  data,
  activeCategory,
  selectedDay,
  onSelectDay,
}: {
  data: { day: number; amount: number }[];
  activeCategory: string;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}) {
  const maxValue = Math.max(...data.map((item) => item.amount), 1);
  const filteredBarColor =
    activeCategory === "전체" ? "#334E78" : categoryColors[activeCategory];

  return (
    <div className="daily-scroll">
      <div className="bar-chart daily-chart" aria-label="일별 소비액 차트">
        <div className="y-guides" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="bars">
          {data.map((item) => (
            <button
              type="button"
              className={`bar-column daily-day-button ${selectedDay === item.day ? "selected" : ""}`}
              key={item.day}
              onClick={() => onSelectDay(item.day)}
              aria-pressed={selectedDay === item.day}
              aria-label={`${item.day}일 지출 ${formatWon(item.amount)} 목록 보기`}
            >
              <span className="bar-value">
                {item.amount ? formatCompactWon(item.amount) : ""}
              </span>
              <div
                className="bar daily-bar"
                style={{
                  height: `${Math.max((item.amount / maxValue) * 100, item.amount ? 4 : 0)}%`,
                  background: filteredBarColor,
                }}
              />
              <span className="bar-label">{item.day}일</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [viewportScale, setViewportScale] = useState(1);

  useEffect(() => {
    const updateViewportScale = () => {
      const availableWidth = Math.max(window.innerWidth - VIEWPORT_GUTTER, 320);
      const availableHeight = Math.max(window.innerHeight - VIEWPORT_GUTTER, 240);
      setViewportScale(
        Math.min(
          availableWidth / REFERENCE_WIDTH,
          availableHeight / REFERENCE_HEIGHT,
        ),
      );
    };

    updateViewportScale();
    window.addEventListener("resize", updateViewportScale);
    return () => window.removeEventListener("resize", updateViewportScale);
  }, []);

  useEffect(() => {
    if (!guideOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setGuideOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guideOpen]);

  const currentMonthTransactions = useMemo(
    () => transactions.filter((item) => item.month === selectedMonth),
    [selectedMonth],
  );

  const previousMonthTransactions = useMemo(
    () => {
      const selectedIndex = months.indexOf(selectedMonth);
      if (selectedIndex <= 0) return [];
      const previousSelectedMonth = months[selectedIndex - 1];
      return transactions.filter(
        (item) => item.month === previousSelectedMonth,
      );
    },
    [selectedMonth],
  );

  const kpis = useMemo(() => {
    const definitions = [
      { label: "총지출", category: null },
      { label: "식비", category: "식비" },
      { label: "교통", category: "교통" },
      {
        label: "기타",
        category: "생활·기타",
      },
    ];

    return definitions.map((definition) => {
      const current = currentMonthTransactions.filter(
        (item) =>
          definition.category === null ||
          item.category === definition.category,
      );
      const previous = previousMonthTransactions.filter(
        (item) =>
          definition.category === null ||
          item.category === definition.category,
      );
      return {
        ...definition,
        current: sumTransactions(current),
        previous: sumTransactions(previous),
      };
    });
  }, [currentMonthTransactions, previousMonthTransactions]);

  const categoryData = useMemo<CategoryDatum[]>(
    () =>
      categories
        .map((category) => ({
          name: category,
          amount: sumTransactions(
            currentMonthTransactions.filter(
              (item) => item.category === category,
            ),
          ),
          color: categoryColors[category],
        }))
        .sort(
          (a, b) =>
            b.amount - a.amount ||
            categories.indexOf(a.name) - categories.indexOf(b.name),
        ),
    [currentMonthTransactions],
  );

  const positiveCategoryTotal = categoryData.reduce(
    (sum, item) => sum + Math.max(item.amount, 0),
    0,
  );

  const donutSegments = useMemo(() => {
    let startAngle = 0;

    return categoryData
      .map((item) => {
        const percent =
          positiveCategoryTotal === 0
            ? 0
            : (Math.max(item.amount, 0) / positiveCategoryTotal) * 100;
        const endAngle = startAngle + percent * 3.6;
        const middleAngle = (startAngle + endAngle) / 2;
        const labelPoint = polarPoint(middleAngle, 85);
        const explodeRadians = ((middleAngle - 90) * Math.PI) / 180;
        const segment = {
          ...item,
          percent,
          path: createDonutPath(startAngle, endAngle),
          labelX: labelPoint.x,
          labelY: labelPoint.y,
          explodeX: Math.cos(explodeRadians) * 6,
          explodeY: Math.sin(explodeRadians) * 6,
        };
        startAngle = endAngle;
        return segment;
      })
      .filter((item) => item.percent > 0);
  }, [categoryData, positiveCategoryTotal]);

  const insightItems = useMemo(() => {
    const hasPreviousMonth = months.indexOf(selectedMonth) > 0;
    const currentTotal = sumTransactions(currentMonthTransactions);
    const previousTotal = sumTransactions(previousMonthTransactions);
    const formatChangeRate = (current: number, previous: number) =>
      previous === 0
        ? null
        : (Math.abs(current - previous) / Math.abs(previous)) * 100;

    const totalChangeRate = formatChangeRate(currentTotal, previousTotal);
    const totalDirection =
      currentTotal > previousTotal
        ? "증가"
        : currentTotal < previousTotal
          ? "감소"
          : "변동이 없";
    const totalContent =
      !hasPreviousMonth || totalChangeRate === null ? (
        <>이번 달 총지출은 {formatRoundedManWon(currentTotal)}이며 전월 비교 데이터가 없습니다.</>
      ) : totalChangeRate === 0 ? (
        <>이번 달 총지출은 {formatRoundedManWon(currentTotal)}으로 전월과 같습니다.</>
      ) : (
        <>
          이번 달 총지출은 {formatRoundedManWon(currentTotal)}으로 전월 대비{" "}
          <strong
            className={
              totalDirection === "증가"
                ? "insight-increase"
                : "insight-decrease"
            }
          >
            {totalChangeRate.toFixed(1)}% {totalDirection}
          </strong>
          했습니다.
        </>
      );

    const categoryChanges = categories
      .map((category) => {
        const current = sumTransactions(
          currentMonthTransactions.filter((item) => item.category === category),
        );
        const previous = sumTransactions(
          previousMonthTransactions.filter(
            (item) => item.category === category,
          ),
        );
        return { name: category, change: current - previous };
      })
      .sort((a, b) => b.change - a.change);
    const mostIncreased = categoryChanges.find((item) => item.change > 0);
    const mostDecreased = [...categoryChanges]
      .reverse()
      .find((item) => item.change < 0);
    const leastIncreased = [...categoryChanges]
      .filter((item) => item.change > 0)
      .sort((a, b) => a.change - b.change)[0];

    let categoryChangeContent = <>전월 카테고리 비교 데이터가 없습니다.</>;
    if (hasPreviousMonth) {
      if (mostDecreased) {
        categoryChangeContent = (
          <>
            {mostIncreased ? (
              <>
                가장 많이 증가한 {mostIncreased.name} 지출은{" "}
                <strong className="insight-increase">
                  {formatDecimalManWon(mostIncreased.change)} 증가
                </strong>
                했고,{" "}
              </>
            ) : (
              <>증가한 지출은 없었고, </>
            )}
            가장 많이 감소한 {mostDecreased.name} 지출은{" "}
            <strong className="insight-decrease">
              {formatDecimalManWon(Math.abs(mostDecreased.change))} 감소
            </strong>
            했습니다.
          </>
        );
      } else if (leastIncreased) {
        categoryChangeContent = (
          <>
            가장 많이 증가한 {mostIncreased?.name} 지출은{" "}
            <strong className="insight-increase">
              {formatDecimalManWon(mostIncreased?.change ?? 0)} 증가
            </strong>
            했고, 가장 덜 증가한 {leastIncreased.name} 지출은{" "}
            <strong className="insight-increase">
              {formatDecimalManWon(leastIncreased.change)} 증가
            </strong>
            했습니다.
          </>
        );
      } else {
        categoryChangeContent = <>카테고리별 지출은 전월과 같습니다.</>;
      }
    }

    const largestCategory = categoryData[0];
    const largestPercent =
      largestCategory && positiveCategoryTotal > 0
        ? (Math.max(largestCategory.amount, 0) / positiveCategoryTotal) * 100
        : 0;
    const largestCategoryContent =
      largestCategory && positiveCategoryTotal > 0 ? (
        <>
          가장 큰 지출 비중은{" "}
          <strong style={{ color: categoryColors[largestCategory.name] }}>
            {largestCategory.name}({largestPercent.toFixed(0)}%)
          </strong>
          입니다.
        </>
      ) : (
        <>이번 달 지출 내역이 없습니다.</>
      );

    const currentCount = currentMonthTransactions.length;
    const previousCount = previousMonthTransactions.length;
    const countChangeRate = formatChangeRate(currentCount, previousCount);
    const countDirection =
      currentCount > previousCount
        ? "증가"
        : currentCount < previousCount
          ? "감소"
          : "변동이 없";
    const countContent =
      !hasPreviousMonth || countChangeRate === null ? (
        <>이번 달 거래건수는 {currentCount.toLocaleString("ko-KR")}건이며 전월 비교 데이터가 없습니다.</>
      ) : countChangeRate === 0 ? (
        <>이번 달 거래건수는 {currentCount.toLocaleString("ko-KR")}건으로 전월과 같습니다.</>
      ) : (
        <>
          이번 달 거래건수는 {currentCount.toLocaleString("ko-KR")}건으로 전월 대비{" "}
          <strong
            className={
              countDirection === "증가"
                ? "insight-increase"
                : "insight-decrease"
            }
          >
            {countChangeRate.toFixed(1)}% {countDirection}
          </strong>
          했습니다.
        </>
      );

    return [
      {
        id: "total",
        icon: totalDirection === "감소" ? "↘" : "↗",
        tone: totalDirection === "감소" ? "positive" : "negative",
        content: totalContent,
      },
      {
        id: "category-change",
        icon: "⇅",
        tone: "compare",
        content: categoryChangeContent,
      },
      {
        id: "largest-share",
        icon: "★",
        tone: "share",
        content: largestCategoryContent,
      },
      {
        id: "transaction-count",
        icon: "✓",
        tone: countDirection === "감소" ? "positive" : "compare",
        content: countContent,
      },
    ];
  }, [
    categoryData,
    currentMonthTransactions,
    positiveCategoryTotal,
    previousMonthTransactions,
    selectedMonth,
  ]);

  const filteredTransactions = useMemo(
    () =>
      currentMonthTransactions
        .filter((item) => {
          const matchesCategory =
            activeCategory === "전체" || item.category === activeCategory;
          const matchesDay =
            selectedDay === null ||
            Number(item.dateTime.slice(8, 10)) === selectedDay;
          return matchesCategory && matchesDay;
        })
        .sort((a, b) => a.dateTime.localeCompare(b.dateTime)),
    [activeCategory, currentMonthTransactions, selectedDay],
  );

  const monthlyData = useMemo(
    () =>
      chartMonths.map((month) => ({
        month,
        amount: sumTransactions(
          transactions.filter(
            (item) =>
              item.month === month &&
              (activeCategory === "전체" ||
                item.category === activeCategory),
          ),
        ),
      })),
    [activeCategory],
  );

  const dailyData = useMemo(
    () =>
      Array.from({ length: 31 }, (_, index) => {
        const day = index + 1;
        return {
          day,
          amount: sumTransactions(
            currentMonthTransactions.filter((item) => {
              const itemDay = Number(item.dateTime.slice(8, 10));
              return (
                itemDay === day &&
                (activeCategory === "전체" ||
                  item.category === activeCategory)
              );
            }),
          ),
        };
      }),
    [activeCategory, currentMonthTransactions],
  );

  const toggleCategory = (category: string) => {
    setActiveCategory((current) =>
      current === category ? "전체" : category,
    );
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setActiveCategory("전체");
    setSelectedDay(null);
    setExpanded(false);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay((current) => (current === day ? null : day));
    setExpanded(false);
  };

  const renderCategoryHeading = (suffix: string, prefix = "") => (
    <h2>
      {prefix}
      {activeCategory !== "전체" && (
        <>
          <span style={{ color: categoryColors[activeCategory] }}>
            {activeCategory}
          </span>{" "}
        </>
      )}
      {suffix}
    </h2>
  );

  const renderTransactionHeading = () =>
    selectedDay === null ? (
      renderCategoryHeading("지출 금액 리스트")
    ) : (
      <h2>
        <span className="selected-day-title">
          {Number(selectedMonth.slice(5))}/{selectedDay}
        </span>{" "}
        지출 금액 리스트
      </h2>
    );

  return (
    <div
      className="viewport-stage"
      style={{
        width: `${REFERENCE_WIDTH * viewportScale}px`,
        height: `${REFERENCE_HEIGHT * viewportScale}px`,
      }}
    >
      <main
        className="app-shell"
        style={{ transform: `scale(${viewportScale})` }}
      >
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">₩</div>
          <div>
            <strong>지출 내역</strong>
            <span>한눈에 보는 소비 흐름</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="주요 메뉴">
          <a className="active" href="#dashboard">
            <span className="side-icon side-icon-dashboard" aria-hidden="true" /> 대시보드
          </a>
          <button type="button" onClick={() => setGuideOpen(true)}>
            <span className="side-icon side-icon-guide" aria-hidden="true" /> 사용법
          </button>
        </nav>

        <section className="sidebar-note" id="about">
          <span className="note-kicker">ABOUT</span>
          <strong>순수지출 데이터 리포트</strong>
          <p>대분류별 소비 흐름을 월별·일별로 확인합니다.</p>
          <a
            className="readme-button"
            href="https://github.com/sugwon065/spend-dashboard/blob/main/README.md"
            target="_blank"
            rel="noreferrer"
          >
            GitHub README ↗
          </a>
        </section>

        <div className="sidebar-profile">
          <div className="profile-avatar">J</div>
          <div>
            <strong>소비 리포트</strong>
            <span>2026년 데이터</span>
          </div>
        </div>
      </aside>

      <section className="dashboard" id="dashboard">
        <header className="dashboard-header">
          <div className="header-title-group">
            <label className="month-selector-square">
              <span className="sr-only">조회 월 선택</span>
              <select
                value={selectedMonth}
                onChange={(event) => handleMonthChange(event.target.value)}
                aria-label="조회 월 선택"
              >
                {selectableMonths.map((month) => (
                  <option value={month} key={month}>
                    {monthLabel(month)}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <p className="eyebrow">SPENDING OVERVIEW</p>
              <h1>지출 내역</h1>
            </div>
          </div>
          <div className="header-controls">
            <label className="filter-control">
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                aria-label="대분류 필터"
              >
                <option value="전체">전체 대분류</option>
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <section className="kpi-grid" aria-label="주요 지출 지표">
          {kpis.map((item) => (
            <KpiCard key={item.label} {...item} />
          ))}
        </section>

        <section className="dashboard-grid top-grid">
          <article className="panel category-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">{monthLabel(selectedMonth)} 기준</p>
                <h2>영역별 지출 비중</h2>
              </div>
            </div>
            <div className="category-content">
              <div
                className="donut-chart"
                role="group"
                aria-label="대분류 지출 비중 도넛 그래프"
              >
                <svg
                  viewBox="0 0 240 240"
                  aria-label={`${monthLabel(selectedMonth)} 대분류 지출 비중`}
                >
                  {donutSegments.map((segment) => {
                    const selected = activeCategory === segment.name;
                    return (
                      <g
                        className={`donut-segment ${selected ? "selected" : ""}`}
                        key={segment.name}
                        transform={
                          selected
                            ? `translate(${segment.explodeX} ${segment.explodeY})`
                            : undefined
                        }
                      >
                        <path
                          d={segment.path}
                          fill={segment.color}
                          stroke={
                            selected
                              ? categoryStrokeColors[segment.name]
                              : undefined
                          }
                          role="button"
                          tabIndex={0}
                          aria-label={`${segment.name} ${segment.percent.toFixed(0)}%`}
                          onClick={() => toggleCategory(segment.name)}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" ||
                              event.key === " "
                            ) {
                              event.preventDefault();
                              toggleCategory(segment.name);
                            }
                          }}
                        />
                        {segment.percent >= 9 && (
                          <text
                            className="donut-percent"
                            x={segment.labelX}
                            y={segment.labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {segment.percent.toFixed(0)}%
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <circle
                    className="donut-center-circle"
                    cx="120"
                    cy="120"
                    r="60"
                  />
                  <text
                    className="donut-center-label"
                    x="120"
                    y="111"
                    textAnchor="middle"
                  >
                    총지출
                  </text>
                  <text
                    className="donut-center-value"
                    x="120"
                    y="137"
                    textAnchor="middle"
                  >
                    {formatRoundedManWon(
                      sumTransactions(currentMonthTransactions),
                    )}
                  </text>
                </svg>
              </div>
              <div className="category-legend">
                {categoryData.map((item) => {
                  const percent =
                    positiveCategoryTotal === 0
                      ? 0
                      : (Math.max(item.amount, 0) / positiveCategoryTotal) *
                        100;
                  return (
                    <button
                      key={item.name}
                      className={
                        activeCategory === item.name ? "selected" : ""
                      }
                      onClick={() => toggleCategory(item.name)}
                    >
                      <span
                        className="legend-dot"
                        style={{ background: item.color }}
                      />
                      <strong>{item.name}</strong>
                      <span>{percent.toFixed(0)}%</span>
                      <b>{formatWon(item.amount)}</b>
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <article
            className={`panel transactions-panel ${expanded ? "is-expanded" : ""}`}
          >
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">
                  {activeCategory === "전체"
                    ? "전체 대분류"
                    : activeCategory}
                </p>
                {renderTransactionHeading()}
              </div>
              <span className="result-count">
                {filteredTransactions.length}건
              </span>
            </div>
            <div
              className={`transaction-table-wrap ${expanded ? "expanded" : ""}`}
            >
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>카테고리</th>
                    <th>내역</th>
                    <th>결제수단</th>
                    <th>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.dateTime.slice(5, 10).replace("-", "/")}</td>
                      <td>
                        <span
                          className="category-pill"
                          style={{
                            color: categoryColors[item.category],
                            background: `${categoryColors[item.category]}18`,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td title={item.description}>{item.description}</td>
                      <td>{item.source}</td>
                      <td>{formatWon(item.amount)}</td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td className="empty-state" colSpan={5}>
                        선택한 조건의 지출 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length > 5 && (
              <button
                className="expand-button"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? "접기" : "더보기"}
              </button>
            )}
          </article>
        </section>

        <section className="dashboard-grid middle-grid">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">
                  {activeCategory === "전체"
                    ? "전체 지출"
                    : activeCategory}
                </p>
                {renderCategoryHeading("지출 금액", "월별 ")}
              </div>
            </div>
            <MonthlyChart
              data={monthlyData}
              activeCategory={activeCategory}
              selectedMonth={selectedMonth}
            />
          </article>

          <article className="panel insight-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">{monthLabel(selectedMonth)} 분석</p>
                <h2>전월 대비 인사이트</h2>
              </div>
              <span className="insight-bulb">✦</span>
            </div>
            <div className="insight-list">
              {insightItems.map((item) => (
                <div className="insight-item" key={item.id}>
                  <span className={`insight-icon ${item.tone}`}>
                    {item.icon}
                  </span>
                  <p>{item.content}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel daily-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">
                {longMonthLabel(selectedMonth)}
              </p>
              {renderCategoryHeading("일별 지출 금액")}
            </div>
          </div>
          <DailyChart
            data={dailyData}
            activeCategory={activeCategory}
            selectedDay={selectedDay}
            onSelectDay={handleDaySelect}
          />
        </section>

        <footer>
          <span>Source · 가상 예시 데이터 / 순수지출 형식</span>
          <span>정적 데이터 기준 · 2026-07-26</span>
        </footer>
      </section>
      {guideOpen && (
        <div
          className="guide-overlay"
          role="presentation"
          onMouseDown={() => setGuideOpen(false)}
        >
          <section
            className="guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="guide-modal-heading">
              <div>
                <p className="panel-kicker">GUIDE</p>
                <h2 id="guide-title">사용법</h2>
              </div>
              <button
                type="button"
                className="guide-close"
                onClick={() => setGuideOpen(false)}
                aria-label="사용법 닫기"
              >
                ×
              </button>
            </div>
            <div className="guide-modal-content">
              <article>
                <strong>데이터 설명</strong>
                <p>
                  <span className="guide-highlight">2026년 1월 1일부터 2026년 6월 30일</span>까지 6개월간 정리한 순수 지출 내역입니다.
                  <br />
                  지출은 식비, 간편결제·선불, 카페, 교육/여가, 교통, 생활·기타 대분류로 나누어 확인할 수 있습니다.
                </p>
              </article>
              <article>
                <strong>월 필터</strong>
                <div className="guide-card-placeholder" aria-hidden="true">
                  <span>6월</span>
                  <b>월을 선택하세요</b>
                </div>
                <p>월 선택 박스를 누르면 1월부터 6월까지 원하는 지출 내역으로 화면을 전환할 수 있습니다.</p>
              </article>
              <article>
                <strong>대분류 필터</strong>
                <div className="guide-card-placeholder" aria-hidden="true">
                  <span>37%</span>
                  <b>도넛 또는 범례를 선택하세요</b>
                </div>
                <p>도넛 그래프나 범례를 클릭하면 선택한 대분류 기준으로 차트와 지출 리스트가 함께 바뀝니다.</p>
              </article>
              <article>
                <strong>일 필터</strong>
                <div className="guide-card-placeholder" aria-hidden="true">
                  <span>1일</span>
                  <b>일별 막대를 선택하세요</b>
                </div>
                <p>일별 지출 금액 막대를 클릭하면 해당 날짜의 지출 내역만 리스트에서 확인할 수 있습니다.</p>
              </article>
            </div>
          </section>
        </div>
      )}
      </main>
    </div>
  );
}
