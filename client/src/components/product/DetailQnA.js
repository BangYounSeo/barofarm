import React, { useState, useContext } from "react";
import "./detail.css";
import { useNavigate, useParams } from "react-router-dom";
import { MemberContext } from "../member/login/MemberContext";
import { writeQnaAnswer, deleteQnaAnswer, deleteQna } from "../../service/QnaService";
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import BrowseGalleryRoundedIcon from '@mui/icons-material/BrowseGalleryRounded';

const DetailQnA = ({ qnas, producer, role, userId }) => {

    const { numBrd } = useParams(); //  상품번호 읽기
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const [answerText, setAnswerText] = useState({}); // 답변 입력 저장 객체

    //  판매자 여부 판단 로직
    const isSeller =
        producer?.member?.userId === userId ||  // 판매자 member.userId 비교
        producer?.userId === userId ||         // 혹시 producer.userId로 내려오는 경우
        qnas?.some(q => q.sellerId === userId); // QnA DTO에 포함된 sellerId 비교

    const toggleOpen = (i) => {
        setOpenIndex(openIndex === i ? null : i);
    };


    // ⭐ 답변 등록 함수
    const handleAnswerSubmit = async (numQna) => {
        if (!answerText[numQna] || answerText[numQna].trim() === "") {
            alert("답변을 입력해주세요!");
            return;
        }

        await writeQnaAnswer(numQna, answerText[numQna]);
        alert("답변이 등록되었습니다!");
        window.location.reload();
    };

    // ⭐ 문의글 삭제 함수 추가
    const handleDeleteQna = async (numQna) => {
        if (!window.confirm("해당 문의글을 삭제하시겠습니까?")) return;
        try {
            await deleteQna(numQna);
            alert("문의글이 삭제되었습니다.");
            window.location.reload();
        } catch (e) {
            alert("삭제 실패");
        }
    };

    const phone = producer?.callCenter;
    const start = producer?.startCall?.slice(0, 5);
    const end = producer?.endCall?.slice(0, 5);

    return (
        <div className="qna-wrapper">

            {phone && (
                <div className="qna-contact-box">
                    <div className="contact-left">
                        <p className="contact-row">
                            <span className="contact-label">
                                <PhoneRoundedIcon
                                    style={{ fontSize: "20px", marginRight: "10px", verticalAlign: "middle", color: "red" }} />
                                판매자 문의
                            </span>
                            <span className="contact-value">{phone}</span>
                        </p>

                        <p className="contact-row">
                            <span className="contact-label">
                                <BrowseGalleryRoundedIcon
                                    style={{ fontSize: "20px", marginRight: "10px", verticalAlign: "middle", color: "green" }} />
                                문의 가능 시간
                            </span>

                            <span className="contact-value">
                                {start} ~ {end}
                            </span>
                        </p>

                        {/* 안내 문구 추가 */}
                        <p className="contact-note">
                            상담 가능 시간 외에는 Q&A 게시판 이용부탁드립니다.
                        </p>
                    </div>

                    <a href={`tel:${phone}`} className="contact-call-btn">
                        전화하기
                    </a>
                </div>
            )}

            <h3 className="qna-title">
                상품 문의 ({qnas?.length || 0})
            </h3>

            {(!qnas || qnas.length === 0) ? (
                <div className="qna-empty">등록된 문의가 없습니다.</div>
            ) : (
                <ul className="qna-list">
                    {qnas.map((qna, index) => (
                        <li key={qna.numQna} className="qna-item">

                            {/* 질문 row */}
                            <div className="qna-question" onClick={() => toggleOpen(index)}>
                                <div className="q-left">
                                    <span className="q-label">Q</span>
                                    <span className="q-title">{qna.title || "상품 문의"}</span>
                                </div>

                                <div className="q-right">
                                    <span className={`q-status ${(qna.status === "Y") ? "done" : "wait"}`}>
                                        {qna.status === "Y" ? "답변완료" : "미답변"}
                                    </span>
                                </div>
                            </div>

                            {openIndex === index && (
                                <div className="qna-detail">
                                    <p className="qna-content">{qna.content}</p>

                                    <p className="qna-writer">
                                        작성자: {qna.writer ? qna.writer.name : "익명"} ｜{" "}
                                        {qna.created?.substring(0, 10)}
                                    </p>

                                    {/* ⭐ 판매자 문의글 삭제 버튼 추가 */}
                                    {/* 답변 여부 관계 없이 → 판매자이면 삭제 가능 */}
                                    {isSeller && (
                                        <button
                                            className="qna-question-delete-btn" // 기존 스타일과 동일로 사용 가능 (없다면 CSS 추후 수정)
                                            onClick={() => handleDeleteQna(qna.numQna)}
                                            style={{ marginBottom: "8px", color: "#d32f2f" }} // UI 영향 최소화
                                        >
                                            문의글 삭제
                                        </button>
                                    )}

                                    {/*  기존 답변 표시 */}
                                    {qna.answer && (
                                        <div className="qna-answer-box">
                                            <span className="a-label">A</span>
                                            <div>
                                                <p>{qna.answer}</p>
                                                <p className="qna-writer">
                                                    판매자 ｜ {qna.answerAt?.substring(0, 10)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/*  미답변 + 판매자 로그인 시 → 답변 입력 UI 표시 */}
                                    {!qna.answer && isSeller && userId && (
                                        <div className="qna-answer-write">
                                            <textarea
                                                className="qna-answer-textarea"
                                                placeholder="답변을 입력해주세요."
                                                onChange={(e) =>
                                                    setAnswerText({
                                                        ...answerText,
                                                        [qna.numQna]: e.target.value
                                                    })
                                                }
                                            />
                                            <div className="qna-answer-btn-box">
                                                <button
                                                    className="qna-answer-submit-btn"
                                                    onClick={() => handleAnswerSubmit(qna.numQna)}
                                                >
                                                    등록하기
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/*  답변 삭제  */}
                                    {qna.answer && qna.sellerId === userId && (
                                        <button
                                            className="answer-delete-btn"
                                            onClick={() => {
                                                if (window.confirm("답변을 삭제하시겠습니까?")) {
                                                    deleteQnaAnswer(qna.numQna)
                                                        .then(() => {
                                                            alert("답변이 삭제되었습니다!");
                                                            window.location.reload();
                                                        })
                                                        .catch(() => alert("삭제 실패"));
                                                }
                                            }}
                                        >
                                            삭제하기
                                        </button>
                                    )}

                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DetailQnA;