// ReviewSummary.js
import React from "react";
import "./detail.css";
import ChatIcon from '@mui/icons-material/Chat';

const ReviewSummary = ({ reviews }) => {

    if (!reviews || reviews.length === 0) {
        return (
            <div className="review-summary-empty">
                작성된 리뷰가 없습니다.
            </div>
        );
    }

    const total = reviews.length;

    const avg = reviews.reduce((acc, r) => acc + r.grade, 0) / total;

    // 👉 점수 분포 계산 (5~1점)
    const gradeCount = [5, 4, 3, 2, 1].map(num =>
        reviews.filter(r => r.grade === num).length
    );

    // 👉 키워드 추출
    const keywordList = [
        { key: "맛있", label: "맛있어요" },
        { key: "신선", label: "신선해요" },
        { key: "재구매", label: "재구매했어요" }
    ];

    const keywordCount = keywordList.map(kw => ({
        label: kw.label,
        count: reviews.filter(r => r.content.includes(kw.key)).length
    }));

    return (
        <div className="review-summary-wrapper" style={{ marginBottom: "50px" }}>

            {/* ⭐ 좌측 - 평균 */}
            <div className="review-summary-left" >
                <div className="summary-title" >사용자 총 평점</div>

                <div className="summary-stars-row" style={{ marginBottom: "22px" }}>
                    <div className="summary-stars">
                        {"⭐".repeat(Math.round(avg))}
                    </div>
                    <div className="summary-recent">최근 6개월 {avg.toFixed(2)}</div>
                </div>

                <div className="summary-avg-box">
                    <div className="summary-avg">{avg.toFixed(2)}</div>
                    <div className="summary-avg-small">/ 5</div>
                </div>
            </div>

            {/* ⭐ 가운데 - 전체 리뷰수 */}
            <div className="review-summary-center"
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

                <div className="summary-title" style={{ marginBottom: "8px" }}>
                    전체 리뷰수
                </div>
                <ChatIcon
                    sx={{ fontSize: 60, color: "#c9c9c9", marginTop: "18px" }}
                />
                <div className="summary-review-count">
                    {total.toLocaleString()}
                </div>
            </div>

            {/* ⭐ 오른쪽 - 평점 분포 (세로그래프 적용됨!) */}
            <div className="review-summary-right">
                <div className="summary-title">평점 비율</div>

                {/* -----------------------------
                    ⭐ 세로 그래프 박스 시작
                    (기존 가로 그래프 완전히 대체)
                ------------------------------ */}
                <div className="vertical-bar-container">
                    {[5, 4, 3, 2, 1].map((score, idx) => {
                        const count = gradeCount[idx];
                        const percent = (count / total) * 100;

                        return (
                            <div key={score} className="vertical-bar-item">

                                {/* 그래프 바 */}
                                <div className="vertical-bar-track">
                                    <div
                                        className="vertical-bar-fill"
                                        style={{ height: `${percent}%` }}
                                    ></div>
                                </div>

                                {/* 점수 / 퍼센트 표기 */}
                                <div className="vertical-bar-label">
                                    {score}점
                                </div>
                                <div className="vertical-bar-percent">
                                    {percent.toFixed(1)}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ⭐ 오른쪽 - 구매자 키워드 평가 */}
            <div className="review-summary-keywords">
                <div className="summary-title">다른 구매자들은 이렇게 평가했어요</div>

                <div className="keyword-list" style={{ marginRight: "20px" }}>
                    {keywordCount.map((k) => (
                        <div key={k.label} className="keyword-item">
                            <span>{k.label}</span>
                            <span className="keyword-count">{k.count}명</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ReviewSummary;
