// MyQnaPage.js
import React, { useEffect, useState } from "react";
import api from "../../service/AxiosConfig";
import "./detail.css";

const MyQnaPage = () => {
    const [myQna, setMyQna] = useState([]);

    useEffect(() => {
        loadMyQna();
    }, []);

    const loadMyQna = async () => {
        const res = await api.get(`/salesboard/qna/my`);
        setMyQna(res.data.qnaList || []);
    };

    return (
        <div className="qna-page-wrapper">
            <h2>내 Q&A 목록</h2>

            <table className="qna-table">
                <thead>
                    <tr>
                        <th>답변상태</th>
                        <th>문의내용</th>
                        <th>작성일</th>
                    </tr>
                </thead>

                <tbody>
                    {myQna.length === 0 && (
                        <tr>
                            <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                                작성한 문의가 없습니다.
                            </td>
                        </tr>
                    )}

                    {myQna.map((qna) => (
                        <tr key={qna.numQna}>
                            <td>{qna.answer ? "답변완료" : "미답변"}</td>
                            <td>{qna.content}</td>
                            <td>{qna.created?.substring(0, 10)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyQnaPage;
