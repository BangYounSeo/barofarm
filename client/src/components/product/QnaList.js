// QnaList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/AxiosConfig";
import "./detail.css";

const QnaList = () => {
    const [qnas, setQnas] = useState([]);
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        loadList();
    }, [sort, page]);

    const loadList = async () => {
        const res = await api.get(`/salesboard/qna/list?sort=${sort}&page=${page}`);
        setQnas(res.data.qnaList);
    };

    return (
        <div className="qna-page-wrapper">
            {/* 상단 버튼 영역 */}
            <div className="qna-page-top">
                <button
                    className="qna-write-btn"
                    onClick={() => navigate("/qna/write")}
                >
                    상품 Q&A 작성하기
                </button>
                <button
                    className="qna-my-btn"
                    onClick={() => navigate("/qna/my")}
                >
                    내 Q&A 보기
                </button>

                {/* 오른쪽 정렬 */}
                <select
                    className="qna-sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="latest">답변상태</option>
                    <option value="answered">답변완료</option>
                    <option value="pending">미답변</option>
                </select>
            </div>

            {/* Q&A 리스트 */}
            <table className="qna-table">
                <thead>
                    <tr>
                        <th>답변상태</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>날짜</th>
                    </tr>
                </thead>
                <tbody>
                    {qnas.map(qna => (
                        <tr key={qna.numQna}>
                            <td>{qna.answer ? "답변완료" : "미답변"}</td>
                            <td>{qna.title}</td>
                            <td>{qna.writer?.name ?? "익명"}</td>
                            <td>{qna.created?.substring(0, 10)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="pagination">
                {[1, 2, 3, 4, 5].map((p) => (
                    <button
                        key={p}
                        className={page === p ? "active" : ""}
                        onClick={() => setPage(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QnaList;
