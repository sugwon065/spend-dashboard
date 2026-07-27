# 지출 내역 대시보드

순수 지출 내역을 월별·일별로 확인하고 대분류 필터로 소비 흐름을 살펴볼 수 있는 정적 웹 대시보드입니다.

## 배포 페이지

[지출 내역 대시보드 열기](https://sugwo-spend-dashboard.sugwon065.chatgpt.site/)

## 주요 기능

- 1월부터 6월까지 월별 지출 조회
- 총지출·식비·교통·기타 KPI와 전월 비교
- 대분류별 지출 비중 도넛 차트
- 도넛 영역과 범례를 이용한 대분류 필터
- 월별·일별 지출 금액 차트
- 일별 막대를 이용한 날짜 필터
- 날짜순 지출 내역 목록과 전월 대비 인사이트
- 월 필터, 대분류 필터, 일 필터 사용법 안내

## 데이터 공개 범위

대시보드가 사용하는 정리된 JSON 데이터와 화면 이미지는 저장소에 포함되어 있습니다. 원본 Excel 파일은 공개하지 않습니다.

- 모든 `.xlsx` 파일은 Git에서 제외됩니다.
- 화면은 `app/data/spend-data.json`을 사용합니다.
- 원본 Excel 파일은 GitHub 커밋 기록에 포함되지 않습니다.

## 기술 구성

- React 19
- Next.js 16
- vinext / Vite
- TypeScript
- Pretendard

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

배포용 빌드는 다음 명령으로 확인할 수 있습니다.

```bash
npm run build
```

## 데이터 구조

대시보드 데이터는 `app/data/spend-data.json`에 있습니다.

```json
{
  "meta": {
    "latestMonth": "2026-06",
    "months": ["2026-01", "2026-02"],
    "categories": ["식비", "교통"]
  },
  "transactions": [
    {
      "dateTime": "2026-01-03 12:10",
      "month": "2026-01",
      "source": "샘플카드",
      "id": "sample-001",
      "description": "샘플 식사",
      "category": "식비",
      "amount": 12500
    }
  ]
}
```
